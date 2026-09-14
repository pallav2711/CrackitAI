import OpenAI from 'openai';
import { logChatCall } from './aiCostLogger.js';

// Lazy initialization to avoid errors when API key is not set
let openai = null;

const getOpenAIClient = () => {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openai;
};

/**
 * Generate interview questions using AI based on role, type, and difficulty
 */
export const generateInterviewQuestions = async ({
  type,
  role,
  experience,
  difficulty,
  questionCount,
  previousQuestions = [],
  userId,    // optional — for cost logging
  refId,     // optional — interview _id
}) => {
  const MODEL = 'gpt-4o-mini';
  try {
    const client = getOpenAIClient();
    if (!client) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = buildSystemPrompt(type, role, experience, difficulty);
    const userPrompt = buildUserPrompt(type, role, questionCount, previousQuestions);

    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    // Log cost asynchronously
    if (userId) {
      logChatCall({
        userId,
        feature: 'question-generation',
        model: MODEL,
        usage: response.usage,
        refId,
        refModel: 'Interview',
      });
    }

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    
    // Validate and format questions
    const questions = parsed.questions.map(q => ({
      question: q.question,
      expectedKeywords: q.expectedKeywords || [],
      difficulty: q.difficulty || difficulty,
      category: q.category || type
    }));

    return questions;
  } catch (error) {
    console.error('Error generating AI questions:', error);
    throw new Error('Failed to generate interview questions: ' + error.message);
  }
};

/**
 * Evaluate answer using AI with enhanced precision and personalization
 */
