/**
 * Job Readiness AI Service
 * All AI functions for the job-readiness platform.
 * Uses gpt-4o-mini with JSON response format.
 */

import OpenAI from 'openai';
import { logChatCall } from './aiCostLogger.js';

const MODEL = 'gpt-4o-mini';

let _client = null;
const getClient = () => {
  if (!_client && process.env.OPENAI_API_KEY) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
};

/** Helper: call OpenAI and return parsed JSON */
async function callAI({ system, user: userMsg, maxTokens = 2000, temperature = 0.3, userId, feature, refId }) {
  const client = getClient();
  if (!client) throw new Error('OpenAI API key not configured');

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: userMsg },
    ],
    temperature,
    max_tokens: maxTokens,
    response_format: { type: 'json_object' },
  });

  if (userId) {
    logChatCall({ userId, feature: feature || 'other', model: MODEL, usage: response.usage, refId, refModel: 'JobApplication' });
  }

  return JSON.parse(response.choices[0].message.content);
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * parseResume(text) → structured profile
 */
export async function parseResume(text, { userId, refId } = {}) {
  try {
    const result = await callAI({
      system: `You are an expert resume parser. Extract structured information from the provided resume text.
Return ONLY valid JSON. Be thorough and accurate. If a field is not found, use null or empty array.`,
      user: `Parse this resume and return structured JSON:

RESUME TEXT:
${text.slice(0, 6000)}

Return this exact JSON structure:
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "phone number or null",
  "summary": "professional summary or null",
  "skills": ["skill1", "skill2"],
  "experience": [
    { "title": "Job Title", "company": "Company Name", "duration": "Jan 2020 - Dec 2022", "description": "Brief description of role and achievements" }
  ],
  "education": [
    { "degree": "B.Tech Computer Science", "institution": "University Name", "year": "2020" }
  ],
  "projects": [
    { "name": "Project Name", "description": "What it does and your contribution", "tech": ["React", "Node.js"] }
  ],
  "certifications": ["Certification Name"],
  "keywords": ["keyword1", "keyword2"]
}`,
      maxTokens: 2000,
      temperature: 0.1,
      userId,
      feature: 'other',
      refId,
    });
    return result;
  } catch (err) {
    console.error('[parseResume] error:', err.message);
    return { name: null, email: null, phone: null, summary: null, skills: [], experience: [], education: [], projects: [], certifications: [], keywords: [] };
  }
}

/**
 * parseJD(text) → structured job requirements
 */
export async function parseJD(text, { userId, refId } = {}) {
  try {
    const result = await callAI({
      system: `You are an expert job description analyst. Extract structured requirements from JD text.
Return ONLY valid JSON. Be thorough and identify all technical and soft requirements.`,
      user: `Parse this job description and return structured JSON:

JD TEXT:
${text.slice(0, 5000)}

Return this exact JSON structure:
{
  "title": "Job Title",
  "company": "Company Name or null",
  "seniority": "Junior/Mid/Senior/Lead/Principal",
  "requiredSkills": ["must-have skill 1", "must-have skill 2"],
  "preferredSkills": ["nice-to-have skill 1"],
  "technologies": ["specific tech/tool/framework"],
  "responsibilities": ["key responsibility 1", "key responsibility 2"],
  "keywords": ["important keyword 1", "important keyword 2"],
  "experienceRequired": "e.g. 3-5 years",
  "educationRequired": "e.g. B.Tech CS or equivalent"
}`,
      maxTokens: 1500,
      temperature: 0.1,
      userId,
      feature: 'other',
      refId,
    });
    return result;
  } catch (err) {
    console.error('[parseJD] error:', err.message);
    return { title: null, company: null, seniority: null, requiredSkills: [], preferredSkills: [], technologies: [], responsibilities: [], keywords: [], experienceRequired: null, educationRequired: null };
  }
}

/**
 * calculateATSScore(parsedResume, parsedJD) → score + breakdown + matches + gaps
 */
