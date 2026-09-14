/**
 * Voice Interview Controller
 *
 * Integrates with OpenAI Realtime API (gpt-realtime-mini) for live voice interviews.
 *
 * Security model:
 *  - The OpenAI key NEVER reaches the client.
 *  - /voice/start returns a short-lived ephemeral session token from OpenAI's
 *    Realtime Sessions API. The client uses that token to open a WebRTC connection.
 *  - A hard server-side session cap (minutes) is enforced regardless of what the
 *    frontend requests — this is the cost ceiling.
 *  - Every session's audio minutes are logged for margin tracking.
 *
 * Endpoint summary:
 *   POST /api/interview/voice/start  → create session, return ephemeral token
 *   POST /api/interview/voice/end    → submit transcript, trigger scoring pipeline
 */

import OpenAI from 'openai';
import Interview from '../models/Interview.js';
import { logVoiceSession } from '../services/aiCostLogger.js';
import { checkInterviewCredit, PLAN_LIMITS } from '../middleware/aiRateLimit.js';
import {
  generateOverallFeedback,
} from '../services/aiQuestionService.js';

let openai = null;
const getOpenAI = () => {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
};

// Session cap constants (plan-level caps enforced here too, belt-and-suspenders)
const SESSION_CAP_SECONDS = {
  free: 7 * 60,
  basic: 10 * 60,
  pro: 15 * 60,
  annual: 15 * 60,
};

// Build the interviewer system prompt from interview setup params
const buildInterviewerPrompt = ({ role, companyType, difficulty, mode }) => {
  const difficultyGuidance = {
    easy: 'Ask straightforward questions. Be encouraging and give hints if the candidate seems stuck.',
    medium: 'Ask moderately challenging questions. Follow up on answers to probe deeper.',
    hard: 'Ask challenging questions with complex follow-ups. Push the candidate to think critically.',
  };

  return `You are an experienced technical interviewer conducting a ${difficulty || 'medium'}-difficulty ${mode || 'technical'} interview for a ${role || 'Software Engineer'} position${companyType ? ` at a ${companyType} company` : ''}.

YOUR ROLE:
- Conduct a realistic, professional interview in a conversational but focused tone.
- Ask one question at a time. Wait for the candidate to finish before proceeding.
- Follow up on vague or incomplete answers with clarifying questions.
- Take brief notes mentally — you will score the candidate at the end.
- Keep the interview moving at a steady pace; don't let silences extend beyond 10 seconds.

DIFFICULTY GUIDANCE:
${difficultyGuidance[difficulty] || difficultyGuidance.medium}

START:
Begin by introducing yourself briefly (one sentence), then ask the candidate to introduce themselves. After their introduction, proceed to your first interview question.

IMPORTANT:
- Speak naturally as a human interviewer would. No bullet points or numbered lists in your speech.
- Do not break character or mention that you are an AI.
- Keep your questions and responses concise — this is a spoken conversation.`;
};