export const evaluateAnswerWithAI = async ({
  question,
  answer,
  type,
  role,
  expectedKeywords,
  experience = 'fresher',
  difficulty = 'medium',
  userId,   // optional — for cost logging
  refId,    // optional — interview _id
}) => {
  const MODEL = 'gpt-4o-mini';
  try {
    const client = getOpenAIClient();
    if (!client) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are an expert interview evaluator and career coach specializing in ${type} interviews for ${role} positions at ${experience} level.

Your evaluation must be:
- PRECISE: Analyze every aspect of the answer with surgical precision
- PERSONALIZED: Tailor feedback to the specific role, experience level, and question type
- ACTIONABLE: Provide specific, implementable improvements
- HONEST: Give accurate scores without inflation or deflation
- EDUCATIONAL: Help the candidate understand exactly what makes a great answer

EVALUATION FRAMEWORK:
1. RELEVANCE (25%): How directly does the answer address the question?
2. DEPTH (25%): Level of detail, examples, and comprehensive coverage
3. STRUCTURE (20%): Organization, clarity, logical flow (STAR method for behavioral)
4. TECHNICAL ACCURACY (15%): Correctness of information and terminology
5. COMMUNICATION (15%): Clarity, confidence, professional language

EXPERIENCE-BASED EXPECTATIONS:
- Fresher: Focus on learning, potential, academic projects, internships
- Junior: 1-3 years experience, some real projects, basic problem-solving
- Mid: 3-7 years, leadership examples, complex problem-solving, mentoring
- Senior: 7+ years, strategic thinking, team leadership, business impact`;

    const userPrompt = `Evaluate this ${type} interview answer for a ${experience}-level ${role} position:

QUESTION: ${question}
EXPECTED KEYWORDS: ${expectedKeywords.join(', ')}
DIFFICULTY LEVEL: ${difficulty}
CANDIDATE'S ANSWER: "${answer}"

Provide a comprehensive JSON evaluation:
{
  "score": <0-100 precise score>,
  "scoreBreakdown": {
    "relevance": <0-25>,
    "depth": <0-25>, 
    "structure": <0-20>,
    "technicalAccuracy": <0-15>,
    "communication": <0-15>
  },
  "feedback": "<2-3 sentences of overall assessment>",
  "detailedAnalysis": {
    "whatWorkedWell": "<specific positive aspects>",
    "whatNeedsWork": "<specific areas for improvement>",
    "missedOpportunities": "<what could have been added>"
  },
  "strengths": [
    "<specific strength with example>",
    "<specific strength with example>",
    "<specific strength with example>"
  ],
  "improvements": [
    "<specific improvement with action>",
    "<specific improvement with action>", 
    "<specific improvement with action>"
  ],
  "keywordAnalysis": {
    "covered": ["<keywords found in answer>"],
    "missing": ["<important keywords not mentioned>"],
    "coverageScore": <percentage>
  },
  "exampleQuality": {
    "hasExamples": <boolean>,
    "exampleRelevance": "<assessment of example quality>",
    "quantifiableResults": <boolean>
  },
  "structureAnalysis": {
    "followsSTAR": <boolean for behavioral questions>,
    "logicalFlow": <boolean>,
    "clarity": <1-5 rating>
  },
  "nextLevelTips": [
    "<specific tip to reach next performance level>",
    "<specific tip to reach next performance level>"
  ],
  "sampleImprovedAnswer": "<brief example of how answer could be enhanced>"
}

SCORING GUIDELINES:
- 90-100: Exceptional - Would impress senior interviewers, perfect for role level
- 80-89: Strong - Good answer with minor areas for improvement
- 70-79: Solid - Meets expectations with some enhancement needed
- 60-69: Adequate - Basic requirements met but lacks depth/examples
- 50-59: Weak - Significant gaps, needs major improvement
- 40-49: Poor - Misses key points, insufficient for role
- 0-39: Inadequate - Major deficiencies, does not address question

Be precise, honest, and educational. Focus on helping the candidate improve.`;

    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2, // Low temperature for consistent evaluation
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    // Log cost asynchronously
    if (userId) {
      logChatCall({
        userId,
        feature: 'answer-evaluation',
        model: MODEL,
        usage: response.usage,
        refId,
        refModel: 'Interview',
      });
    }

    const evaluation = JSON.parse(response.choices[0].message.content);
    
    // Ensure all required fields are present
    return {
      score: evaluation.score || 0,
      scoreBreakdown: evaluation.scoreBreakdown || {},
      feedback: evaluation.feedback || 'No feedback available',
      detailedAnalysis: evaluation.detailedAnalysis || {},
      strengths: evaluation.strengths || [],
      improvements: evaluation.improvements || [],
      keywordAnalysis: evaluation.keywordAnalysis || { covered: [], missing: expectedKeywords, coverageScore: 0 },
      exampleQuality: evaluation.exampleQuality || {},
      structureAnalysis: evaluation.structureAnalysis || {},
      nextLevelTips: evaluation.nextLevelTips || [],
      sampleImprovedAnswer: evaluation.sampleImprovedAnswer || '',
      keywordsCovered: evaluation.keywordAnalysis?.covered || [],
      missingKeywords: evaluation.keywordAnalysis?.missing || expectedKeywords
    };
  } catch (error) {
    console.error('Error evaluating answer with AI:', error);
    throw new Error('Failed to evaluate answer: ' + error.message);
  }
};

/**
 * Generate comprehensive, personalized overall interview feedback using AI
 */
export const generateOverallFeedback = async ({
  interview,
  questions,
  averageScore,
  userId,  // optional — for cost logging
  refId,
}) => {
  const MODEL = 'gpt-4o-mini';
  try {
    const client = getOpenAIClient();
    if (!client) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are a senior technical recruiter and career coach with 15+ years of experience evaluating candidates for ${interview.role} positions.

Your feedback must be:
- PERSONALIZED: Tailored to the specific role, experience level, and industry
- COMPREHENSIVE: Cover all aspects of interview performance
- ACTIONABLE: Provide specific, implementable next steps
- MOTIVATIONAL: Encourage growth while being honest about areas needing work
- STRATEGIC: Help candidate understand what employers really look for

EVALUATION CONTEXT:
- Role: ${interview.role}
- Experience Level: ${interview.experience}
- Interview Type: ${interview.type}
- Industry Standards: Consider current market expectations
- Career Stage: Adjust expectations and advice accordingly`;

    const answeredQuestions = questions.filter(q => q.userAnswer);
    const questionScores = answeredQuestions.map(q => q.score);
    const scoreDistribution = {
      excellent: questionScores.filter(s => s >= 90).length,
      good: questionScores.filter(s => s >= 75 && s < 90).length,
      average: questionScores.filter(s => s >= 60 && s < 75).length,
      poor: questionScores.filter(s => s < 60).length
    };

    // Analyze patterns in answers
    const detailedQuestions = answeredQuestions.map(q => ({
      question: q.question,
      answer: q.userAnswer,
      score: q.score,
      strengths: q.strengths || [],
      improvements: q.improvements || [],
      keywordsCovered: q.keywordsCovered || [],
      missingKeywords: q.missingKeywords || []
    }));

    const userPrompt = `Analyze this ${interview.type} interview performance for a ${interview.experience}-level ${interview.role} candidate:

PERFORMANCE METRICS:
- Overall Score: ${averageScore}/100
- Questions Answered: ${answeredQuestions.length}/${questions.length}
- Score Distribution: ${scoreDistribution.excellent} excellent, ${scoreDistribution.good} good, ${scoreDistribution.average} average, ${scoreDistribution.poor} poor

DETAILED QUESTION ANALYSIS:
${JSON.stringify(detailedQuestions, null, 2)}

MARKET CONTEXT:
- Current hiring standards for ${interview.role}
- ${interview.experience} level expectations
- Industry-specific requirements

Generate comprehensive feedback in JSON format:
{
  "overallAssessment": {
    "summary": "<2-3 sentence overall performance summary>",
    "readinessLevel": "<ready-to-interview|needs-practice|requires-significant-work>",
    "marketCompetitiveness": "<how competitive candidate is in current market>"
  },
  "feedback": "<detailed 3-4 paragraph narrative feedback>",
  "performanceAnalysis": {
    "consistencyScore": <1-10 rating>,
    "communicationClarity": <1-10 rating>,
    "technicalDepth": <1-10 rating>,
    "exampleQuality": <1-10 rating>,
    "confidenceLevel": <1-10 rating>
  },
  "strengths": [
    "<specific strength with evidence from answers>",
    "<specific strength with evidence from answers>",
    "<specific strength with evidence from answers>",
    "<specific strength with evidence from answers>"
  ],
  "criticalImprovements": [
    "<high-priority improvement with specific action>",
    "<high-priority improvement with specific action>",
    "<high-priority improvement with specific action>"
  ],
  "roleSpecificAdvice": [
    "<advice specific to ${interview.role} role>",
    "<advice specific to ${interview.role} role>",
    "<advice specific to ${interview.role} role>"
  ],
  "experienceLevelGuidance": {
    "currentLevel": "<assessment of current level>",
    "nextLevelRequirements": "<what's needed to reach next level>",
    "timelineToImprovement": "<realistic timeline for improvement>"
  },
  "interviewStrategy": {
    "preparationFocus": ["<area 1>", "<area 2>", "<area 3>"],
    "practiceRecommendations": ["<specific practice 1>", "<specific practice 2>"],
    "resourceSuggestions": ["<resource 1>", "<resource 2>"]
  },
  "nextSteps": {
    "immediate": ["<action within 1 week>", "<action within 1 week>"],
    "shortTerm": ["<action within 1 month>", "<action within 1 month>"],
    "longTerm": ["<action within 3 months>", "<action within 3 months>"]
  },
  "benchmarkComparison": {
    "percentileRanking": "<estimated percentile vs other candidates>",
    "competitiveAdvantages": ["<advantage 1>", "<advantage 2>"],
    "competitiveWeaknesses": ["<weakness 1>", "<weakness 2>"]
  },
  "motivationalMessage": "<encouraging, realistic message about growth potential>",
  "performanceLevel": "<excellent|good|average|needs-improvement>",
  "recommendedNextInterview": "<when to schedule next practice interview>"
}

Be honest, specific, and helpful. Focus on actionable insights that will genuinely help the candidate improve.`;

    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 3000,
      response_format: { type: 'json_object' }
    });

    // Log cost asynchronously
    if (userId) {
      logChatCall({
        userId,
        feature: 'overall-feedback',
        model: MODEL,
        usage: response.usage,
        refId,
        refModel: 'Interview',
      });
    }

    const feedback = JSON.parse(response.choices[0].message.content);
    
    // Ensure backward compatibility with existing fields
    return {
      feedback: feedback.feedback || feedback.overallAssessment?.summary || 'No feedback available',
      strengths: feedback.strengths || [],
      improvements: feedback.criticalImprovements || [],
      recommendations: feedback.roleSpecificAdvice || [],
      performanceLevel: feedback.performanceLevel || 'needs-improvement',
      nextSteps: feedback.nextSteps?.immediate || [],
      
      // Enhanced fields
      overallAssessment: feedback.overallAssessment || {},
      performanceAnalysis: feedback.performanceAnalysis || {},
      criticalImprovements: feedback.criticalImprovements || [],
      roleSpecificAdvice: feedback.roleSpecificAdvice || [],
      experienceLevelGuidance: feedback.experienceLevelGuidance || {},
      interviewStrategy: feedback.interviewStrategy || {},
      benchmarkComparison: feedback.benchmarkComparison || {},
      motivationalMessage: feedback.motivationalMessage || '',
      recommendedNextInterview: feedback.recommendedNextInterview || ''
    };
  } catch (error) {
    console.error('Error generating overall feedback:', error);
    throw new Error('Failed to generate feedback: ' + error.message);
  }
};

