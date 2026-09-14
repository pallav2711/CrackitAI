/**
 * Resume Scanner Controller
 *
 * Text extraction: kept as-is (pdf-parse + mammoth — solid and cheap).
 * Analysis: replaced regex/heuristic pipeline with a single gpt-4o-mini call
 *           that returns structured JSON covering all the same fields the
 *           ResumeAnalysis schema already stores.
 *
 * Fallback: if the LLM call fails for any reason, the old regex pipeline
 *           runs so the feature never goes completely dark.
 */

import OpenAI from 'openai';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs';
import { logChatCall } from '../services/aiCostLogger.js';

// ─── OpenAI client ────────────────────────────────────────────────────────────
let openai = null;
const getOpenAI = () => {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
};

const RESUME_SCAN_MODEL = 'gpt-4o-mini';

// ─── Text extraction (unchanged) ─────────────────────────────────────────────
const extractText = async (file) => {
  const ext = file.originalname.split('.').pop().toLowerCase();
  try {
    if (ext === 'pdf') {
      const buf = fs.readFileSync(file.path);
      const data = await pdfParse(buf);
      return data.text;
    } else if (ext === 'docx' || ext === 'doc') {
      const result = await mammoth.extractRawText({ path: file.path });
      return result.value;
    } else {
      throw new Error('Unsupported file format. Upload a PDF or DOCX.');
    }
  } finally {
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
  }
};

// ─── LLM analysis ─────────────────────────────────────────────────────────────
/**
 * Call gpt-4o-mini once with the resume text.
 * Returns a structured object that maps directly to the ResumeAnalysis schema.
 */
const analyzeWithLLM = async (resumeText, userId) => {
  const client = getOpenAI();
  if (!client) throw new Error('OpenAI API key not configured');

  // Trim to 6000 chars to stay well within the model's context limit for this prompt
  const truncated = resumeText.substring(0, 6000);

  const systemPrompt = `You are an expert ATS (Applicant Tracking System) analyst and career coach.
Analyze the resume text provided and return ONLY valid JSON — no extra text, no markdown fences.

Score each section 0-100 using these criteria:
- contactInfo: has name, email, phone
- formatting: clear sections, bullet points, consistent structure
- keywords: action verbs, industry-relevant technical/soft skills
- experience: quantifiable achievements, dates, company names
- education: degree, institution, graduation year
- skills: dedicated skills section, breadth and relevance
- length: ideal 300-800 words for a fresher/junior, 400-1000 for mid/senior

ATS score = weighted average:
  keywords 20% + experience 20% + contactInfo 15% + formatting 15% + skills 15% + education 10% + length 5%

Return this exact JSON schema (all fields required):
{
  "atsScore": <0-100>,
  "scores": {
    "contactInfo": <0-100>,
    "formatting": <0-100>,
    "keywords": <0-100>,
    "experience": <0-100>,
    "education": <0-100>,
    "skills": <0-100>,
    "length": <0-100>
  },
  "detectedSections": {
    "hasContactInfo": <bool>,
    "hasEmail": <bool>,
    "hasPhone": <bool>,
    "hasSummary": <bool>,
    "hasExperience": <bool>,
    "hasEducation": <bool>,
    "hasSkills": <bool>,
    "hasProjects": <bool>,
    "hasCertifications": <bool>
  },
  "extractedData": {
    "name": "<full name or empty string>",
    "email": "<email or empty string>",
    "phone": "<phone or empty string>",
    "skills": ["<skill1>", "<skill2>"],
    "keywords": ["<keyword1>", "<keyword2>"],
    "educationLevel": "<e.g. B.Tech, Master's, or empty>",
    "experienceYears": <number or 0 if fresher>
  },
  "strengths": [
    "<specific strength with evidence>",
    "<specific strength with evidence>",
    "<specific strength with evidence>"
  ],
  "gaps": [
    "<specific gap or missing element>",
    "<specific gap or missing element>",
    "<specific gap or missing element>"
  ],
  "suggestedFixes": [
    "<actionable, specific fix>",
    "<actionable, specific fix>",
    "<actionable, specific fix>",
    "<actionable, specific fix>"
  ],
  "missingKeywords": ["<keyword>", "<keyword>"],
  "formattingIssues": ["<issue>" ],
  "wordCount": <integer>,
  "atsCompatible": <bool>,
  "atsIssues": ["<ATS compatibility issue if any>"]
}`;

  const userPrompt = `Analyze this resume:\n\n${truncated}`;

  const response = await client.chat.completions.create({
    model: RESUME_SCAN_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.1,
    max_tokens: 1500,
    response_format: { type: 'json_object' },
  });

  // Log cost asynchronously — never blocks the response
  if (userId) {
    logChatCall({
      userId,
      feature: 'resume-scanner',
      model: RESUME_SCAN_MODEL,
      usage: response.usage,
    });
  }

  return JSON.parse(response.choices[0].message.content);
};

