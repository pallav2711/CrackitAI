/**
 * Voice Interview Controller — Whisper STT + GPT-4o-mini + TTS streaming
 *
 * Endpoints:
 *   POST /voice/start          → create Interview doc, return interviewId + cap
 *   POST /voice/turn           → audio blob → Whisper → GPT-4o-mini → returns JSON {transcript, response}
 *   GET  /voice/tts?text=...&interviewId=... → streams TTS audio as audio/mpeg (ChatGPT-style)
 *   POST /voice/end            → score transcript via existing pipeline
 *
 * Why two separate calls for turn + tts:
 *   - /voice/turn  returns text in ~2-4s (Whisper + GPT only)
 *   - /voice/tts   streams audio immediately — client can start playing before fully downloaded
 *   - This replicates the ChatGPT voice feel: text appears fast, audio streams in
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import os from 'os';
import Interview from '../models/Interview.js';
import { logChatCall, logVoiceSession } from '../services/aiCostLogger.js';
import { checkInterviewCredit } from '../middleware/aiRateLimit.js';
import { generateOverallFeedback } from '../services/aiQuestionService.js';

// ── OpenAI client ─────────────────────────────────────────────────────────────
let openai = null;
const getOpenAI = () => {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
};

// ── Plan caps ─────────────────────────────────────────────────────────────────
const SESSION_CAP_SECONDS = {
  free:   7  * 60,
  basic:  10 * 60,
  pro:    15 * 60,
  annual: 15 * 60,
};

// ── In-memory session store ───────────────────────────────────────────────────
// Key: interviewId → { messages, transcript, startTime }
const sessions = new Map();

// TTL cleanup every 30 min
setInterval(() => {
  const cutoff = Date.now() - 60 * 60 * 1000;
  for (const [id, s] of sessions) if (s.startTime < cutoff) sessions.delete(id);
}, 30 * 60 * 1000);

// ── System prompt ─────────────────────────────────────────────────────────────
const buildSystemPrompt = ({ role, companyType, difficulty, interviewType }) => {
  const diffMap = {
    easy:   'Ask clear, approachable questions. Be warm and encouraging.',
    medium: 'Ask moderately challenging questions. Probe deeper on vague answers.',
    hard:   'Ask challenging multi-layered questions. Push the candidate to defend reasoning.',
  };
  const typeMap = {
    technical:  'Focus on DSA, system design, coding concepts, and CS fundamentals.',
    hr:         'Focus on behavioral questions (STAR method), motivation, and culture fit.',
    behavioral: 'Focus on past experiences, soft skills, teamwork, and problem-solving approach.',
    mixed:      'Blend technical and behavioral questions naturally, as a real interview would.',
  };
  const company = companyType && companyType !== 'any' ? ` at a ${companyType} company` : '';

  return `You are Alex, a senior interviewer conducting a ${difficulty}-difficulty ${interviewType} interview for a ${role} position${company}.

RULES — follow these strictly:
- Speak naturally. Short sentences. No bullet points, no markdown, no numbered lists.
- Ask ONE question at a time. Wait for the full answer before continuing.
- Follow up naturally on weak or vague answers before moving on.
- Stay in character as Alex. Never mention you are an AI.
- Keep every response under 60 words — this is spoken conversation, not text.
- After 5-8 questions, close with: "That's all the questions I have for today. Thank you for your time."

FOCUS: ${typeMap[interviewType] || typeMap.technical}
DIFFICULTY: ${diffMap[difficulty] || diffMap.medium}

START: Introduce yourself in one sentence, then ask the candidate to introduce themselves.`;
};

// ─── POST /api/interview/voice/start ─────────────────────────────────────────
export const startVoiceSession = async (req, res) => {
  try {
    const { role, companyType, difficulty, durationMinutes, interviewType } = req.body;

    if (!getOpenAI()) {
      return res.status(503).json({ success: false, message: 'OpenAI API key not configured.' });
    }

    const plan = req.user.subscription?.plan || 'free';
    const planCap = SESSION_CAP_SECONDS[plan] || SESSION_CAP_SECONDS.free;
    const sessionCapSeconds = Math.min(
      durationMinutes ? Math.floor(durationMinutes) * 60 : planCap,
      planCap
    );

    const creditCheck = await checkInterviewCredit(req.user.id);
    if (!creditCheck.allowed) {
      return res.status(403).json({ success: false, message: creditCheck.reason, code: 'INTERVIEW_LIMIT_EXCEEDED' });
    }

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
    sessions.set(interviewId, {
      messages: [{ role: 'system', content: buildSystemPrompt({ role, companyType, difficulty, interviewType }) }],
      transcript: [],
      startTime: Date.now(),
    });

    res.json({ success: true, interviewId, sessionCapSeconds, remainingInterviews: creditCheck.remaining });
  } catch (err) {
    console.error('[voice] start error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/interview/voice/turn ──────────────────────────────────────────
// Receives audio blob → Whisper STT → GPT-4o-mini → returns JSON
// Client then calls GET /voice/tts to stream the audio separately
export const processTurn = async (req, res) => {
  let tempFile = null;
  try {
    const { interviewId } = req.body;
    const audioFile = req.file;

    console.log(`[voice] turn — interviewId:${interviewId} audioSize:${audioFile?.buffer?.length || 0} isOpener:${!audioFile || audioFile.buffer?.length < 2000}`);

    if (!interviewId) return res.status(400).json({ success: false, message: 'Missing interviewId.' });

    const session = sessions.get(interviewId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found or expired. Please start a new interview.' });

    const client = getOpenAI();

    // ── Whisper STT ───────────────────────────────────────────────────────────
    let userText = '';

    const isOpener = !audioFile || audioFile.buffer?.length < 2000;

    if (!isOpener) {
      // Real audio — transcribe with Whisper
      const ext = audioFile.mimetype?.includes('mp4') ? 'mp4'
                : audioFile.mimetype?.includes('wav') ? 'wav'
                : 'webm';
      tempFile = path.join(os.tmpdir(), `vi_${Date.now()}.${ext}`);
      fs.writeFileSync(tempFile, audioFile.buffer);

      try {
        const tx = await client.audio.transcriptions.create({
          file: fs.createReadStream(tempFile),
          model: 'whisper-1',
          language: 'en',
          response_format: 'text',
        });
        userText = (typeof tx === 'string' ? tx : tx.text || '').trim();
      } catch (sttErr) {
        console.error('[voice] Whisper error:', sttErr.message, 'status:', sttErr.status);
        // Don't crash the turn — return a friendly error
        return res.status(502).json({
          success: false,
          message: `Speech transcription failed: ${sttErr.message}. Please try again.`,
          errorCode: sttErr.status,
        });
      } finally {
        if (tempFile && fs.existsSync(tempFile)) { fs.unlinkSync(tempFile); tempFile = null; }
      }
    }
    // else: opener (silent/tiny audio) — skip STT, go straight to GPT for first message

    // Skip if too short (noise / silence)
    if (userText && userText.split(/\s+/).length < 2) {
      return res.json({ success: true, skipped: true, transcript: '', response: '' });
    }

    // ── Add user turn ─────────────────────────────────────────────────────────
    if (userText) {
      session.messages.push({ role: 'user', content: userText });
      session.transcript.push({ role: 'user', content: userText });
    }

    // ── GPT-4o-mini response ──────────────────────────────────────────────────
    let aiText = '';
    try {
      const chatRes = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: session.messages,
        temperature: 0.75,
        max_tokens: 150,   // ~60 words spoken — keep it snappy
      });
      aiText = chatRes.choices[0].message.content?.trim() || '';

      logChatCall({
        userId: req.user.id,
        feature: 'answer-evaluation',
        model: 'gpt-4o-mini',
        usage: chatRes.usage,
        refId: interviewId,
        refModel: 'Interview',
      });
    } catch (chatErr) {
      console.error('[voice] GPT error:', chatErr.message);
      return res.status(502).json({ success: false, message: 'AI response failed. Please try again.' });
    }

    session.messages.push({ role: 'assistant', content: aiText });
    session.transcript.push({ role: 'assistant', content: aiText });

    const interviewEnded =
      aiText.toLowerCase().includes('thank you for your time') ||
      aiText.toLowerCase().includes("that's all the questions");

    // Return text immediately — client streams audio separately via /voice/tts
    res.json({
      success: true,
      transcript: userText,
      response: aiText,
      interviewEnded,
    });
  } catch (err) {
    if (tempFile && fs.existsSync(tempFile)) { try { fs.unlinkSync(tempFile); } catch (_) {} }
    console.error('[voice] turn error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/interview/voice/tts ─────────────────────────────────────────────
// Streams TTS audio directly as audio/mpeg — ChatGPT-style streaming
// Query params: text (required), interviewId (for auth guard)
export const streamTTS = async (req, res) => {
  try {
    const { text, interviewId } = req.query;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'No text provided.' });
    }

    // Verify session exists (basic auth guard — protect middleware already ran)
    if (interviewId && !sessions.has(interviewId)) {
      // Session may have ended — still allow TTS for the final message
    }

    const client = getOpenAI();

    // Set streaming headers before the first byte
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // OpenAI TTS — pipe the response stream directly to client
    const ttsRes = await client.audio.speech.create({
      model: 'tts-1',       // tts-1 = fast (lower latency), tts-1-hd = higher quality
      voice: 'alloy',       // alloy: neutral, professional
      input: text.trim().substring(0, 4096), // TTS max input
      response_format: 'mp3',
      speed: 1.0,
    });

    // ttsRes.body is a Web Streams ReadableStream — pipe to Express response
    const nodeStream = ttsRes.body;
    if (nodeStream && typeof nodeStream.pipe === 'function') {
      // Node.js stream
      nodeStream.pipe(res);
      nodeStream.on('error', (err) => {
        console.error('[voice] TTS stream error:', err.message);
        if (!res.headersSent) res.status(502).end();
        else res.end();
      });
    } else if (nodeStream) {
      // Web Streams API (newer openai SDK versions)
      const reader = nodeStream.getReader();
      const pump = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) { res.end(); break; }
            const ok = res.write(Buffer.from(value));
            if (!ok) await new Promise(r => res.once('drain', r));
          }
        } catch (e) {
          console.error('[voice] TTS pump error:', e.message);
          res.end();
        }
      };
      pump();
    } else {
      // Fallback: arrayBuffer
      const buf = Buffer.from(await ttsRes.arrayBuffer());
      res.end(buf);
    }
  } catch (err) {
    console.error('[voice] TTS error:', err);
    if (!res.headersSent) res.status(502).json({ success: false, message: 'TTS failed.' });
    else res.end();
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
      return res.status(404).json({ success: false, message: 'Session not found or already completed.' });
    }

    const session = sessions.get(interviewId);
    const transcript = session?.transcript || [];
    sessions.delete(interviewId);

    logVoiceSession({ userId: req.user.id, audioMinutes: durationSeconds / 60, refId: interview._id });

    // Extract Q&A pairs
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

    const meetsMinimumThreshold = durationSeconds >= 120 && qaPairs.length >= 2;

    const { evaluateAnswerWithAI } = await import('../services/aiQuestionService.js');

    const evaluatedQuestions = await Promise.all(
      qaPairs.slice(0, 10).map(async ({ question, answer }) => {
        try {
          const ev = await evaluateAnswerWithAI({
            question, answer,
            type: interview.type, role: interview.role,
            expectedKeywords: [],
            experience: interview.experience || 'fresher',
            difficulty: interview.difficulty || 'medium',
            userId: req.user.id, refId: interview._id,
          });
          return {
            question, userAnswer: answer,
            score: ev.score || 0, feedback: ev.feedback || '',
            strengths: ev.strengths || [], improvements: ev.improvements || [],
            keywordAnalysis: ev.keywordAnalysis || {}, answeredAt: new Date(),
          };
        } catch {
          return { question, userAnswer: answer, score: 0, feedback: 'Evaluation unavailable.', strengths: [], improvements: [], answeredAt: new Date() };
        }
      })
    );

    const overallScore = evaluatedQuestions.length > 0
      ? Math.round(evaluatedQuestions.reduce((s, q) => s + (q.score || 0), 0) / evaluatedQuestions.length)
      : 0;

    let feedbackResult = null;
    try {
      feedbackResult = await generateOverallFeedback({
        interview: { type: interview.type, role: interview.role, experience: interview.experience },
        questions: evaluatedQuestions,
        averageScore: overallScore,
        userId: req.user.id, refId: interview._id,
      });
    } catch (e) { console.error('[voice] feedback error:', e.message); }

    const diffMul = { easy: 1, medium: 1.5, hard: 2 }[interview.difficulty] || 1;
    const pointsAwarded = meetsMinimumThreshold
      ? Math.min(Math.round(overallScore * diffMul), 200) : 0;

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

    const User = (await import('../models/User.js')).default;
    await User.findByIdAndUpdate(req.user.id, {
      $inc: {
        'stats.interviewsTaken': 1, 'stats.interviewsCompleted': 1,
        'stats.totalPoints': pointsAwarded,
        'leaderboard.totalPoints': pointsAwarded, 'leaderboard.weeklyPoints': pointsAwarded,
        'leaderboard.pointsAwarded': pointsAwarded,
      },
    });

    res.json({
      success: true, interviewId: interview._id, overallScore, pointsAwarded,
      meetsMinimumThreshold, questionsEvaluated: evaluatedQuestions.length,
      overallFeedback: feedbackResult?.feedback || '',
      strengths: feedbackResult?.strengths || [],
      improvements: feedbackResult?.improvements || [],
    });
  } catch (err) {
    console.error('[voice] end error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