// Helper function to build system prompt
function buildSystemPrompt(type, role, experience, difficulty) {
  return `You are an expert interview question generator for ${type} interviews.
You specialize in creating questions for ${role} positions at ${experience} level with ${difficulty} difficulty.

Generate realistic, relevant interview questions that:
1. Match the specified difficulty level
2. Are appropriate for the experience level
3. Test relevant skills and knowledge
4. Are clear and unambiguous
5. Can be answered in 1-3 minutes
6. Include expected keywords for evaluation

For each question, provide:
- The question text (clear and professional)
- Expected keywords (5-8 key concepts/terms)
- Difficulty level
- Category/topic

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "question": "Question text here?",
      "expectedKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
      "difficulty": "medium",
      "category": "technical"
    }
  ]
}`;
}

// Helper function to build user prompt
function buildUserPrompt(type, role, questionCount, previousQuestions) {
  let prompt = `Generate ${questionCount} unique ${type} interview questions for a ${role} position.`;
  
  if (previousQuestions.length > 0) {
    prompt += `\n\nAvoid these recently asked questions:\n${previousQuestions.map(q => `- ${q}`).join('\n')}`;
  }

  prompt += `\n\nEnsure questions are:
- Diverse and cover different aspects
- Practical and realistic
- Appropriate for the role
- Not repetitive

Return the response as valid JSON only.`;

  return prompt;
}