// ─── Regex fallback (kept from original, used when LLM is unavailable) ────────
const analyzeWithRegex = (text) => {
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const lines = text.split('\n').filter((l) => l.trim());
  const firstLine = lines[0]?.trim() || '';
  const nameGuess = firstLine.length < 50 && /^[A-Z][a-z]+(\s[A-Z][a-z]+)+/.test(firstLine)
    ? firstLine
    : '';

  const sectionCheck = (re) => re.test(text);
  const wordCount = text.split(/\s+/).length;

  // Contact score
  const contactInfo = (emailMatch ? 35 : 0) + (phoneMatch ? 35 : 0) + (nameGuess ? 30 : 0);

  // Formatting
  const sects = ['experience', 'education', 'skills', 'summary', 'objective']
    .filter((s) => new RegExp(s, 'i').test(text)).length;
  const formatting = Math.min(20 + sects * 15 + (/[•\-\*]/.test(text) ? 20 : 0), 100);

  // Keywords
  const profKw = ['managed','developed','led','created','implemented','designed',
    'analyzed','improved','increased','reduced','achieved','delivered',
    'collaborated','coordinated','established','executed','optimized'];
  const techKw = ['javascript','python','java','react','node','sql','aws','docker',
    'kubernetes','git','agile','api','database','cloud','machine learning'];
  const textLower = text.toLowerCase();
  const found = [...profKw.filter((k) => textLower.includes(k)),
                  ...techKw.filter((k) => textLower.includes(k))];
  const keywords = Math.min(found.length * 3, 100);

  // Experience
  const dates = text.match(/\b(19|20)\d{2}\b/g) || [];
  const quant = text.match(/\d+%|\$\d+|[\d,]+\s*(users|customers|clients|projects)/gi) || [];
  const experience = (/experience/i.test(text) ? 30 : 0) +
    (dates.length >= 2 ? 30 : 0) + (quant.length > 0 ? 40 : 0);

  // Education
  const degs = ['bachelor','master','phd','doctorate','associate','diploma'].filter(
    (d) => new RegExp(d, 'i').test(text));
  const education = Math.min(
    (/education/i.test(text) ? 40 : 0) +
    (degs.length > 0 ? 30 : 0) +
    (/university|college|institute/i.test(text) ? 30 : 0), 100);

  // Skills
  const skillsMatch = text.match(/skills[:\s]+([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i);
  const skillsList = skillsMatch
    ? skillsMatch[1].split(/[,\n•\-\*]/).map((s) => s.trim()).filter((s) => s.length > 2 && s.length < 30)
    : [];
  const skills = Math.min((/skills/i.test(text) ? 40 : 0) + (skillsList.length >= 5 ? 30 : 0) +
    (skillsList.length >= 10 ? 30 : 0), 100);

  const length = wordCount >= 300 && wordCount <= 1000 ? 100
    : wordCount >= 200 && wordCount <= 1500 ? 70
    : wordCount < 200 ? 30 : 50;

  const atsScore = Math.round(
    keywords * 0.20 + experience * 0.20 + contactInfo * 0.15 +
    formatting * 0.15 + skills * 0.15 + education * 0.10 + length * 0.05);

  const strengths = [];
  const gaps = [];
  const suggestedFixes = [];

  if (contactInfo > 70) strengths.push('Complete contact information');
  else { gaps.push('Incomplete contact information'); suggestedFixes.push('Add email, phone, and full name at the top'); }
  if (experience > 50) strengths.push('Work experience section present');
  else { gaps.push('Thin work experience section'); suggestedFixes.push('Add quantifiable achievements with numbers and percentages'); }
  if (education > 50) strengths.push('Education section complete');
  else { gaps.push('Education section missing or weak'); suggestedFixes.push('Add degree, institution, and graduation year'); }
  if (skills > 50) strengths.push('Skills section present');
  else { gaps.push('Limited skills listed'); suggestedFixes.push('Add a dedicated skills section with 8-12 relevant skills'); }
  if (keywords > 60) strengths.push('Good use of professional keywords');
  else { gaps.push('Low keyword density'); suggestedFixes.push('Add more action verbs and industry-specific technical terms'); }

  return {
    atsScore,
    scores: { contactInfo, formatting, keywords, experience, education, skills, length },
    detectedSections: {
      hasContactInfo: contactInfo > 50,
      hasEmail: !!emailMatch,
      hasPhone: !!phoneMatch,
      hasSummary: sectionCheck(/summary|objective/i),
      hasExperience: sectionCheck(/experience/i),
      hasEducation: sectionCheck(/education/i),
      hasSkills: sectionCheck(/skills/i),
      hasProjects: sectionCheck(/project/i),
      hasCertifications: sectionCheck(/certif/i),
    },
    extractedData: {
      name: nameGuess,
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0] : '',
      skills: skillsList,
      keywords: found,
      educationLevel: degs[0] || '',
      experienceYears: 0,
    },
    strengths,
    gaps,
    suggestedFixes,
    missingKeywords: techKw.filter((k) => !textLower.includes(k)).slice(0, 6),
    formattingIssues: /[•\-\*]/.test(text) ? [] : ['Consider using bullet points for better ATS readability'],
    wordCount,
    atsCompatible: atsScore >= 50,
    atsIssues: atsScore < 50 ? ['Low overall ATS score — resume may be filtered out by automated systems'] : [],
  };
};

// ─── Main scan handler ────────────────────────────────────────────────────────
export const scanResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const extractedText = await extractText(req.file);

    if (!extractedText || extractedText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        error: 'Could not extract text from resume. Ensure the file is not password-protected or corrupted.',
      });
    }

    // ── Try LLM analysis first ──
    let result;
    let analysisMethod = 'ai';
    try {
      result = await analyzeWithLLM(extractedText, req.user.id);
    } catch (llmError) {
      console.warn('[resumeScanner] LLM analysis failed, falling back to regex:', llmError.message);
      result = analyzeWithRegex(extractedText);
      analysisMethod = 'regex-fallback';
    }

    // ── Persist to DB ──
    const analysis = new ResumeAnalysis({
      userId: req.user.id,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      extractedText: extractedText.substring(0, 5000),
      atsScore: result.atsScore ?? 0,
      scores: result.scores ?? {},
      detectedSections: result.detectedSections ?? {},
      extractedData: result.extractedData ?? {},
      strengths: result.strengths ?? [],
      weaknesses: result.gaps ?? [],        // map "gaps" → "weaknesses" for schema compat
      suggestions: result.suggestedFixes ?? [],
      missingKeywords: result.missingKeywords ?? [],
      formattingIssues: result.formattingIssues ?? [],
      wordCount: result.wordCount ?? extractedText.split(/\s+/).length,
      atsCompatible: result.atsCompatible ?? true,
      atsIssues: result.atsIssues ?? [],
    });

    await analysis.save();

    // ── Update user resume score stat ──
    const User = (await import('../models/User.js')).default;
    await User.findByIdAndUpdate(req.user.id, {
      'stats.resumeScore': result.atsScore,
    });

    res.json({
      success: true,
      analysisId: analysis._id,
      fileName: analysis.fileName,
      atsScore: analysis.atsScore,
      scores: analysis.scores,
      detectedSections: analysis.detectedSections,
      extractedData: {
        // Never return raw email/phone in the response body — reference by presence only
        hasEmail: !!analysis.extractedData?.email,
        hasPhone: !!analysis.extractedData?.phone,
        name: analysis.extractedData?.name,
        skills: analysis.extractedData?.skills,
        keywords: analysis.extractedData?.keywords,
        educationLevel: analysis.extractedData?.educationLevel,
        experienceYears: analysis.extractedData?.experienceYears,
      },
      strengths: analysis.strengths,
      gaps: result.gaps ?? analysis.weaknesses,
      suggestedFixes: result.suggestedFixes ?? analysis.suggestions,
      missingKeywords: analysis.missingKeywords,
      wordCount: analysis.wordCount,
      formattingIssues: analysis.formattingIssues,
      atsCompatible: analysis.atsCompatible,
      atsIssues: analysis.atsIssues,
      // Tell the client which method was used (useful for trust/transparency)
      analysisMethod,
      // CTA hook per the rebuild plan
      cta: {
        message: 'See how you\'d actually perform live →',
        link: '/interview/setup',
        label: 'Start a free voice interview',
      },
    });
  } catch (error) {
    console.error('[resumeScanner] scan error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to scan resume' });
  }
};

// ─── History, get, delete — unchanged logic ───────────────────────────────────
export const getScanHistory = async (req, res) => {
  try {
    const analyses = await ResumeAnalysis.find({ userId: req.user.id })
      .select('-extractedText')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, data: analyses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAnalysis = async (req, res) => {
  try {
    const analysis = await ResumeAnalysis.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!analysis) return res.status(404).json({ success: false, error: 'Analysis not found' });
    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteAnalysis = async (req, res) => {
  try {
    const analysis = await ResumeAnalysis.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!analysis) return res.status(404).json({ success: false, error: 'Analysis not found' });
    res.json({ success: true, message: 'Analysis deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