export async function calculateATSScore(parsedResume, parsedJD, { userId, refId } = {}) {
  try {
    const result = await callAI({
      system: `You are an expert ATS (Applicant Tracking System) analyzer and technical recruiter.
Perform a SEMANTIC analysis — look for conceptual matches, not just exact keyword matches.
Consider synonyms, related technologies, and transferable skills.
Be precise and honest. Return only valid JSON.`,
      user: `Analyze ATS match between this resume and job description:

PARSED RESUME:
${JSON.stringify(parsedResume, null, 1).slice(0, 3000)}

PARSED JD:
${JSON.stringify(parsedJD, null, 1).slice(0, 2000)}

Return JSON with this exact structure:
{
  "atsScore": <overall 0-100>,
  "atsBreakdown": {
    "skillCoverage": <0-100, what % of required skills candidate has>,
    "experienceRelevance": <0-100, how relevant is work experience>,
    "educationMatch": <0-100, education alignment>,
    "keywordAlignment": <0-100, important JD keywords found in resume>,
    "projectRelevance": <0-100, how relevant are projects>,
    "seniorityMatch": <0-100, does exp level match JD seniority>,
    "resumeStructure": <0-100, resume completeness and structure quality>
  },
  "atsStrongMatches": ["skill/experience that strongly matches JD requirement"],
  "atsMissingSkills": ["required skill that is completely absent from resume"],
  "atsWeakMatches": ["skill mentioned but not demonstrated or lacks depth"],
  "atsRecommendations": ["specific actionable recommendation to improve ATS score"]
}

SCORING GUIDE:
- 85-100: Excellent fit, likely to pass ATS
- 70-84: Good fit, minor gaps
- 55-69: Moderate fit, needs improvement
- 40-54: Weak fit, significant gaps
- 0-39: Poor fit, major rework needed`,
      maxTokens: 2000,
      temperature: 0.2,
      userId,
      feature: 'answer-evaluation',
      refId,
    });
    return result;
  } catch (err) {
    console.error('[calculateATSScore] error:', err.message);
    return {
      atsScore: 0,
      atsBreakdown: { skillCoverage: 0, experienceRelevance: 0, educationMatch: 0, keywordAlignment: 0, projectRelevance: 0, seniorityMatch: 0, resumeStructure: 0 },
      atsStrongMatches: [], atsMissingSkills: [], atsWeakMatches: [], atsRecommendations: [],
    };
  }
}

/**
 * analyzeSkillGap(parsedResume, parsedJD) → have/missing/improve/niceToHave
 */
export async function analyzeSkillGap(parsedResume, parsedJD, { userId, refId } = {}) {
  try {
    const result = await callAI({
      system: `You are an expert technical career coach performing a skill gap analysis.
Categorize skills semantically. Consider related technologies as partial matches.
Every skill should be in exactly ONE category. Return only valid JSON.`,
      user: `Perform skill gap analysis:

CANDIDATE SKILLS & EXPERIENCE:
Skills: ${JSON.stringify(parsedResume.skills || [])}
Experience: ${JSON.stringify((parsedResume.experience || []).map(e => ({ title: e.title, description: e.description })))}
Projects: ${JSON.stringify((parsedResume.projects || []).map(p => ({ name: p.name, tech: p.tech })))}

JD REQUIREMENTS:
Required: ${JSON.stringify(parsedJD.requiredSkills || [])}
Preferred: ${JSON.stringify(parsedJD.preferredSkills || [])}
Technologies: ${JSON.stringify(parsedJD.technologies || [])}

Return this exact JSON:
{
  "have": [
    { "skill": "Skill Name", "importance": "critical|high|medium|low" }
  ],
  "missing": [
    { "skill": "Skill Name", "importance": "critical|high|medium|low", "why": "Why this matters for the role" }
  ],
  "improve": [
    { "skill": "Skill Name", "importance": "critical|high|medium|low", "why": "What specifically needs improvement" }
  ],
  "niceToHave": [
    { "skill": "Skill Name", "importance": "medium|low" }
  ]
}

Categories:
- have: Candidate clearly possesses this skill
- missing: Required/preferred skill completely absent
- improve: Has basic knowledge but needs deeper expertise
- niceToHave: Preferred skill, not required, candidate doesn't have it`,
      maxTokens: 2000,
      temperature: 0.2,
      userId,
      feature: 'answer-evaluation',
      refId,
    });
    return result;
  } catch (err) {
    console.error('[analyzeSkillGap] error:', err.message);
    return { have: [], missing: [], improve: [], niceToHave: [] };
  }
}

/**
 * tailorResume(resumeText, parsedResume, parsedJD, skillGap)
 * STRICT: never fabricate. Only reorganize, reword, and highlight existing content.
 */
