/**
 * Voice Interview Controller
 * Pipeline: POST /voice/start → POST /voice/turn (×N) → GET /voice/tts → POST /voice/end
 *
 * Architecture:
 *   • /voice/start  — create Interview doc, persist session to MongoDB
 *   • /voice/turn   — receive audio → Whisper STT → GPT-4o-mini chat → return text
 *   • /voice/tts    — stream TTS audio (mp3) directly to client
 *   • /voice/end    — pull transcript from DB, evaluate answers, save report
 *
 * Session state (messages + transcript) is persisted as JSON in Interview.voiceSession
 * so Render free-tier server restarts don't lose state.
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import os from 'os';
import Interview from '../models/Interview.js';
import { logChatCall, logVoiceSession } from '../services/aiCostLogger.js';
import { checkInterviewCredit } from '../middleware/aiRateLimit.js';
import { generateOverallFeedback } from '../services/aiQuestionService.js';

// ─── OpenAI singleton ─────────────────────────────────────────────────────────
let _openai = null;
function getClient() {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) return null;
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

// ─── Plan caps ────────────────────────────────────────────────────────────────
const CAP = { free: 7 * 60, basic: 10 * 60, pro: 15 * 60, annual: 15 * 60 };

// ─── Session persistence helpers ─────────────────────────────────────────────
async function loadSession(interviewId) {
  try {
    const doc = await Interview.findOne(
      { _id: interviewId, status: 'in-progress' },
      { voiceSession: 1 }
    ).lean();
    if (!doc?.voiceSession) return null;
    return JSON.parse(doc.voiceSession);
  } catch (e) {
    console.error('[voice] loadSession parse error:', e.message);
    return null;
  }
}

async function saveSession(interviewId, session) {
  await Interview.findByIdAndUpdate(interviewId, {
    voiceSession: JSON.stringify(session),
  });
}

// ─── System prompt ────────────────────────────────────────────────────────────
function buildPrompt({ role, companyType, difficulty, interviewType }) {
  const diff = {
    easy:   'Ask friendly, approachable questions. Encourage the candidate if they hesitate.',
    medium: 'Ask industry-standard questions. Probe deeper on vague or incomplete answers.',
    hard:   'Ask challenging questions. Push the candidate to justify and defend their answers.',
  }[difficulty] || 'Ask moderately challenging questions.';

  const focus = {
    technical:  'Focus on data structures, algorithms, system design, and CS fundamentals.',
    hr:         'Focus on behavioral questions using the STAR framework, motivation, and culture fit.',
    behavioral: 'Focus on past experiences, soft skills, conflict resolution, and teamwork.',
    mixed:      'Mix technical and behavioral questions naturally across the interview.',
  }[interviewType] || 'Mix technical and behavioral questions.';

  const company = companyType && companyType !== 'any'
    ? ` at a ${companyType} company` : '';

  return [
    `You are Alex, an experienced ${interviewType} interviewer conducting a ${difficulty}-level interview`,
    `for a ${role} position${company}.`,
    '',
    'STRICT RULES:',
    '- Respond in plain spoken English only. No markdown, bullets, or numbered lists.',
    '- Ask exactly ONE question per turn. Never ask two questions at once.',
    '- Keep every response under 50 words — this is a live voice conversation.',
    '- If an answer is vague, ask a brief follow-up before moving on.',
    '- Never reveal you are an AI. Stay in character as Alex throughout.',
    `- After 6–8 meaningful exchanges, close naturally: "That wraps up my questions. Thank you for your time today."`,
    '',
    `FOCUS: ${focus}`,
    `DIFFICULTY: ${diff}`,
    '',
    'START: Greet the candidate with one sentence, then ask them to introduce themselves.',
  ].join('\n');
}

// ─── POST /api/interview/voice/start ─────────────────────────────────────────
export const startVoiceSession = async (req, res) => {
  try {
    const client = getClient();
    if (!client) {
      return res.status(503).json({
        success: false,
        message: 'OpenAI API key not configured on the server.',
      });
    }

    const { role, companyType, difficulty, durationMinutes, interviewType } = req.body;

    if (!role) {
      return res.status(400).json({ success: false, message: 'role is required.' });
    }

    // Plan cap
    const plan = req.user.subscription?.plan || 'free';
    const planCap = CAP[plan] || CAP.free;
    const requestedSecs = durationMinutes ? Math.floor(Number(durationMinutes)) * 60 : planCap;
    const sessionCapSeconds = Math.min(requestedSecs, planCap);

    // Monthly interview credit
    const credit = await checkInterviewCredit(req.user.id);
    if (!credit.allowed) {
      return res.status(403).json({
        success: false,
        message: credit.reason,
        code: 'INTERVIEW_LIMIT_EXCEEDED',
      });
    }

    // Build and persist session
    const systemPrompt = buildPrompt({ role, companyType, difficulty, interviewType });
    const sessionData = {
      messages:         [{ role: 'system', content: systemPrompt }],
      transcript:       [],
      sessionCapSeconds,
    };

    const interview = await Interview.create({
      userId:       req.user.id,
      type:         interviewType || 'technical',
      role,
      difficulty:   difficulty || 'medium',
      mode:         'voice',
      status:       'in-progress',
      startTime:    new Date(),
      questions:    [],
      voiceSession: JSON.stringify(sessionData),
    });

    console.log(`[voice/start] id=${interview._id} plan=${plan} cap=${sessionCapSeconds}s`);

    return res.json({
      success:            true,
      interviewId:        interview._id,
      sessionCapSeconds,
      remainingInterviews: credit.remaining,
    });
  } catch (err) {
    console.error('[voice/start] error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/interview/voice/turn ──────────────────────────────────────────
export const processTurn = async (req, res) => {
  let tempFile = null;
  try {
    const { interviewId } = req.body;
    const audioFile = req.file;

    if (!interviewId) {
      return res.status(400).json({ success: false, message: 'interviewId is required.' });
    }

    const audioBytes = audioFile?.buffer?.length ?? 0;
    // Treat as "opener" if no real audio (first turn — AI speaks first)
    const isOpener = audioBytes < 1500;

    console.log(`[voice/turn] id=${interviewId} bytes=${audioBytes} opener=${isOpener}`);

    // Load persisted session
    const session = await loadSession(interviewId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or already completed. Please start a new interview.',
      });
    }

    const client = getClient();
    if (!client) {
      return res.status(503).json({ success: false, message: 'OpenAI not configured.' });
    }

    // ── 1. Whisper STT (skip for opener — no audio to transcribe) ────────────
    let userText = '';

    if (!isOpener) {
      const mimeType = audioFile.mimetype || '';
      const ext = mimeType.includes('mp4')  ? 'mp4'
                : mimeType.includes('wav')  ? 'wav'
                : mimeType.includes('ogg')  ? 'ogg'
                : 'webm';

      tempFile = path.join(os.tmpdir(), `vi_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`);
      fs.writeFileSync(tempFile, audioFile.buffer);

      try {
        const tx = await client.audio.transcriptions.create({
          file:            fs.createReadStream(tempFile),
          model:           'whisper-1',
          language:        'en',
          response_format: 'text',
        });
        userText = (typeof tx === 'string' ? tx : (tx.text ?? '')).trim();
        console.log(`[voice/turn] whisper: "${userText.slice(0, 100)}"`);
      } catch (sttErr) {
        console.error('[voice/turn] whisper error:', sttErr.status, sttErr.message);
        // Non-fatal: skip this turn rather than crashing the interview
        return res.json({
          success:  true,
          skipped:  true,
          reason:   'transcription_failed',
          transcript: '',
          response:   '',
        });
      } finally {
        // Always clean up temp file
        try { if (tempFile && fs.existsSync(tempFile)) fs.unlinkSync(tempFile); } catch (_) {}
        tempFile = null;
      }

      // Ignore pure silence / noise (< 2 real words)
      if (!userText || userText.split(/\s+/).filter(Boolean).length < 2) {
        return res.json({ success: true, skipped: true, reason: 'too_short', transcript: '', response: '' });
      }

      // Add user turn to conversation
      session.messages.push({ role: 'user', content: userText });
      session.transcript.push({ role: 'user', content: userText });
    }

    // ── 2. GPT-4o-mini — generate interviewer response ────────────────────────
    let aiText = '';
    try {
      const chatRes = await client.chat.completions.create({
        model:       'gpt-4o-mini',
        messages:    session.messages,
        temperature: 0.7,
        max_tokens:  120,   // ~50 spoken words — keep it tight
      });
      aiText = chatRes.choices[0].message.content?.trim() ?? '';
      console.log(`[voice/turn] gpt: "${aiText.slice(0, 100)}"`);

      // Fire-and-forget cost log
      logChatCall({
        userId:   req.user.id,
        feature:  'answer-evaluation',
        model:    'gpt-4o-mini',
        usage:    chatRes.usage,
        refId:    interviewId,
        refModel: 'Interview',
      });
    } catch (chatErr) {
      console.error('[voice/turn] gpt error:', chatErr.status, chatErr.message);
      return res.status(502).json({
        success: false,
        message: `AI error (${chatErr.status ?? 'unknown'}): ${chatErr.message}`,
      });
    }

    if (!aiText) {
      return res.status(502).json({ success: false, message: 'AI returned an empty response.' });
    }

    // Add AI turn to conversation and persist
    session.messages.push({ role: 'assistant', content: aiText });
    session.transcript.push({ role: 'assistant', content: aiText });
    await saveSession(interviewId, session);

    const interviewEnded =
      /thank you for your time/i.test(aiText) ||
      /that('s| is) all (the |my )?questions/i.test(aiText) ||
      /wraps up (my|our) questions/i.test(aiText);

    return res.json({
      success:        true,
      transcript:     userText,
      response:       aiText,
      interviewEnded,
    });
  } catch (err) {
    // Final cleanup guard
    if (tempFile) { try { if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile); } catch (_) {} }
    console.error('[voice/turn] unexpected:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/interview/voice/tts ─────────────────────────────────────────────
// Streams TTS mp3 audio directly to the client — no base64, no buffering on server.
export const streamTTS = async (req, res) => {
  try {
    const text = (req.query.text ?? '').trim();
    if (!text) {
      return res.status(400).json({ success: false, message: 'text query param is required.' });
    }

    const client = getClient();
    if (!client) {
      return res.status(503).json({ success: false, message: 'OpenAI not configured.' });
    }

    console.log(`[voice/tts] streaming ${text.length} chars`);

    const ttsRes = await client.audio.speech.create({
      model:           'tts-1',          // tts-1 = lowest latency
      voice:           'alloy',          // neutral, professional
      input:           text.slice(0, 4096),
      response_format: 'mp3',
      speed:           1.0,
    });

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Transfer-Encoding', 'chunked');

    // openai SDK v4+ returns a Response-like object; .body is a Web ReadableStream
    const body = ttsRes.body;

    if (!body) {
      // Unlikely fallback
      const buf = Buffer.from(await ttsRes.arrayBuffer());
      return res.end(buf);
    }

    if (typeof body.pipe === 'function') {
      // Node.js stream (older SDK)
      body.pipe(res);
      body.on('error', (e) => {
        console.error('[voice/tts] pipe error:', e.message);
        if (!res.headersSent) res.status(502).end();
        else res.end();
      });
    } else if (typeof body.getReader === 'function') {
      // WHATWG ReadableStream (newer SDK / Node 18+)
      const reader = body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const canContinue = res.write(Buffer.from(value));
          if (!canContinue) {
            // Backpressure — wait for drain before reading more
            await new Promise((r) => res.once('drain', r));
          }
        }
      } finally {
        res.end();
      }
    } else {
      const buf = Buffer.from(await ttsRes.arrayBuffer());
      res.end(buf);
    }
  } catch (err) {
    console.error('[voice/tts] error:', err.status, err.message);
    if (!res.headersSent) {
      res.status(502).json({ success: false, message: `TTS failed: ${err.message}` });
    } else {
      res.end();
    }
  }
};

// ─── POST /api/interview/voice/end ───────────────────────────────────────────
export const endVoiceSession = async (req, res) => {
  try {
    const { interviewId, durationSeconds = 0 } = req.body;

    if (!interviewId) {
      return res.status(400).json({ success: false, message: 'interviewId is required.' });
    }

    const interview = await Interview.findOne({
      _id:    interviewId,
      userId: req.user.id,
      status: 'in-progress',
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found or already completed.',
      });
    }

    // Pull transcript from persisted session
    let transcript = [];
    try {
      const s = JSON.parse(interview.voiceSession || 'null');
      transcript = s?.transcript ?? [];
    } catch (_) { transcript = []; }

    // Clear voice session blob — no longer needed
    interview.voiceSession = null;

    // Log voice usage (fire-and-forget)
    logVoiceSession({
      userId:       req.user.id,
      audioMinutes: durationSeconds / 60,
      refId:        interview._id,
    });

    // ── Extract Q&A pairs ─────────────────────────────────────────────────────
    // Pair each assistant question with the immediately following user answer.
    const qaPairs = [];
    for (let i = 0; i < transcript.length - 1; i++) {
      if (transcript[i].role === 'assistant' && transcript[i + 1]?.role === 'user') {
        const question = transcript[i].content?.trim();
        const answer   = transcript[i + 1].content?.trim();
        // Skip greetings / very short answers
        if (question && answer && answer.split(/\s+/).length >= 5) {
          qaPairs.push({ question, answer });
        }
      }
    }

    console.log(`[voice/end] id=${interviewId} pairs=${qaPairs.length} dur=${durationSeconds}s`);

    // Anti-gaming: must have at least 2 min + 2 real answers to earn points
    const meetsThreshold = durationSeconds >= 120 && qaPairs.length >= 2;

    // ── Evaluate each answer ─────────────────────────────────────────────────
    const { evaluateAnswerWithAI } = await import('../services/aiQuestionService.js');

    const evaluated = await Promise.all(
      qaPairs.slice(0, 10).map(async ({ question, answer }) => {
        try {
          const ev = await evaluateAnswerWithAI({
            question,
            answer,
            type:             interview.type,
            role:             interview.role,
            expectedKeywords: [],
            experience:       interview.experience || 'fresher',
            difficulty:       interview.difficulty || 'medium',
            userId:           req.user.id,
            refId:            interview._id,
          });
          return {
            question,
            userAnswer:      answer,
            score:           ev.score ?? 0,
            feedback:        ev.feedback ?? '',
            strengths:       ev.strengths ?? [],
            improvements:    ev.improvements ?? [],
            keywordAnalysis: ev.keywordAnalysis ?? {},
            answeredAt:      new Date(),
          };
        } catch (e) {
          console.error('[voice/end] eval error:', e.message);
          return {
            question, userAnswer: answer,
            score: 0, feedback: 'Evaluation unavailable.',
            strengths: [], improvements: [], answeredAt: new Date(),
          };
        }
      })
    );

    const overallScore = evaluated.length > 0
      ? Math.round(evaluated.reduce((s, q) => s + (q.score ?? 0), 0) / evaluated.length)
      : 0;

    // ── Overall feedback ──────────────────────────────────────────────────────
    let feedback = null;
    try {
      feedback = await generateOverallFeedback({
        interview: {
          type:       interview.type,
          role:       interview.role,
          experience: interview.experience,
        },
        questions:    evaluated,
        averageScore: overallScore,
        userId:       req.user.id,
        refId:        interview._id,
      });
    } catch (e) {
      console.error('[voice/end] feedback error:', e.message);
    }

    // ── Points ────────────────────────────────────────────────────────────────
    const diffMul = { easy: 1, medium: 1.5, hard: 2 }[interview.difficulty] ?? 1;
    const points  = meetsThreshold
      ? Math.min(Math.round(overallScore * diffMul), 200) : 0;

    // ── Persist completed interview ───────────────────────────────────────────
    interview.status              = 'completed';
    interview.endTime             = new Date();
    interview.actualDuration      = durationSeconds;
    interview.questions           = evaluated;
    interview.overallScore        = overallScore;
    interview.overallFeedback     = feedback?.feedback ?? '';
    interview.strengths           = feedback?.strengths ?? [];
    interview.areasForImprovement = feedback?.improvements ?? [];
    interview.recommendations     = feedback?.recommendations ?? [];
    if (feedback?.overallAssessment) interview.overallAssessment = feedback.overallAssessment;
    if (feedback?.nextSteps)         interview.nextSteps         = feedback.nextSteps;
    await interview.save();

    // ── Update user stats ─────────────────────────────────────────────────────
    const User = (await import('../models/User.js')).default;
    await User.findByIdAndUpdate(req.user.id, {
      $inc: {
        'stats.interviewsTaken':     1,
        'stats.interviewsCompleted': 1,
        'stats.totalPoints':         points,
        'leaderboard.totalPoints':   points,
        'leaderboard.weeklyPoints':  points,
        'leaderboard.pointsAwarded': points,
      },
    });

    console.log(`[voice/end] done score=${overallScore} points=${points}`);

    return res.json({
      success:              true,
      interviewId:          interview._id,
      overallScore,
      pointsAwarded:        points,
      meetsMinimumThreshold: meetsThreshold,
      questionsEvaluated:   evaluated.length,
      overallFeedback:      feedback?.feedback ?? '',
      strengths:            feedback?.strengths ?? [],
      improvements:         feedback?.improvements ?? [],
    });
  } catch (err) {
    console.error('[voice/end] error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
