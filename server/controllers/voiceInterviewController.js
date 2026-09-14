/**
 * Voice Interview Controller — Whisper STT + GPT-4o + TTS
 *
 * Architecture (no Realtime API needed):
 *   POST /voice/start  → create Interview doc, return interviewId + sessionCap
 *   POST /voice/turn   → receive audio blob → Whisper STT → GPT-4o response → TTS audio
 *   POST /voice/end    → submit full transcript → existing scoring pipeline (unchanged)
 *
 * Each /voice/turn call:
 *   1. Transcribe candidate audio with Whisper (speech-to-text)
 *   2. Append to in-memory conversation history (stored server-side in a Map keyed by interviewId)
 *   3. Get next interviewer response from GPT-4o
 *   4. Convert response to speech via TTS
 *   5. Return { transcript: string, response: string, audioBase64: string }
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import os from 'os';
import Interview from '../models/Interview.js';
import { logChatCall, logVoiceSession } from '../services/aiCostLogger.js';
import { checkInterviewCredit } from '../middleware/aiRateLimit.js';
import { generateOverallFeedback } from '../services/aiQuestionService.js';

// ── OpenAI client (lazy init) ─────────────────────────────────────────────────
let openai = null;
const getOpenAI = () => {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
};

// ── Session cap per plan (seconds) ────────────────────────────────────────────
const SESSION_CAP_SECONDS = {
  free:   7  * 60,
  basic:  10 * 60,
  pro:    15 * 60,
  annual: 15 * 60,
};

// ── In-memory conversation store ──────────────────────────────────────────────
// Key: interviewId (string), Value: { messages: [], startTime: Date, setup: {} }
// Cleared on /voice/end or after 60 min TTL
const sessions = new Map();

// Cleanup stale sessions every 30 minutes
setInterval(() => {
  const cutoff = Date.now() - 60 * 60 * 1000;
  for (const [id, session] of sessions.entries()) {
    if (session.startTime < cutoff) sessions.delete(id);
  }
}, 30 * 60 * 1000);

// ── Build interviewer system prompt ──────────────────────────────────────────
const buildSystemPrompt = ({ role, companyType, difficulty, interviewType }) => {
  const difficultyGuidance = {
    easy:   'Ask straightforward, approachable questions. Be warm and encouraging. Give light hints if the candidate gets stuck.',
    medium: 'Ask moderately challenging questions. Follow up naturally on answers to probe deeper understanding.',
    hard:   'Ask challenging, multi-layered questions. Push the candidate to think critically and defend their reasoning.',
  };
  const typeContext = {
    technical:  'Focus on technical skills: data structures, algorithms, system design, and coding concepts.',
    hr:         'Focus on behavioral questions using the STAR method, culture fit, motivation, and career goals.',
    behavioral: 'Focus on past experiences, soft skills, problem-solving approach, and teamwork.',
    mixed:      'Mix technical questions with behavioral ones naturally, as a real interview would.',
  };

  return `You are Alex, an experienced senior interviewer conducting a ${difficulty}-difficulty ${interviewType} interview for a ${role} position${companyType && companyType !== 'any' ? ` at a ${companyType} company` : ''}.

INTERVIEW STYLE:
- Conversational, professional, and focused. One question at a time.
- Listen carefully to each answer and follow up naturally before moving to the next question.
- Keep responses concise — this is a spoken conversation, not a written document.
- Do NOT use bullet points, numbered lists, or markdown in your responses.
- Do NOT mention you are an AI. Stay in character as Alex throughout.

INTERVIEW FOCUS:
${typeContext[interviewType] || typeContext.technical}

DIFFICULTY:
${difficultyGuidance[difficulty] || difficultyGuidance.medium}

FLOW:
1. Introduce yourself briefly (one sentence: "Hi, I'm Alex and I'll be conducting your interview today.")
2. Ask the candidate to introduce themselves.
3. After their introduction, begin with your first interview question.
4. Ask 5–8 questions total, following up on weak or vague answers.
5. Keep each response under 60 words — short, clear, spoken English.
6. End the interview naturally after sufficient questions by saying: "That's all the questions I have. Thank you for your time today."`;
};

// ─── POST /api/interview/voice/start ─────────────────────────────────────────
export const startVoiceSession = async (req, res) => {
  try {
    const { role, companyType, difficulty, durationMinutes, interviewType } = req.body;

    if (!getOpenAI()) {
      return res.status(503).json({
        success: false,
        message: 'Voice interviews are not available right now. Please try again later.',
      });
    }

    // Plan-based session cap
    const plan = req.user.subscription?.plan || 'free';
    const planCap = SESSION_CAP_SECONDS[plan] || SESSION_CAP_SECONDS.free;
    const requestedSeconds = durationMinutes ? Math.floor(durationMinutes) * 60 : planCap;
    const sessionCapSeconds = Math.min(requestedSeconds, planCap);

    // Check monthly interview credit
    const creditCheck = await checkInterviewCredit(req.user.id);
    if (!creditCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: creditCheck.reason,
        code: 'INTERVIEW_LIMIT_EXCEEDED',
      });
    }

    // Create Interview doc
    const interview = await Interview.create({
      userId: req.user.id,
      type: interviewType || 'technical',
      role: role || 'Software Engineer',
      difficulty: difficulty || 'medium',
      mode: 'voice',
      status: 'in-progress',
      startTime: new Date(),
      questions: [],
    });

    const interviewId = interview._id.toString();

    // Initialize server-side session with system prompt
    const systemPrompt = buildSystemPrompt({ role, companyType, difficulty, interviewType });
    sessions.set(interviewId, {
      messages: [{ role: 'system', content: systemPrompt }],
      startTime: Date.now(),
      setup: { role, companyType, difficulty, interviewType },
      transcript: [], // [{role:'user'|'assistant', content:'...'}]
    });

    res.json({
      success: true,
      interviewId,
      sessionCapSeconds,
      remainingInterviews: creditCheck.remaining,
    });
  } catch (err) {
    console.error('[voice] startVoiceSession error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/interview/voice/turn ──────────────────────────────────────────
// Body: multipart/form-data with:
//   audio: audio file blob (webm/mp4/wav)
//   interviewId: string
export const processTurn = async (req, res) => {
  let tempFilePath = null;
  try {
    const { interviewId } = req.body;
    const audioFile = req.file;

    if (!interviewId || !audioFile) {
      return res.status(400).json({ success: false, message: 'Missing interviewId or audio.' });
    }

    const session = sessions.get(interviewId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found or expired.' });
    }

    const client = getOpenAI();

    // ── 1. Whisper STT ───────────────────────────────────────────────────────
    // Write buffer to a temp file (Whisper needs a file stream)
    const ext = audioFile.mimetype?.includes('mp4') ? 'mp4'
               : audioFile.mimetype?.includes('wav') ? 'wav'
               : 'webm';
    tempFilePath = path.join(os.tmpdir(), `voice_${Date.now()}.${ext}`);
    fs.writeFileSync(tempFilePath, audioFile.buffer);

    let userText = '';
    try {
      const transcription = await client.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: 'whisper-1',
        language: 'en',
        response_format: 'text',
      });
      userText = (typeof transcription === 'string' ? transcription : transcription.text || '').trim();
    } catch (sttErr) {
      console.error('[voice] Whisper STT error:', sttErr.message);
      return res.status(502).json({ success: false, message: 'Could not transcribe audio. Please speak clearly and try again.' });
    } finally {
      // Clean up temp file
      if (tempFilePath && fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      tempFilePath = null;
    }

    // Ignore very short / empty transcriptions (background noise, silence)
    if (!userText || userText.split(/\s+/).length < 2) {
      return res.json({ success: true, transcript: '', response: '', audioBase64: null, skipped: true });
    }

    // ── 2. Add user turn to conversation ────────────────────────────────────
    session.messages.push({ role: 'user', content: userText });
    session.transcript.push({ role: 'user', content: userText });

    // ── 3. GPT-4o interviewer response ───────────────────────────────────────
    let aiText = '';
    try {
      const chatRes = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: session.messages,
        temperature: 0.7,
        max_tokens: 200, // Keep responses short — spoken word
      });
      aiText = chatRes.choices[0].message.content?.trim() || '';

      // Log cost
      logChatCall({
        userId: req.user.id,
        feature: 'answer-evaluation',
        model: 'gpt-4o-mini',
        usage: chatRes.usage,
        refId: interviewId,
        refModel: 'Interview',
      });
    } catch (chatErr) {
      console.error('[voice] GPT-4o error:', chatErr.message);
      return res.status(502).json({ success: false, message: 'AI response failed. Please try again.' });
    }

    // Add assistant turn to conversation
    session.messages.push({ role: 'assistant', content: aiText });
    session.transcript.push({ role: 'assistant', content: aiText });

    // ── 4. TTS — convert AI text to speech ───────────────────────────────────
    let audioBase64 = null;
    try {
      const ttsRes = await client.audio.speech.create({
        model: 'tts-1',       // tts-1 is fast; tts-1-hd for higher quality
        voice: 'alloy',       // alloy = neutral professional voice
        input: aiText,
        response_format: 'mp3',
        speed: 1.0,
      });
      const audioBuffer = Buffer.from(await ttsRes.arrayBuffer());
      audioBase64 = audioBuffer.toString('base64');
    } catch (ttsErr) {
      console.error('[voice] TTS error:', ttsErr.message);
      // TTS failure is non-fatal — client can display text even without audio
    }

    // ── 5. Detect if interview ended ─────────────────────────────────────────
    const interviewEnded = aiText.toLowerCase().includes('thank you for your time') ||
                           aiText.toLowerCase().includes("that's all the questions");

    res.json({
      success: true,
      transcript: userText,       // what the user said
      response: aiText,           // what the AI said
      audioBase64,                // base64 mp3 to play in browser
      audioMimeType: 'audio/mp3',
      interviewEnded,
    });
  } catch (err) {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try { fs.unlinkSync(tempFilePath); } catch (_) {}
    }
    console.error('[voice] processTurn error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/interview/voice/end ───────────────────────────────────────────
export const endVoiceSession = async (req, res) => {
  try {
    const { interviewId, durationSeconds = 0 } = req.body;

    const interview = await Interview.findOne({
      _id: interviewId,
      userId: req.user.id,
      status: 'in-progress',
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found or already completed.',
      });
    }

    // Pull transcript from server-side session store
    const session = sessions.get(interviewId);
    const transcript = session?.transcript || req.body.transcript || [];
    sessions.delete(interviewId); // clean up

    // Log voice session cost
    logVoiceSession({ userId: req.user.id, audioMinutes: durationSeconds / 60, refId: interview._id });

    // Extract Q&A pairs from transcript
    const qaPairs = [];
    for (let i = 0; i < transcript.length - 1; i++) {
      if (transcript[i].role === 'assistant' && transcript[i + 1]?.role === 'user') {
        const question = transcript[i].content?.trim();
        const answer   = transcript[i + 1].content?.trim();
        if (question && answer && answer.split(/\s+/).length >= 5) {
          qaPairs.push({ question, answer });
        }
      }
    }

    // Anti-gaming: minimum duration + minimum answers
    const meetsMinimumThreshold = durationSeconds >= 120 && qaPairs.length >= 2;

    // Evaluate each answer
    const { evaluateAnswerWithAI } = await import('../services/aiQuestionService.js');

    const evaluatedQuestions = await Promise.all(
      qaPairs.slice(0, 10).map(async ({ question, answer }) => {
        try {
          const evaluation = await evaluateAnswerWithAI({
            question, answer,
            type: interview.type,
            role: interview.role,
            expectedKeywords: [],
            experience: interview.experience || 'fresher',
            difficulty: interview.difficulty || 'medium',
            userId: req.user.id,
            refId: interview._id,
          });
          return {
            question,
            userAnswer: answer,
            score: evaluation.score || 0,
            feedback: evaluation.feedback || '',
            strengths: evaluation.strengths || [],
            improvements: evaluation.improvements || [],
            keywordAnalysis: evaluation.keywordAnalysis || {},
            answeredAt: new Date(),
          };
        } catch (evalErr) {
          console.error('[voice] Answer evaluation failed:', evalErr.message);
          return { question, userAnswer: answer, score: 0, feedback: 'Evaluation unavailable.', strengths: [], improvements: [], answeredAt: new Date() };
        }
      })
    );

    // Overall score
    const totalScore = evaluatedQuestions.reduce((s, q) => s + (q.score || 0), 0);
    const overallScore = evaluatedQuestions.length > 0 ? Math.round(totalScore / evaluatedQuestions.length) : 0;

    // Overall feedback
    let feedbackResult = null;
    try {
      feedbackResult = await generateOverallFeedback({
        interview: { type: interview.type, role: interview.role, experience: interview.experience },
        questions: evaluatedQuestions,
        averageScore: overallScore,
        userId: req.user.id,
        refId: interview._id,
      });
    } catch (fbErr) {
      console.error('[voice] Overall feedback generation failed:', fbErr.message);
    }

    // Points
    let pointsAwarded = 0;
    if (meetsMinimumThreshold) {
      const difficultyMultiplier = { easy: 1, medium: 1.5, hard: 2 }[interview.difficulty] || 1;
      pointsAwarded = Math.min(Math.round(overallScore * difficultyMultiplier), 200);
    }

    // Persist
    interview.status = 'completed';
    interview.endTime = new Date();
    interview.actualDuration = durationSeconds;
    interview.questions = evaluatedQuestions;
    interview.overallScore = overallScore;
    interview.overallFeedback = feedbackResult?.feedback || '';
    interview.strengths = feedbackResult?.strengths || [];
    interview.areasForImprovement = feedbackResult?.improvements || [];
    interview.recommendations = feedbackResult?.recommendations || [];
    if (feedbackResult?.overallAssessment) interview.overallAssessment = feedbackResult.overallAssessment;
    if (feedbackResult?.nextSteps) interview.nextSteps = feedbackResult.nextSteps;
    await interview.save();

    // Update user stats
    const User = (await import('../models/User.js')).default;
    await User.findByIdAndUpdate(req.user.id, {
      $inc: {
        'stats.interviewsTaken': 1,
        'stats.interviewsCompleted': 1,
        'stats.totalPoints': pointsAwarded,
        'leaderboard.totalPoints': pointsAwarded,
        'leaderboard.weeklyPoints': pointsAwarded,
        'leaderboard.pointsAwarded': pointsAwarded,
      },
    });

    res.json({
      success: true,
      interviewId: interview._id,
      overallScore,
      pointsAwarded,
      meetsMinimumThreshold,
      questionsEvaluated: evaluatedQuestions.length,
      overallFeedback: feedbackResult?.feedback || '',
      strengths: feedbackResult?.strengths || [],
      improvements: feedbackResult?.improvements || [],
      reportUrl: `/interview-results/${interview._id}`,
    });
  } catch (err) {
    console.error('[voice] endVoiceSession error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