export async function tailorResume(resumeText, parsedResume, parsedJD, skillGap, { userId, refId } = {}) {
  try {
    const result = await callAI({
      system: `You are an expert resume writer and ATS optimization specialist.

ABSOLUTE RULES — NEVER VIOLATE:
1. NEVER add skills, experiences, or achievements the candidate doesn't have
2. NEVER fabricate numbers, dates, or results
3. NEVER invent certifications or education
4. ONLY reorganize, reword, expand on, or highlight EXISTING content
5. If a required skill is missing, add it to warnings ONLY — not to the resume

ALLOWED:
- Reorder bullet points to highlight most relevant experience first
- Rephrase existing achievements to use JD keywords naturally
- Expand vague descriptions using context from the same experience
- Add JD keywords that legitimately describe existing work
- Restructure sections for better ATS readability`,
      user: `Tailor this resume for the job description:

ORIGINAL RESUME:
${resumeText.slice(0, 4000)}

TARGET JD REQUIREMENTS:
Title: ${parsedJD.title}
Required Skills: ${JSON.stringify(parsedJD.requiredSkills)}
Keywords: ${JSON.stringify(parsedJD.keywords)}

SKILLS CANDIDATE ACTUALLY HAS:
${JSON.stringify(skillGap.have?.map(s => s.skill) || [])}

Return this exact JSON:
{
  "text": "Complete improved resume text here (maintain professional format)",
  "changes": [
    "Specific change made and why it helps"
  ],
  "warnings": [
    "Required skill X is missing — not added to resume per honesty policy"
  ]
}`,
      maxTokens: 3000,
      temperature: 0.3,
      userId,
      feature: 'resume-scanner',
      refId,
    });
    result.generatedAt = new Date();
    return result;
  } catch (err) {
    console.error('[tailorResume] error:', err.message);
    return { text: resumeText, changes: [], warnings: ['Tailoring failed — original resume returned'], generatedAt: new Date() };
  }
}

/**
 * generateCoverLetter(parsedResume, parsedJD)
 */
export async function generateCoverLetter(parsedResume, parsedJD, { userId, refId } = {}) {
  try {
    const result = await callAI({
      system: `You are an expert cover letter writer. Write professional, specific, compelling cover letters.
Use only real information from the candidate's profile. Do not fabricate anything.
Keep it to 3-4 paragraphs, under 400 words.`,
      user: `Write a cover letter for:

CANDIDATE:
Name: ${parsedResume.name || 'Candidate'}
Skills: ${JSON.stringify((parsedResume.skills || []).slice(0, 15))}
Experience highlights: ${JSON.stringify((parsedResume.experience || []).slice(0, 3).map(e => ({ title: e.title, company: e.company, duration: e.duration })))}
Projects: ${JSON.stringify((parsedResume.projects || []).slice(0, 2).map(p => p.name))}

TARGET ROLE:
Title: ${parsedJD.title || 'Position'}
Company: ${parsedJD.company || 'Company'}
Key requirements: ${JSON.stringify((parsedJD.requiredSkills || []).slice(0, 8))}
Responsibilities: ${JSON.stringify((parsedJD.responsibilities || []).slice(0, 4))}

Return JSON:
{
  "text": "Full cover letter text here"
}`,
      maxTokens: 1000,
      temperature: 0.5,
      userId,
      feature: 'other',
      refId,
    });
    result.generatedAt = new Date();
    return result;
  } catch (err) {
    console.error('[generateCoverLetter] error:', err.message);
    return { text: '', generatedAt: new Date() };
  }
}

/**
 * generateQuiz(parsedJD, parsedResume) → 30-40 MCQ questions
 * Split: ~40% technical, ~30% HR/behavioral, ~30% role-specific
 */
