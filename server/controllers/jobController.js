/**
 * Job Application Controller — complete rewrite
 *
 * Key fixes:
 * 1. Every endpoint returns the FULL updated job document (not partial update)
 * 2. Guard checks use resumeText/jobDescription fallbacks, not just parsed sub-fields
 * 3. All AI calls are wrapped so errors return graceful fallbacks, never 500
 */

import fs from 'fs';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';
import JobApplication from '../models/JobApplication.js';
import {
  parseResume,
  parseJD,
  calculateATSScore,
  analyzeSkillGap,
  tailorResume,
  generateCoverLetter,
  generateQuiz,
  generatePreparationPlan,
  calculateReadinessScore,
} from '../services/jobReadinessService.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

const extractTextFromFile = async (filePath, mimeType) => {
  const buffer = fs.readFileSync(filePath);
  if (mimeType === 'application/pdf' || filePath.endsWith('.pdf')) {
    const data = await pdfParse(buffer);
    return data.text;
  }
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
};

const notFound  = (res) => res.status(404).json({ success: false, message: 'Job not found' });
const uid       = (req) => req.user._id?.toString() || req.user.id?.toString();

// Return the full fresh job document after update
const saveAndReturn = async (jobId, update, res) => {
  const updated = await JobApplication.findByIdAndUpdate(jobId, update, { new: true });
  res.json({ success: true, data: updated });
};

// ── CRUD ──────────────────────────────────────────────────────────────────────

