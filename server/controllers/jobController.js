/**
 * Job Application Controller
 * Handles all job-readiness platform endpoints.
 */

import fs from 'fs';
import path from 'path';
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

// ── helpers ──────────────────────────────────────────────────────────────────

const extractTextFromFile = async (filePath, mimeType) => {
  const buffer = fs.readFileSync(filePath);
  if (mimeType === 'application/pdf' || filePath.endsWith('.pdf')) {
    const data = await pdfParse(buffer);
    return data.text;
  }
  // DOCX / DOC
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
};

const jobNotFound = (res) => res.status(404).json({ success: false, message: 'Job application not found' });

const getUserId = (req) => req.user._id || req.user.id;

// ── CRUD ──────────────────────────────────────────────────────────────────────

/** POST /api/jobs — create job application */
export const createJob = async (req, res) => {
  try {
    const { title, company, jobDescription } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'title is required' });

    const job = await JobApplication.create({
      userId: getUserId(req),
      title: title.trim(),
      company: company?.trim() || '',
      jobDescription: jobDescription?.trim() || '',
      status: 'analyzing',
    });

    // Parse JD in background if provided
    if (jobDescription?.trim()) {
      parseJD(jobDescription, { userId: getUserId(req), refId: job._id })
        .then(async (parsed) => {
          await JobApplication.findByIdAndUpdate(job._id, { parsedJD: parsed, status: 'ready' });
        })
        .catch((err) => console.error('[createJob] parseJD background error:', err.message));
    } else {
      await JobApplication.findByIdAndUpdate(job._id, { status: 'ready' });
    }

    res.status(201).json({ success: true, data: job });
  } catch (err) {
    console.error('[createJob]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/jobs — list user's jobs */
export const listJobs = async (req, res) => {
  try {
    const jobs = await JobApplication.find({ userId: getUserId(req) })
      .select('title company status atsScore readinessScore createdAt updatedAt parsedJD.title parsedJD.company')
      .sort({ updatedAt: -1 })
      .lean();
    res.json({ success: true, data: jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/jobs/:id — get single job */
export const getJob = async (req, res) => {
  try {
    const job = await JobApplication.findOne({ _id: req.params.id, userId: getUserId(req) });
    if (!job) return jobNotFound(res);
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** DELETE /api/jobs/:id */
export const deleteJob = async (req, res) => {
  try {
    const job = await JobApplication.findOneAndDelete({ _id: req.params.id, userId: getUserId(req) });
    if (!job) return jobNotFound(res);
    res.json({ success: true, message: 'Job application deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Resume ────────────────────────────────────────────────────────────────────

/** POST /api/jobs/:id/upload-resume — multer file upload */
export const uploadResume = async (req, res) => {
  try {
    const job = await JobApplication.findOne({ _id: req.params.id, userId: getUserId(req) });
    if (!job) return jobNotFound(res);
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const { path: filePath, originalname, mimetype } = req.file;

    let text = '';
    try {
      text = await extractTextFromFile(filePath, mimetype);
    } finally {
      // Clean up temp file
      fs.unlink(filePath, () => {});
    }

    if (!text || text.trim().length < 50) {
      return res.status(400).json({ success: false, message: 'Could not extract text from file. Please ensure it is not scanned/image-only.' });
    }

    const parsed = await parseResume(text, { userId: getUserId(req), refId: job._id });

    const updatedJob = await JobApplication.findByIdAndUpdate(
      job._id,
      { resumeText: text, resumeFileName: originalname, parsedResume: parsed },
      { new: true }  // return the updated document
    );

    res.json({ success: true, data: updatedJob });
  } catch (err) {
    console.error('[uploadResume]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── JD Parsing ────────────────────────────────────────────────────────────────

/** POST /api/jobs/:id/parse-jd */
export const parseJDRoute = async (req, res) => {
  try {
    const job = await JobApplication.findOne({ _id: req.params.id, userId: getUserId(req) });
    if (!job) return jobNotFound(res);

    const jdText = req.body.jobDescription || job.jobDescription;
    if (!jdText?.trim()) return res.status(400).json({ success: false, message: 'jobDescription is required' });

    const parsed = await parseJD(jdText, { userId: getUserId(req), refId: job._id });

    await JobApplication.findByIdAndUpdate(job._id, {
      jobDescription: jdText,
      parsedJD: parsed,
      status: 'ready',
    });

    res.json({ success: true, data: parsed });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── ATS Score ─────────────────────────────────────────────────────────────────

/** POST /api/jobs/:id/ats-score */
export const runATSScore = async (req, res) => {
  try {
    const job = await JobApplication.findOne({ _id: req.params.id, userId: getUserId(req) });
    if (!job) return jobNotFound(res);
    if (!job.parsedResume?.skills?.length) return res.status(400).json({ success: false, message: 'Upload and parse resume first' });
    if (!job.parsedJD?.requiredSkills?.length) return res.status(400).json({ success: false, message: 'Parse job description first' });

    const result = await calculateATSScore(job.parsedResume, job.parsedJD, { userId: getUserId(req), refId: job._id });

    const update = {
      atsScore: result.atsScore,
      atsBreakdown: result.atsBreakdown,
      atsStrongMatches: result.atsStrongMatches,
      atsMissingSkills: result.atsMissingSkills,
      atsWeakMatches: result.atsWeakMatches,
      atsRecommendations: result.atsRecommendations,
    };

    // Recalculate readiness score
    const updatedJob = Object.assign(job.toObject(), update);
    const { readinessScore, readinessBreakdown } = calculateReadinessScore(updatedJob);
    update.readinessScore = readinessScore;
    update.readinessBreakdown = readinessBreakdown;

    await JobApplication.findByIdAndUpdate(job._id, update);
    res.json({ success: true, data: update });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Skill Gap ─────────────────────────────────────────────────────────────────

/** POST /api/jobs/:id/skill-gap */
export const runSkillGap = async (req, res) => {
  try {
    const job = await JobApplication.findOne({ _id: req.params.id, userId: getUserId(req) });
    if (!job) return jobNotFound(res);
    if (!job.parsedResume?.skills?.length) return res.status(400).json({ success: false, message: 'Upload and parse resume first' });
    if (!job.parsedJD?.requiredSkills?.length) return res.status(400).json({ success: false, message: 'Parse job description first' });

    const skillGap = await analyzeSkillGap(job.parsedResume, job.parsedJD, { userId: getUserId(req), refId: job._id });

    const update = { skillGap };

    // Recalculate readiness score
    const updatedJob = Object.assign(job.toObject(), update);
    const { readinessScore, readinessBreakdown } = calculateReadinessScore(updatedJob);
    update.readinessScore = readinessScore;
    update.readinessBreakdown = readinessBreakdown;

    await JobApplication.findByIdAndUpdate(job._id, update);
    res.json({ success: true, data: skillGap });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Tailor Resume ─────────────────────────────────────────────────────────────

/** POST /api/jobs/:id/tailor-resume */
export const runTailorResume = async (req, res) => {
  try {
    const job = await JobApplication.findOne({ _id: req.params.id, userId: getUserId(req) });
    if (!job) return jobNotFound(res);
    if (!job.resumeText) return res.status(400).json({ success: false, message: 'Upload resume first' });
    if (!job.parsedJD?.requiredSkills?.length) return res.status(400).json({ success: false, message: 'Parse job description first' });

    const result = await tailorResume(
      job.resumeText,
      job.parsedResume || {},
      job.parsedJD,
      job.skillGap || {},
      { userId: getUserId(req), refId: job._id }
    );

    const update = { tailoredResume: result };
    const updatedJob = Object.assign(job.toObject(), update);
    const { readinessScore, readinessBreakdown } = calculateReadinessScore(updatedJob);
    update.readinessScore = readinessScore;
    update.readinessBreakdown = readinessBreakdown;

    await JobApplication.findByIdAndUpdate(job._id, update);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Cover Letter ──────────────────────────────────────────────────────────────

/** POST /api/jobs/:id/cover-letter */
export const runCoverLetter = async (req, res) => {
  try {
    const job = await JobApplication.findOne({ _id: req.params.id, userId: getUserId(req) });
    if (!job) return jobNotFound(res);
    if (!job.parsedResume?.name) return res.status(400).json({ success: false, message: 'Upload and parse resume first' });
    if (!job.parsedJD?.title) return res.status(400).json({ success: false, message: 'Parse job description first' });

    const result = await generateCoverLetter(job.parsedResume, job.parsedJD, { userId: getUserId(req), refId: job._id });

    const update = { coverLetter: result };
    const updatedJob = Object.assign(job.toObject(), update);
    const { readinessScore, readinessBreakdown } = calculateReadinessScore(updatedJob);
    update.readinessScore = readinessScore;
    update.readinessBreakdown = readinessBreakdown;

    await JobApplication.findByIdAndUpdate(job._id, update);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Quiz ──────────────────────────────────────────────────────────────────────

/** POST /api/jobs/:id/generate-quiz */
export const runGenerateQuiz = async (req, res) => {
  try {
    const job = await JobApplication.findOne({ _id: req.params.id, userId: getUserId(req) });
    if (!job) return jobNotFound(res);
    if (!job.parsedJD?.title) return res.status(400).json({ success: false, message: 'Parse job description first' });

    const questions = await generateQuiz(job.parsedJD, job.parsedResume || {}, { userId: getUserId(req), refId: job._id });

    await JobApplication.findByIdAndUpdate(job._id, {
      'quiz.questions': questions,
      'quiz.totalQuestions': questions.length,
      'quiz.userAnswers': [],
      'quiz.score': null,
      'quiz.completedAt': null,
    });

    res.json({ success: true, data: { questions, totalQuestions: questions.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** POST /api/jobs/:id/submit-quiz */
export const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body; // [{ questionIndex, selectedOption }]
    if (!Array.isArray(answers)) return res.status(400).json({ success: false, message: 'answers array is required' });

    const job = await JobApplication.findOne({ _id: req.params.id, userId: getUserId(req) });
    if (!job) return jobNotFound(res);
    if (!job.quiz?.questions?.length) return res.status(400).json({ success: false, message: 'Generate quiz first' });

    const questions = job.quiz.questions;
    const userAnswers = answers.map(a => ({
      questionIndex: a.questionIndex,
      selectedOption: a.selectedOption,
      isCorrect: questions[a.questionIndex]?.correctAnswer === a.selectedOption,
      answeredAt: new Date(),
    }));

    const correct = userAnswers.filter(a => a.isCorrect).length;

    // Category scores
    const cats = { technical: { correct: 0, total: 0 }, hr: { correct: 0, total: 0 }, roleSpecific: { correct: 0, total: 0 }, advanced: { correct: 0, total: 0 } };
    userAnswers.forEach(a => {
      const q = questions[a.questionIndex];
      if (q) {
        const cat = q.category || 'technical';
        if (cats[cat]) {
          cats[cat].total++;
          if (a.isCorrect) cats[cat].correct++;
        }
      }
    });

    const categoryScores = {};
    Object.entries(cats).forEach(([cat, { correct: c, total: t }]) => {
      categoryScores[cat] = t > 0 ? Math.round((c / t) * 100) : 0;
    });

    // Identify weak areas (categories < 60%)
    const weakAreas = Object.entries(categoryScores)
      .filter(([, score]) => score < 60)
      .map(([cat]) => cat);

    const update = {
      'quiz.userAnswers': userAnswers,
      'quiz.score': correct,
      'quiz.categoryScores': categoryScores,
      'quiz.weakAreas': weakAreas,
      'quiz.completedAt': new Date(),
    };

    const updatedJob = Object.assign(job.toObject(), { quiz: { ...job.quiz.toObject(), ...update } });
    const { readinessScore, readinessBreakdown } = calculateReadinessScore(updatedJob);

    await JobApplication.findByIdAndUpdate(job._id, {
      ...update,
      readinessScore,
      readinessBreakdown,
    });

    res.json({
      success: true,
      data: {
        score: correct,
        totalQuestions: questions.length,
        percentage: Math.round((correct / questions.length) * 100),
        categoryScores,
        weakAreas,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Preparation Plan ──────────────────────────────────────────────────────────

/** POST /api/jobs/:id/preparation-plan */
export const runPreparationPlan = async (req, res) => {
  try {
    const job = await JobApplication.findOne({ _id: req.params.id, userId: getUserId(req) });
    if (!job) return jobNotFound(res);
    if (!job.parsedJD?.title) return res.status(400).json({ success: false, message: 'Parse job description first' });

    const result = await generatePreparationPlan(
      job.parsedJD,
      job.skillGap || {},
      job.parsedResume || {},
      { userId: getUserId(req), refId: job._id }
    );

    const update = { preparationPlan: result, status: 'preparing' };
    const updatedJob = Object.assign(job.toObject(), update);
    const { readinessScore, readinessBreakdown } = calculateReadinessScore(updatedJob);
    update.readinessScore = readinessScore;
    update.readinessBreakdown = readinessBreakdown;

    await JobApplication.findByIdAndUpdate(job._id, update);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Readiness Score ───────────────────────────────────────────────────────────

/** GET /api/jobs/:id/readiness-score */
export const getReadinessScore = async (req, res) => {
  try {
    const job = await JobApplication.findOne({ _id: req.params.id, userId: getUserId(req) });
    if (!job) return jobNotFound(res);

    const { readinessScore, readinessBreakdown } = calculateReadinessScore(job.toObject());
    await JobApplication.findByIdAndUpdate(job._id, { readinessScore, readinessBreakdown });

    res.json({ success: true, data: { readinessScore, readinessBreakdown } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