export async function generateQuiz(parsedJD, parsedResume, { userId, refId } = {}) {
  try {
    const result = await callAI({
      system: `You are an expert interview question creator for job readiness assessments.
Generate diverse, high-quality MCQ questions that test real job readiness.
Questions must have exactly 4 options with one correct answer.
Explanations must be educational and explain WHY the answer is correct.`,
      user: `Generate 35 MCQ questions for a candidate applying to: ${parsedJD.title || 'this role'}

ROLE CONTEXT:
Required Skills: ${JSON.stringify((parsedJD.requiredSkills || []).slice(0, 12))}
Technologies: ${JSON.stringify((parsedJD.technologies || []).slice(0, 10))}
Responsibilities: ${JSON.stringify((parsedJD.responsibilities || []).slice(0, 5))}
Seniority: ${parsedJD.seniority || 'mid-level'}

CANDIDATE BACKGROUND:
Skills: ${JSON.stringify((parsedResume.skills || []).slice(0, 10))}
Experience titles: ${JSON.stringify((parsedResume.experience || []).slice(0, 3).map(e => e.title))}

Question distribution:
- 14 questions: category "technical" (core technical concepts and skills)
- 11 questions: category "hr" (behavioral, situational, HR-style questions)
- 10 questions: category "roleSpecific" (specific to this exact role and its responsibilities)

Return JSON:
{
  "questions": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this is correct and the others are wrong",
      "difficulty": "easy|medium|hard",
      "category": "technical|hr|roleSpecific|advanced",
      "relatedSkill": "e.g. React",
      "relatedJDRequirement": "e.g. requiredSkills.React"
    }
  ]
}`,
      maxTokens: 5000,
      temperature: 0.7,
      userId,
      feature: 'question-generation',
      refId,
    });
    return result.questions || [];
  } catch (err) {
    console.error('[generateQuiz] error:', err.message);
    return [];
  }
}

/**
 * generatePreparationPlan(parsedJD, skillGap, parsedResume) → day-by-day plan
 */
export async function generatePreparationPlan(parsedJD, skillGap, parsedResume, { userId, refId } = {}) {
  try {
    const criticalMissing = (skillGap.missing || []).filter(s => s.importance === 'critical' || s.importance === 'high').slice(0, 5);
    const improvAreas = (skillGap.improve || []).slice(0, 4);

    const result = await callAI({
      system: `You are an expert career coach creating personalized interview preparation plans.
Create a realistic, actionable day-by-day plan based on the candidate's specific gaps.
Each day should have focused tasks and real resources.`,
      user: `Create a 14-day interview preparation plan:

TARGET ROLE: ${parsedJD.title || 'Target Role'}
SENIORITY: ${parsedJD.seniority || 'mid-level'}

CRITICAL SKILL GAPS:
${JSON.stringify(criticalMissing)}

AREAS TO IMPROVE:
${JSON.stringify(improvAreas)}

KEY RESPONSIBILITIES TO PREPARE FOR:
${JSON.stringify((parsedJD.responsibilities || []).slice(0, 5))}

Return JSON:
{
  "days": [
    {
      "day": 1,
      "topic": "Topic name",
      "tasks": ["Specific task 1", "Specific task 2", "Specific task 3"],
      "resources": ["Resource name / URL or description"]
    }
  ],
  "totalDays": 14
}`,
      maxTokens: 3000,
      temperature: 0.4,
      userId,
      feature: 'overall-feedback',
      refId,
    });
    result.generatedAt = new Date();
    return result;
  } catch (err) {
    console.error('[generatePreparationPlan] error:', err.message);
    return { days: [], totalDays: 0, generatedAt: new Date() };
  }
}

/**
 * calculateReadinessScore(jobApp) → composite 0-100 score
 */
export function calculateReadinessScore(jobApp) {
  let score = 0;
  const breakdown = {
    atsMatch: 0,
    skillCoverage: 0,
    quizPerformance: 0,
    resumeTailored: false,
    coverLetterDone: false,
    prepPlanStarted: false,
  };

  // ATS score (40% weight)
  if (jobApp.atsScore != null) {
    breakdown.atsMatch = jobApp.atsScore;
    score += jobApp.atsScore * 0.40;
  }

  // Skill coverage (25% weight) - based on how many have vs missing
  const have = jobApp.skillGap?.have?.length || 0;
  const missing = jobApp.skillGap?.missing?.length || 0;
  const total = have + missing;
  if (total > 0) {
    breakdown.skillCoverage = Math.round((have / total) * 100);
    score += breakdown.skillCoverage * 0.25;
  }

  // Quiz performance (25% weight)
  if (jobApp.quiz?.score != null && jobApp.quiz?.totalQuestions > 0) {
    breakdown.quizPerformance = Math.round((jobApp.quiz.score / jobApp.quiz.totalQuestions) * 100);
    score += breakdown.quizPerformance * 0.25;
  }

  // Completion bonuses (10% weight total)
  if (jobApp.tailoredResume?.text) { breakdown.resumeTailored = true; score += 3.5; }
  if (jobApp.coverLetter?.text) { breakdown.coverLetterDone = true; score += 3.5; }
  if (jobApp.preparationPlan?.days?.length > 0) { breakdown.prepPlanStarted = true; score += 3; }

  return {
    readinessScore: Math.min(100, Math.round(score)),
    readinessBreakdown: breakdown,
  };
}