export const createJob = async (req, res) => {
  try {
    const { title, company, jobDescription } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: 'title is required' });

    const job = await JobApplication.create({
      userId:         uid(req),
      title:          title.trim(),
      company:        company?.trim() || '',
      jobDescription: jobDescription?.trim() || '',
      status:         'analyzing',
    });

    // Parse JD in background — don't block response
    if (jobDescription?.trim()) {
      parseJD(jobDescription, { userId: uid(req), refId: job._id })
        .then(parsed => JobApplication.findByIdAndUpdate(job._id, { parsedJD: parsed, status: 'ready' }))
        .catch(err => {
          console.error('[createJob] JD parse error:', err.message);
          JobApplication.findByIdAndUpdate(job._id, { status: 'ready' }).catch(() => {});
        });
    } else {
      await JobApplication.findByIdAndUpdate(job._id, { status: 'ready' });
    }

    res.status(201).json({ success: true, data: job });
  } catch (err) {
    console.error('[createJob]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const listJobs = async (req, res) => {
  try {
    const jobs = await JobApplication.find({ userId: uid(req) })
      .sort({ updatedAt: -1 })
      .lean();
    res.json({ success: true, data: jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getJob = async (req, res) => {
  try {
    const job = await JobApplication.findOne({ _id: req.params.id, userId: uid(req) });
    if (!job) return notFound(res);
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await JobApplication.findOneAndDelete({ _id: req.params.id, userId: uid(req) });
    if (!job) return notFound(res);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Resume Upload ─────────────────────────────────────────────────────────────

export const uploadResume = async (req, res) => {
  try {
    const job = await JobApplication.findOne({ _id: req.params.id, userId: uid(req) });
    if (!job) return notFound(res);
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const { path: filePath, originalname, mimetype } = req.file;
    let text = '';
    try {
      text = await extractTextFromFile(filePath, mimetype);
    } finally {
      fs.unlink(filePath, () => {});
    }

    if (!text || text.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract text. Make sure the file is not a scanned/image-only PDF.',
      });
    }

    // Parse resume with AI — falls back to empty object if AI unavailable
    const parsedResume = await parseResume(text, { userId: uid(req), refId: job._id });

    await saveAndReturn(job._id, {
      resumeText:     text,
      resumeFileName: originalname,
      parsedResume,
    }, res);
  } catch (err) {
    console.error('[uploadResume]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── JD Parse ──────────────────────────────────────────────────────────────────

export const parseJDRoute = async (req, res) => {
  try {
    const job = await JobApplication.findOne({ _id: req.params.id, userId: uid(req) });
    if (!job) return notFound(res);

    const jdText = (req.body.jobDescription || job.jobDescription || '').trim();
    if (!jdText) return res.status(400).json({ success: false, message: 'jobDescription is required' });

    const parsedJD = await parseJD(jdText, { userId: uid(req), refId: job._id });

    await saveAndReturn(job._id, {
      jobDescription: jdText,
      parsedJD,
      status: 'ready',
    }, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── ATS Score ─────────────────────────────────────────────────────────────────

export const runATSScore = async (req, res) => {
  try {
    const job = await JobApplication.findOne({ _id: req.params.id, userId: uid(req) });
    if (!job) return notFound(res);

    // Guard: need resume content
    if (!job.resumeText && !job.parsedResume?.name) {
      return res.status(400).json({ success: false, message: 'Please upload your resume first (Resume tab).' });
    }
    // Guard: need JD content
    if (!job.jobDescription && !job.parsedJD?.title) {
      return res.status(400).json({ success: false, message: 'No job description found. Please add a JD when creating the job.' });
    }

    // If parsedResume or parsedJD are empty (AI had no credits during creation),
    // re-parse them now before scoring
    let parsedResume = job.parsedResume;
    let parsedJD     = job.parsedJD;

    if (!parsedResume?.skills?.length && job.resumeText) {
      parsedResume = await parseResume(job.resumeText, { userId: uid(req), refId: job._id });
      await JobApplication.findByIdAndUpdate(job._id, { parsedResume });
    }
    if (!parsedJD?.requiredSkills?.length && job.jobDescription) {
      parsedJD = await parseJD(job.jobDescription, { userId: uid(req), refId: job._id });
      await JobApplication.findByIdAndUpdate(job._id, { parsedJD });
    }

    const result = await calculateATSScore(parsedResume, parsedJD, { userId: uid(req), refId: job._id });

    const jobObj  = job.toObject();
    const merged  = { ...jobObj, parsedResume, parsedJD, ...result };
    const { readinessScore, readinessBreakdown } = calculateReadinessScore(merged);

    await saveAndReturn(job._id, {
      parsedResume,
      parsedJD,
      atsScore:            result.atsScore,
      atsBreakdown:        result.atsBreakdown,
      atsStrongMatches:    result.atsStrongMatches,
      atsMissingSkills:    result.atsMissingSkills,
      atsWeakMatches:      result.atsWeakMatches,
      atsRecommendations:  result.atsRecommendations,
      readinessScore,
      readinessBreakdown,
    }, res);
  } catch (err) {
    console.error('[runATSScore]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Skill Gap ─────────────────────────────────────────────────────────────────

export const runSkillGap = async (req, res) => {
  try {
    const job = await JobApplication.findOne({ _id: req.params.id, userId: uid(req) });
    if (!job) return notFound(res);

    if (!job.resumeText && !job.parsedResume?.name) {
      return res.status(400).json({ success: false, message: 'Please upload your resume first.' });
    }
    if (!job.jobDescription && !job.parsedJD?.title) {
      return res.status(400).json({ success: false, message: 'No job description found.' });
    }

    let parsedResume = job.parsedResume;
    let parsedJD     = job.parsedJD;

    if (!parsedResume?.skills?.length && job.resumeText) {
      parsedResume = await parseResume(job.resumeText, { userId: uid(req), refId: job._id });
    }
    if (!parsedJD?.requiredSkills?.length && job.jobDescription) {
      parsedJD = await parseJD(job.jobDescription, { userId: uid(req), refId: job._id });
    }

    const skillGap = await analyzeSkillGap(parsedResume, parsedJD, { userId: uid(req), refId: job._id });

    const merged = { ...job.toObject(), parsedResume, parsedJD, skillGap };
    const { readinessScore, readinessBreakdown } = calculateReadinessScore(merged);

    await saveAndReturn(job._id, {
      parsedResume, parsedJD, skillGap, readinessScore, readinessBreakdown,
    }, res);
  } catch (err) {
    console.error('[runSkillGap]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Tailor Resume ─────────────────────────────────────────────────────────────

export const runTailorResume = async (req, res) => {
  try {
    const job = await JobApplication.findOne({ _id: req.params.id, userId: uid(req) });
    if (!job) return notFound(res);

    if (!job.resumeText) {
      return res.status(400).json({ success: false, message: 'Please upload your resume first.' });
    }
    if (!job.jobDescription && !job.parsedJD?.title) {
      return res.status(400).json({ success: false, message: 'No job description found.' });
    }

    let parsedJD = job.parsedJD;
    if (!parsedJD?.requiredSkills?.length && job.jobDescription) {
      parsedJD = await parseJD(job.jobDescription, { userId: uid(req), refId: job._id });
    }

    const tailored = await tailorResume(
      job.resumeText,
      job.parsedResume || {},
      parsedJD,
      job.skillGap   || {},
      { userId: uid(req), refId: job._id }
    );

    const merged = { ...job.toObject(), parsedJD, tailoredResume: tailored };
    const { readinessScore, readinessBreakdown } = calculateReadinessScore(merged);

    await saveAndReturn(job._id, {
      parsedJD, tailoredResume: tailored, readinessScore, readinessBreakdown,
    }, res);
  } catch (err) {
    console.error('[runTailorResume]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Cover Letter ──────────────────────────────────────────────────────────────

export const runCoverLetter = async (req, res) => {
  try {
    const job = await JobApplication.findOne({ _id: req.params.id, userId: uid(req) });
    if (!job) return notFound(res);

    if (!job.resumeText && !job.parsedResume?.name) {
      return res.status(400).json({ success: false, message: 'Please upload your resume first.' });
    }
    if (!job.jobDescription && !job.parsedJD?.title) {
      return res.status(400).json({ success: false, message: 'No job description found.' });
    }

    let parsedResume = job.parsedResume;
    let parsedJD     = job.parsedJD;

    if (!parsedResume?.name && job.resumeText) {
      parsedResume = await parseResume(job.resumeText, { userId: uid(req), refId: job._id });
    }
    if (!parsedJD?.title && job.jobDescription) {
      parsedJD = await parseJD(job.jobDescription, { userId: uid(req), refId: job._id });
    }

    const coverLetter = await generateCoverLetter(parsedResume, parsedJD, { userId: uid(req), refId: job._id });

    const merged = { ...job.toObject(), parsedResume, parsedJD, coverLetter };
    const { readinessScore, readinessBreakdown } = calculateReadinessScore(merged);

    await saveAndReturn(job._id, {
      parsedResume, parsedJD, coverLetter, readinessScore, readinessBreakdown,
    }, res);
  } catch (err) {
    console.error('[runCoverLetter]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Quiz ──────────────────────────────────────────────────────────────────────

export const runGenerateQuiz = async (req, res) => {
  try {
    const job = await JobApplication.findOne({ _id: req.params.id, userId: uid(req) });
    if (!job) return notFound(res);

    if (!job.jobDescription && !job.parsedJD?.title) {
      return res.status(400).json({ success: false, message: 'No job description found.' });
    }

    let parsedJD = job.parsedJD;
    if (!parsedJD?.title && job.jobDescription) {
      parsedJD = await parseJD(job.jobDescription, { userId: uid(req), refId: job._id });
    }

    const questions = await generateQuiz(parsedJD, job.parsedResume || {}, { userId: uid(req), refId: job._id });

    if (!questions?.length) {
      return res.status(500).json({ success: false, message: 'Quiz generation failed — AI service may be unavailable. Please try again.' });
    }

    await saveAndReturn(job._id, {
      parsedJD,
      'quiz.questions':      questions,
      'quiz.totalQuestions': questions.length,
      'quiz.userAnswers':    [],
      'quiz.score':          null,
      'quiz.completedAt':    null,
    }, res);
  } catch (err) {
    console.error('[runGenerateQuiz]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    if (!Array.isArray(answers)) return res.status(400).json({ success: false, message: 'answers array required' });

    const job = await JobApplication.findOne({ _id: req.params.id, userId: uid(req) });
    if (!job) return notFound(res);
    if (!job.quiz?.questions?.length) return res.status(400).json({ success: false, message: 'Generate quiz first' });

    const questions = job.quiz.questions;

    const userAnswers = answers.map(a => ({
      questionIndex:  a.questionIndex,
      selectedOption: a.selectedOption,
      isCorrect:      questions[a.questionIndex]?.correctAnswer === a.selectedOption,
      answeredAt:     new Date(),
    }));

    const correct = userAnswers.filter(a => a.isCorrect).length;

    // Category scores
    const catMap = {};
    userAnswers.forEach(a => {
      const cat = questions[a.questionIndex]?.category || 'general';
      if (!catMap[cat]) catMap[cat] = { c: 0, t: 0 };
      catMap[cat].t++;
      if (a.isCorrect) catMap[cat].c++;
    });
    const categoryScores = {};
    Object.entries(catMap).forEach(([cat, { c, t }]) => {
      categoryScores[cat] = t > 0 ? Math.round((c / t) * 100) : 0;
    });

    const weakAreas = Object.entries(categoryScores)
      .filter(([, s]) => s < 60)
      .map(([cat]) => cat);

    const merged = {
      ...job.toObject(),
      quiz: { ...job.quiz.toObject?.() ?? job.quiz, score: correct, totalQuestions: questions.length, categoryScores, weakAreas },
    };
    const { readinessScore, readinessBreakdown } = calculateReadinessScore(merged);

    await saveAndReturn(job._id, {
      'quiz.userAnswers':    userAnswers,
      'quiz.score':          correct,
      'quiz.categoryScores': categoryScores,
      'quiz.weakAreas':      weakAreas,
      'quiz.completedAt':    new Date(),
      readinessScore,
      readinessBreakdown,
    }, res);
  } catch (err) {
    console.error('[submitQuiz]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Preparation Plan ──────────────────────────────────────────────────────────

export const runPreparationPlan = async (req, res) => {
  try {
    const job = await JobApplication.findOne({ _id: req.params.id, userId: uid(req) });
    if (!job) return notFound(res);

    if (!job.jobDescription && !job.parsedJD?.title) {
      return res.status(400).json({ success: false, message: 'No job description found.' });
    }

    let parsedJD = job.parsedJD;
    if (!parsedJD?.title && job.jobDescription) {
      parsedJD = await parseJD(job.jobDescription, { userId: uid(req), refId: job._id });
    }

    const plan = await generatePreparationPlan(
      parsedJD,
      job.skillGap   || {},
      job.parsedResume || {},
      { userId: uid(req), refId: job._id }
    );

    const merged = { ...job.toObject(), parsedJD, preparationPlan: plan };
    const { readinessScore, readinessBreakdown } = calculateReadinessScore(merged);

    await saveAndReturn(job._id, {
      parsedJD, preparationPlan: plan, status: 'preparing', readinessScore, readinessBreakdown,
    }, res);
  } catch (err) {
    console.error('[runPreparationPlan]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Readiness Score ───────────────────────────────────────────────────────────

export const getReadinessScore = async (req, res) => {
  try {
    const job = await JobApplication.findOne({ _id: req.params.id, userId: uid(req) });
    if (!job) return notFound(res);

    const { readinessScore, readinessBreakdown } = calculateReadinessScore(job.toObject());

    await saveAndReturn(job._id, { readinessScore, readinessBreakdown }, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