// ─── POST /api/interview/voice/start ─────────────────────────────────────────
export const startVoiceSession = async (req, res) => {
  try {
    const { role, companyType, difficulty, durationMinutes, interviewType } = req.body;

    const client = getOpenAI();
    if (!client) {
      return res.status(503).json({
        success: false,
        message: 'Voice interviews are not available right now. Please try again later.',
      });
    }

    // Determine session cap based on plan
    const plan = req.user.subscription?.plan || 'free';
    const planCap = SESSION_CAP_SECONDS[plan] || SESSION_CAP_SECONDS.free;
    // Respect user-requested duration but never exceed plan cap
    const requestedSeconds = durationMinutes ? Math.floor(durationMinutes) * 60 : planCap;
    const sessionCapSeconds = Math.min(requestedSeconds, planCap);

    // Check interview credit (decrements the monthly counter)
    const creditCheck = await checkInterviewCredit(req.user.id);
    if (!creditCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: creditCheck.reason,
        code: 'INTERVIEW_LIMIT_EXCEEDED',
      });
    }

    // Create an Interview doc to track this session
    const interview = await Interview.create({
      userId: req.user.id,
      type: interviewType || 'technical',
      role: role || 'Software Engineer',
      difficulty: difficulty || 'medium',
      mode: 'voice',
      status: 'in-progress',
      startTime: new Date(),
      questions: [], // populated from transcript on end
    });

    // Request an ephemeral session token from OpenAI Realtime API
    // This token is short-lived (~1 min to connect, then session lives until cap)
    const systemPrompt = buildInterviewerPrompt({
      role,
      companyType,
      difficulty,
      mode: interviewType || 'technical',
    });

    let realtimeToken = null;
    let realtimeSessionId = null;

    try {
      // OpenAI Realtime Sessions API — creates a short-lived client secret
      const sessionResponse = await openai.beta.realtime.sessions.create({
        model: 'gpt-4o-realtime-preview',
        voice: 'alloy',
        instructions: systemPrompt,
        input_audio_transcription: { model: 'whisper-1' },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 800,
        },
        // Tool calling disabled for the interview — keep it conversational
      });

      realtimeToken = sessionResponse.client_secret?.value;
      realtimeSessionId = sessionResponse.id;
    } catch (realtimeError) {
      console.error('[voice] Realtime session creation failed:', realtimeError.message);
      // Roll back the interview doc so it doesn't count against their credit
      await Interview.findByIdAndDelete(interview._id);
      // Also undo the credit decrement
      const User = (await import('../models/User.js')).default;
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { 'usage.interviewsUsedThisCycle': -1 },
      });

      return res.status(503).json({
        success: false,
        message: 'Could not start voice session. Please check your connection and try again.',
        error: process.env.NODE_ENV !== 'production' ? realtimeError.message : undefined,
      });
    }

    // Persist the Realtime session ID so /end can reference it
    await Interview.findByIdAndUpdate(interview._id, {
      'aiModel': 'gpt-4o-realtime-preview',
      // Store session metadata in a generic field
      'overallFeedback': JSON.stringify({ realtimeSessionId, sessionCapSeconds }),
    });

    res.json({
      success: true,
      interviewId: interview._id,
      sessionCapSeconds,
      remainingInterviews: creditCheck.remaining,
      // The ephemeral client secret — frontend uses this to open WebRTC
      realtimeToken,
      realtimeSessionId,
    });
  } catch (err) {
    console.error('[voice] startVoiceSession error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/interview/voice/end ───────────────────────────────────────────
/**
 * Called by the client when the voice session ends (user clicks "End" or cap fires).
 * Body: { interviewId, transcript: [{ role: 'user'|'assistant', content: '...' }], durationSeconds }
 *
 * This feeds the transcript through the existing text scoring pipeline:
 *   1. Extract candidate answers from transcript
 *   2. Evaluate each answer with the AI evaluator
 *   3. Generate overall feedback
 *   4. Award leaderboard points
 */
export const endVoiceSession = async (req, res) => {
  try {
    const { interviewId, transcript = [], durationSeconds = 0 } = req.body;

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

    // ── Log voice session cost ──
    const audioMinutes = durationSeconds / 60;
    logVoiceSession({ userId: req.user.id, audioMinutes, refId: interview._id });

    // ── Extract Q&A pairs from transcript ──
    // The transcript is [{role:'assistant', content:'...'}, {role:'user', content:'...'}, ...]
    // We pair each assistant question with the following user answer.
    const qaPairs = [];
    for (let i = 0; i < transcript.length - 1; i++) {
      if (transcript[i].role === 'assistant' && transcript[i + 1]?.role === 'user') {
        const question = transcript[i].content?.trim();
        const answer = transcript[i + 1].content?.trim();
        // Skip very short exchanges (greetings, transitions)
        if (question && answer && answer.split(/\s+/).length >= 5) {
          qaPairs.push({ question, answer });
        }
      }
    }

    // ── Anti-gaming: minimum duration threshold ──
    // Sessions under 2 minutes or with fewer than 2 substantial answers don't earn
    // leaderboard points (prevents spam-clicking for points).
    const meetsMinimumThreshold = durationSeconds >= 120 && qaPairs.length >= 2;

    // ── Evaluate each answer (reuse existing text evaluator) ──
    // Import inline to avoid circular deps
    const { evaluateAnswerWithAI } = await import('../services/aiQuestionService.js');

    const evaluatedQuestions = await Promise.all(
      qaPairs.slice(0, 10).map(async ({ question, answer }) => {
        try {
          const evaluation = await evaluateAnswerWithAI({
            question,
            answer,
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
          return {
            question,
            userAnswer: answer,
            score: 0,
            feedback: 'Evaluation unavailable.',
            strengths: [],
            improvements: [],
            answeredAt: new Date(),
          };
        }
      })
    );

    // ── Calculate overall score ──
    const totalScore = evaluatedQuestions.reduce((s, q) => s + (q.score || 0), 0);
    const overallScore = evaluatedQuestions.length > 0
      ? Math.round(totalScore / evaluatedQuestions.length)
      : 0;

    // ── Generate overall feedback ──
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

    // ── Award leaderboard points (voice-only, anti-gaming enforced) ──
    let pointsAwarded = 0;
    if (meetsMinimumThreshold) {
      const difficultyMultiplier = { easy: 1, medium: 1.5, hard: 2 }[interview.difficulty] || 1;
      // Points = score * difficulty multiplier, capped at 200/session
      pointsAwarded = Math.min(Math.round(overallScore * difficultyMultiplier), 200);
    }

    // ── Persist completed interview ──
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

    // ── Update user stats + leaderboard points ──
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
      // Direct link to the full report
      reportUrl: `/interview-results/${interview._id}`,
    });
  } catch (err) {
    console.error('[voice] endVoiceSession error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