// Fallback questions in case AI fails
export const getFallbackQuestions = (type, role, count) => {
  const fallbackBank = {
    hr: [
      {
        question: "Tell me about yourself and your professional background.",
        expectedKeywords: ["experience", "skills", "education", "career", "achievements"],
        difficulty: "easy",
        category: "hr"
      },
      {
        question: "Why are you interested in this position?",
        expectedKeywords: ["motivation", "interest", "company", "role", "growth"],
        difficulty: "easy",
        category: "hr"
      },
      {
        question: "What are your greatest strengths and how do they apply to this role?",
        expectedKeywords: ["strengths", "skills", "examples", "relevant", "value"],
        difficulty: "medium",
        category: "hr"
      },
      {
        question: "Describe a challenging situation you faced and how you overcame it.",
        expectedKeywords: ["challenge", "problem-solving", "action", "result", "learning"],
        difficulty: "medium",
        category: "hr"
      },
      {
        question: "Where do you see yourself in 5 years?",
        expectedKeywords: ["goals", "career", "growth", "development", "ambition"],
        difficulty: "easy",
        category: "hr"
      }
    ],
    technical: [
      {
        question: `Explain the key technologies and tools you've used in your ${role} work.`,
        expectedKeywords: ["technologies", "tools", "experience", "projects", "implementation"],
        difficulty: "medium",
        category: "technical"
      },
      {
        question: "What is your approach to debugging and troubleshooting technical issues?",
        expectedKeywords: ["debugging", "methodology", "tools", "systematic", "problem-solving"],
        difficulty: "medium",
        category: "technical"
      },
      {
        question: "Describe a complex technical problem you solved recently.",
        expectedKeywords: ["problem", "solution", "approach", "implementation", "outcome"],
        difficulty: "hard",
        category: "technical"
      },
      {
        question: "How do you stay updated with the latest technologies and best practices?",
        expectedKeywords: ["learning", "resources", "community", "practice", "continuous"],
        difficulty: "easy",
        category: "technical"
      },
      {
        question: "Explain the difference between various architectural patterns you've worked with.",
        expectedKeywords: ["architecture", "patterns", "design", "scalability", "trade-offs"],
        difficulty: "hard",
        category: "technical"
      }
    ],
    behavioral: [
      {
        question: "Tell me about a time you worked effectively in a team.",
        expectedKeywords: ["teamwork", "collaboration", "communication", "contribution", "outcome"],
        difficulty: "medium",
        category: "behavioral"
      },
      {
        question: "Describe a situation where you had to meet a tight deadline.",
        expectedKeywords: ["deadline", "pressure", "prioritization", "time-management", "delivery"],
        difficulty: "medium",
        category: "behavioral"
      },
      {
        question: "Give an example of when you showed leadership.",
        expectedKeywords: ["leadership", "initiative", "influence", "responsibility", "results"],
        difficulty: "medium",
        category: "behavioral"
      },
      {
        question: "Tell me about a time you received critical feedback and how you handled it.",
        expectedKeywords: ["feedback", "improvement", "growth", "action", "learning"],
        difficulty: "medium",
        category: "behavioral"
      },
      {
        question: "Describe a situation where you had to adapt to significant change.",
        expectedKeywords: ["change", "adaptation", "flexibility", "resilience", "outcome"],
        difficulty: "medium",
        category: "behavioral"
      }
    ]
  };

  const questions = fallbackBank[type] || fallbackBank.hr;
  return questions.slice(0, Math.min(count, questions.length));
};
