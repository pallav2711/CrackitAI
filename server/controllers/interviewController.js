import Interview from '../models/Interview.js';
import { 
  generateInterviewQuestions, 
  evaluateAnswerWithAI, 
  generateOverallFeedback,
  getFallbackQuestions 
} from '../services/aiQuestionService.js';
import EnhancedAIAnalysis from '../services/enhancedAIAnalysis.js';
import { logChatCall } from '../services/aiCostLogger.js';

// Expanded question bank with randomization (kept as fallback)
const getDefaultQuestions = (type, role, count) => {
  const questionBank = {
    hr: [
      {
        question: "Tell me about yourself and your background.",
        expectedKeywords: ["experience", "skills", "education", "achievements"]
      },
      {
        question: "Why do you want to work for our company?",
        expectedKeywords: ["research", "values", "culture", "growth"]
      },
      {
        question: "What are your greatest strengths and weaknesses?",
        expectedKeywords: ["self-aware", "improvement", "examples"]
      },
      {
        question: "Describe a challenging situation and how you handled it.",
        expectedKeywords: ["problem-solving", "leadership", "outcome"]
      },
      {
        question: "Where do you see yourself in 5 years?",
        expectedKeywords: ["goals", "growth", "commitment"]
      },
      {
        question: "Why should we hire you over other candidates?",
        expectedKeywords: ["unique", "value", "skills", "contribution"]
      },
      {
        question: "Tell me about a time you failed and what you learned.",
        expectedKeywords: ["accountability", "learning", "growth", "improvement"]
      },
      {
        question: "How do you handle stress and pressure?",
        expectedKeywords: ["coping", "prioritization", "time-management", "balance"]
      },
      {
        question: "What motivates you in your work?",
        expectedKeywords: ["passion", "goals", "achievement", "purpose"]
      },
      {
        question: "Describe your ideal work environment.",
        expectedKeywords: ["culture", "collaboration", "flexibility", "growth"]
      },
      {
        question: "How do you handle criticism or feedback?",
        expectedKeywords: ["open-minded", "learning", "improvement", "professional"]
      },
      {
        question: "What are your salary expectations?",
        expectedKeywords: ["research", "market", "value", "negotiable"]
      },
      {
        question: "Tell me about a time you showed leadership.",
        expectedKeywords: ["initiative", "influence", "responsibility", "results"]
      },
      {
        question: "How do you prioritize your work?",
        expectedKeywords: ["organization", "deadlines", "importance", "efficiency"]
      },
      {
        question: "What makes you unique as a candidate?",
        expectedKeywords: ["skills", "experience", "perspective", "value"]
      }
    ],
    technical: [
      {
        question: "Explain the difference between var, let, and const in JavaScript.",
        expectedKeywords: ["scope", "hoisting", "reassignment", "block-level"]
      },
      {
        question: "What is the difference between SQL and NoSQL databases?",
        expectedKeywords: ["structure", "scalability", "ACID", "use-cases"]
      },
      {
        question: "Explain the concept of RESTful APIs.",
        expectedKeywords: ["HTTP", "stateless", "resources", "methods"]
      },
      {
        question: "What is the time complexity of binary search?",
        expectedKeywords: ["O(log n)", "divide", "sorted"]
      },
      {
        question: "Explain the difference between authentication and authorization.",
        expectedKeywords: ["identity", "permissions", "security", "access"]
      },
      {
        question: "What is the difference between == and === in JavaScript?",
        expectedKeywords: ["type", "coercion", "strict", "equality"]
      },
      {
        question: "Explain what is a closure in JavaScript.",
        expectedKeywords: ["scope", "function", "lexical", "encapsulation"]
      },
      {
        question: "What are the principles of Object-Oriented Programming?",
        expectedKeywords: ["encapsulation", "inheritance", "polymorphism", "abstraction"]
      },
      {
        question: "Explain the concept of promises in JavaScript.",
        expectedKeywords: ["asynchronous", "resolve", "reject", "then"]
      },
      {
        question: "What is the difference between GET and POST requests?",
        expectedKeywords: ["HTTP", "idempotent", "data", "parameters"]
      },
      {
        question: "Explain what is a hash table and its time complexity.",
        expectedKeywords: ["key-value", "O(1)", "collision", "hashing"]
      },
      {
        question: "What is the difference between stack and heap memory?",
        expectedKeywords: ["static", "dynamic", "allocation", "scope"]
      },
      {
        question: "Explain the concept of middleware in web applications.",
        expectedKeywords: ["request", "response", "processing", "chain"]
      },
      {
        question: "What is the difference between synchronous and asynchronous programming?",
        expectedKeywords: ["blocking", "non-blocking", "callback", "concurrent"]
      },
      {
        question: "Explain what is dependency injection.",
        expectedKeywords: ["decoupling", "testing", "inversion", "control"]
      }
    ],
    behavioral: [
      {
        question: "Tell me about a time you worked on a team project.",
        expectedKeywords: ["collaboration", "communication", "role", "outcome"]
      },
      {
        question: "Describe a situation where you had to meet a tight deadline.",
        expectedKeywords: ["prioritization", "time-management", "stress"]
      },
      {
        question: "How do you handle conflicts with team members?",
        expectedKeywords: ["communication", "empathy", "resolution"]
      },
      {
        question: "Give an example of when you showed leadership.",
        expectedKeywords: ["initiative", "influence", "responsibility"]
      },
      {
        question: "Describe a failure and what you learned from it.",
        expectedKeywords: ["accountability", "learning", "growth"]
      },
      {
        question: "Tell me about a time you had to adapt to a major change.",
        expectedKeywords: ["flexibility", "adaptation", "resilience", "outcome"]
      },
      {
        question: "Describe a situation where you went above and beyond.",
        expectedKeywords: ["initiative", "dedication", "extra", "impact"]
      },
      {
        question: "Tell me about a time you had to make a difficult decision.",
        expectedKeywords: ["analysis", "judgment", "consequences", "responsibility"]
      },
      {
        question: "Describe a time you had to work with a difficult person.",
        expectedKeywords: ["patience", "communication", "professionalism", "resolution"]
      },
      {
        question: "Give an example of when you improved a process or system.",
        expectedKeywords: ["innovation", "efficiency", "improvement", "results"]
      },
      {
        question: "Tell me about a time you had to learn something new quickly.",
        expectedKeywords: ["learning", "adaptation", "resourcefulness", "application"]
      },
      {
        question: "Describe a situation where you had to persuade others.",
        expectedKeywords: ["influence", "communication", "reasoning", "outcome"]
      },
      {
        question: "Tell me about a time you received constructive criticism.",
        expectedKeywords: ["feedback", "improvement", "growth", "action"]
      },
      {
        question: "Describe a project where you had to manage multiple priorities.",
        expectedKeywords: ["organization", "prioritization", "balance", "delivery"]
      },
      {
        question: "Give an example of when you took initiative without being asked.",
        expectedKeywords: ["proactive", "ownership", "responsibility", "impact"]
      }
    ]
  };

  const questions = questionBank[type] || questionBank.hr;
  
  // Randomize questions using Fisher-Yates shuffle for better randomness
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled.slice(0, Math.min(count, questions.length));
};

// Get AI-generated questions avoiding recently used ones
const getSmartQuestions = async (type, role, experience, difficulty, count, userId) => {
  try {
    console.log(`Generating ${count} AI questions for ${type} interview (${role}, ${experience}, ${difficulty})`);
    
    // Get user's recent interviews to avoid repeating questions
    const recentInterviews = await Interview.find({
      userId,
      type,
      status: 'completed',
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('questions.question');

    // Extract recently asked questions
    const previousQuestions = [];
    recentInterviews.forEach(interview => {
      interview.questions.forEach(q => {
        if (q.question) {
          previousQuestions.push(q.question);
        }
      });
    });

    console.log(`Found ${previousQuestions.length} previous questions to avoid`);

    // Try to generate questions with AI
    try {
      const aiQuestions = await generateInterviewQuestions({
        type,
        role,
        experience: experience || 'fresher',
        difficulty: difficulty || 'medium',
        questionCount: count,
        previousQuestions: previousQuestions.slice(0, 20), // Limit to avoid token overflow
        userId, // for cost logging
      });

      console.log(`Successfully generated ${aiQuestions.length} AI questions`);
      return aiQuestions;
    } catch (aiError) {
      console.error('AI generation failed, using fallback:', aiError.message);
      
      // Fallback to predefined questions
      const fallbackQuestions = getFallbackQuestions(type, role, count);
      
      // Filter out recently used ones
      const availableQuestions = fallbackQuestions.filter(
        q => !previousQuestions.includes(q.question)
      );
      
      const questionsToUse = availableQuestions.length >= count 
        ? availableQuestions 
        : fallbackQuestions;
      
      // Shuffle
      const shuffled = [...questionsToUse];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      return shuffled.slice(0, count);
    }
  } catch (error) {
    console.error('Error in getSmartQuestions:', error);
    // Ultimate fallback
    return getFallbackQuestions(type, role, count);
  }
};

// Evaluate answer with AI (with fallback to robust basic evaluation)
const evaluateAnswer = async (question, answer, expectedKeywords, type, role, useAI = true, experience = 'fresher', difficulty = 'medium', userId = null, interviewId = null) => {
  // STRICT CHECK: Empty or whitespace-only answer = 0%
  if (!answer || answer.trim().length === 0) {
    return {
      score: 0,
      feedback: "❌ No answer provided. You must speak and provide a response to receive any score.",
      strengths: [],
      improvements: [
        "Provide a verbal or written answer to the question",
        "Address the question directly with relevant information",
        "Use the STAR method (Situation, Task, Action, Result) for behavioral questions"
      ],
      keywordsCovered: [],
      missingKeywords: expectedKeywords
    };
  }

  // Check for very short/meaningless answers (less than 10 words)
  const wordCount = answer.trim().split(/\s+/).filter(word => word.length > 0).length;
  if (wordCount < 10) {
    return {
      score: 5,
      feedback: "❌ Your answer is too brief and lacks substance. A proper interview answer should be at least 30-50 words with specific details and examples.",
      strengths: ["You attempted to answer"],
      improvements: [
        "Provide much more detail and explanation",
        "Include specific examples from your experience",
        "Aim for 50-100 words minimum for a complete answer",
        `Cover key concepts: ${expectedKeywords.slice(0, 3).join(', ')}`
      ],
      keywordsCovered: [],
      missingKeywords: expectedKeywords
    };
  }

  // Try AI evaluation first if enabled
  if (useAI && process.env.OPENAI_API_KEY) {
    try {
      console.log('Evaluating answer with AI...');
      const aiEvaluation = await evaluateAnswerWithAI({
        question,
        answer,
        type,
        role,
        expectedKeywords,
        experience,
        difficulty,
        userId,
        refId: interviewId,
      });
      
      // Validate AI score - ensure it's reasonable
      if (aiEvaluation.score !== undefined && aiEvaluation.score >= 0 && aiEvaluation.score <= 100) {
        console.log('AI evaluation successful');
        return aiEvaluation;
      }
    } catch (aiError) {
      console.error('AI evaluation failed, using robust basic evaluation:', aiError.message);
      // Fall through to basic evaluation
    }
  }

  // ROBUST BASIC EVALUATION FALLBACK
  const answerLower = answer.toLowerCase();
  const answerWords = answer.trim().split(/\s+/);
  
  // 1. KEYWORD ANALYSIS (40% of score)
  const keywordsFound = expectedKeywords.filter(keyword => 
    answerLower.includes(keyword.toLowerCase())
  );
  const keywordCoverage = keywordsFound.length / Math.max(expectedKeywords.length, 1);
  const keywordScore = keywordCoverage * 100;
  
  // 2. LENGTH & DEPTH ANALYSIS (30% of score)
  let lengthScore = 0;
  if (wordCount < 20) {
    lengthScore = 20; // Very brief
  } else if (wordCount < 40) {
    lengthScore = 50; // Short but acceptable
  } else if (wordCount < 80) {
    lengthScore = 75; // Good length
  } else if (wordCount < 150) {
    lengthScore = 90; // Detailed
  } else {
    lengthScore = 85; // Very detailed (might be too long)
  }
  
  // 3. QUALITY INDICATORS (30% of score)
  let qualityScore = 0;
  const qualityIndicators = {
    hasExamples: /example|instance|case|situation|time when|experience/i.test(answer),
    hasNumbers: /\d+|percent|%|increase|decrease|improve/i.test(answer),
    hasStructure: /first|second|third|finally|additionally|moreover|however/i.test(answer),
    hasAction: /implemented|developed|created|managed|led|achieved|improved/i.test(answer),
    hasResult: /result|outcome|success|achieved|accomplished|delivered/i.test(answer),
    hasRelevance: expectedKeywords.some(kw => answerLower.includes(kw.toLowerCase()))
  };
  
  const qualityCount = Object.values(qualityIndicators).filter(Boolean).length;
  qualityScore = (qualityCount / 6) * 100;
  
  // 4. CALCULATE WEIGHTED FINAL SCORE
  const finalScore = Math.round(
    (keywordScore * 0.40) + 
    (lengthScore * 0.30) + 
    (qualityScore * 0.30)
  );
  
  // 5. GENERATE DETAILED FEEDBACK
  const strengths = [];
  const improvements = [];
  const missingKeywords = expectedKeywords.filter(k => !keywordsFound.includes(k));
  
  // Identify strengths
  if (keywordsFound.length >= expectedKeywords.length * 0.7) {
    strengths.push(`✅ Excellent keyword coverage: ${keywordsFound.slice(0, 3).join(', ')}`);
  } else if (keywordsFound.length > 0) {
    strengths.push(`Good mention of: ${keywordsFound.slice(0, 2).join(', ')}`);
  }
  
  if (wordCount >= 60) {
    strengths.push("✅ Comprehensive and detailed response");
  } else if (wordCount >= 40) {
    strengths.push("Good level of detail");
  }
  
  if (qualityIndicators.hasExamples) {
    strengths.push("✅ Included specific examples");
  }
  if (qualityIndicators.hasNumbers) {
    strengths.push("✅ Used quantifiable metrics");
  }
  if (qualityIndicators.hasStructure) {
    strengths.push("✅ Well-structured answer");
  }
  if (qualityIndicators.hasAction && qualityIndicators.hasResult) {
    strengths.push("✅ Demonstrated action and results");
  }
  
  // Identify improvements
  if (missingKeywords.length > 0) {
    improvements.push(`❌ Missing key concepts: ${missingKeywords.slice(0, 3).join(', ')}`);
  }
  
  if (wordCount < 40) {
    improvements.push("❌ Answer is too brief - aim for 60-100 words");
  }
  
  if (!qualityIndicators.hasExamples) {
    improvements.push("❌ Add specific examples from your experience");
  }
  
  if (!qualityIndicators.hasNumbers) {
    improvements.push("Include quantifiable results (numbers, percentages, metrics)");
  }
  
  if (!qualityIndicators.hasStructure) {
    improvements.push("Structure your answer with clear points (First, Second, Finally)");
  }
  
  if (!qualityIndicators.hasAction) {
    improvements.push("Describe specific actions you took");
  }
  
  if (!qualityIndicators.hasResult) {
    improvements.push("Explain the outcomes and results achieved");
  }
  
  if (keywordCoverage < 0.3) {
    improvements.push("❌ Answer lacks relevance to the question - focus on the key topics");
  }
  
  // 6. GENERATE CONTEXTUAL FEEDBACK
  let feedback = "";
  
  if (finalScore >= 90) {
    feedback = "🌟 Outstanding answer! You demonstrated excellent understanding with specific examples, relevant keywords, and clear structure. This is exactly what interviewers want to hear.";
  } else if (finalScore >= 75) {
    feedback = "✅ Strong answer! You covered the main points well and showed good understanding. With minor improvements, this could be exceptional.";
  } else if (finalScore >= 60) {
    feedback = "👍 Good answer. You addressed the question and included relevant information. Adding more specific examples and covering additional key concepts would strengthen your response.";
  } else if (finalScore >= 40) {
    feedback = "⚠️ Acceptable answer, but needs improvement. You touched on some relevant points, but the answer lacks depth, specific examples, and misses several key concepts. Focus on being more comprehensive.";
  } else if (finalScore >= 20) {
    feedback = "❌ Weak answer. Your response is too brief and misses most key concepts. You need to provide much more detail, include specific examples, and directly address the question with relevant information.";
  } else {
    feedback = "❌ Insufficient answer. This response does not adequately address the question. You must provide a complete answer with relevant details, examples, and cover the key concepts expected for this question.";
  }
  
  // Add specific guidance based on score
  if (finalScore < 60) {
    feedback += `\n\n💡 Tip: Use the STAR method - describe the Situation, Task, Action you took, and Result achieved. Aim for 60-100 words with specific examples.`;
  }
  
  return {
    score: finalScore, // NO ARTIFICIAL MINIMUM - Real score only!
    feedback,
    strengths: strengths.slice(0, 4),
    improvements: improvements.slice(0, 4),
    keywordsCovered: keywordsFound,
    missingKeywords: missingKeywords.slice(0, 5)
  };
};

// Generate comprehensive feedback with AI (with fallback)
const generateComprehensiveFeedback = async (interview, questions, averageScore, useAI = true) => {
  // Try AI feedback first if enabled
  if (useAI && process.env.OPENAI_API_KEY) {
    try {
      console.log('Generating overall feedback with AI...');
      const aiFeedback = await generateOverallFeedback({
        interview,
        questions,
        averageScore,
        userId: req.user.id,
        refId: interview._id,
      });
      console.log('AI feedback generated successfully');
      return aiFeedback;
    } catch (aiError) {
      console.error('AI feedback generation failed, using basic feedback:', aiError.message);
      // Fall through to basic feedback
    }
  }

  // Basic feedback fallback
  let feedback = "";
  const strengths = [];
  const improvements = [];
  const recommendations = [];

  if (averageScore >= 90) {
    feedback = `Outstanding performance in your ${interview.type} interview for ${interview.role}! You demonstrated excellent knowledge and communication skills.`;
    strengths.push("Exceptional understanding of core concepts");
    strengths.push("Clear and articulate communication");
    strengths.push("Comprehensive and detailed answers");
  } else if (averageScore >= 75) {
    feedback = `Great job on your ${interview.type} interview for ${interview.role}! You showed strong knowledge and good communication skills.`;
    strengths.push("Strong grasp of fundamental concepts");
    strengths.push("Good communication skills");
    strengths.push("Relevant and focused answers");
  } else if (averageScore >= 60) {
    feedback = `Good effort in your ${interview.type} interview for ${interview.role}. You demonstrated basic understanding of the concepts.`;
    strengths.push("Basic understanding of concepts");
    strengths.push("Attempted all questions");
    strengths.push("Relevant responses");
  } else {
    feedback = `Thank you for completing the ${interview.type} interview for ${interview.role}. Focus on understanding core concepts better.`;
    strengths.push("Willingness to attempt all questions");
    strengths.push("Some relevant points mentioned");
    strengths.push("Room for significant improvement");
  }

  if (averageScore < 80) {
    improvements.push("Provide more specific examples from your experience");
    improvements.push("Structure answers using frameworks like STAR method");
    improvements.push("Include more technical details and terminology");
  } else {
    improvements.push("Continue refining your communication style");
    improvements.push("Practice handling unexpected questions");
    improvements.push("Work on time management during responses");
  }

  recommendations.push("Practice with more mock interviews regularly");
  recommendations.push(`Research common ${interview.type} interview questions for ${interview.role}`);
  recommendations.push("Record yourself answering questions to improve delivery");

  return {
    feedback,
    strengths,
    improvements,
    recommendations,
    performanceLevel: averageScore >= 90 ? 'excellent' : averageScore >= 75 ? 'good' : averageScore >= 60 ? 'average' : 'needs-improvement'
  };
};

// Create new interview with AI-generated questions
export const createInterview = async (req, res) => {
  try {
    console.log('Creating interview with data:', req.body);
    const { type, role, experience, difficulty, questionCount, mode } = req.body;

    // Generate questions using AI (with smart selection to avoid recent questions)
    const questions = await getSmartQuestions(
      type, 
      role, 
      experience || 'fresher',
      difficulty || 'medium',
      questionCount || 5, 
      req.user.id
    );
    console.log(`Generated ${questions.length} unique AI questions`);

    const interview = new Interview({
      userId: req.user.id,
      type,
      role,
      experience: experience || 'fresher',
      difficulty: difficulty || 'medium',
      questionCount: questionCount || 5,
      mode: mode || 'text',
      questions,
      status: 'scheduled',
      aiModel: 'gpt-3.5-turbo' // Track that AI was used
    });

    await interview.save();
    console.log('Interview created with AI questions:', interview._id);
    res.status(201).json(interview);
  } catch (error) {
    console.error('Error creating interview:', error);
    res.status(500).json({ error: error.message });
  }
};

// Start interview
export const startInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // If already in progress, just return it
    if (interview.status === 'in-progress') {
      console.log('Interview already in progress, returning existing');
      return res.json(interview);
    }

    if (interview.status === 'completed') {
      return res.status(400).json({ error: 'Interview already completed' });
    }

    if (interview.status === 'scheduled') {
      interview.status = 'in-progress';
      interview.startTime = new Date();
      await interview.save();
      console.log('Interview started:', interview._id);
    }

    res.json(interview);
  } catch (error) {
    console.error('Error starting interview:', error);
    res.status(500).json({ error: error.message });
  }
};

// Submit answer with AI evaluation
export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, duration } = req.body;

    const interview = await Interview.findOne({
      _id: interviewId,
      userId: req.user.id,
      status: 'in-progress'
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found or not in progress' });
    }

    if (questionIndex >= interview.questions.length) {
      return res.status(400).json({ error: 'Invalid question index' });
    }

    // Evaluate answer with enhanced AI
    const question = interview.questions[questionIndex];
    const evaluation = await evaluateAnswer(
      question.question,
      answer,
      question.expectedKeywords,
      interview.type,
      interview.role,
      true, // Use AI evaluation
      interview.experience,
      interview.difficulty,
      req.user.id,
      interview._id
    );

    // Update question response with enhanced evaluation data
    const questionResponse = interview.questions[questionIndex];
    questionResponse.userAnswer = answer;
    questionResponse.duration = duration;
    questionResponse.score = evaluation.score;
    questionResponse.feedback = evaluation.feedback;
    questionResponse.strengths = evaluation.strengths;
    questionResponse.improvements = evaluation.improvements;
    
    // Enhanced evaluation fields
    if (evaluation.scoreBreakdown) {
      questionResponse.scoreBreakdown = evaluation.scoreBreakdown;
    }
    if (evaluation.detailedAnalysis) {
      questionResponse.detailedAnalysis = evaluation.detailedAnalysis;
    }
    if (evaluation.keywordAnalysis) {
      questionResponse.keywordAnalysis = evaluation.keywordAnalysis;
    }
    if (evaluation.exampleQuality) {
      questionResponse.exampleQuality = evaluation.exampleQuality;
    }
    if (evaluation.structureAnalysis) {
      questionResponse.structureAnalysis = evaluation.structureAnalysis;
    }
    if (evaluation.nextLevelTips) {
      questionResponse.nextLevelTips = evaluation.nextLevelTips;
    }
    if (evaluation.sampleImprovedAnswer) {
      questionResponse.sampleImprovedAnswer = evaluation.sampleImprovedAnswer;
    }

    // Enhanced speech and communication analysis
    if (interview.mode !== 'text') {
      try {
        const speechAnalysis = await EnhancedAIAnalysis.analyzeSpeechPatterns(
          answer, 
          duration, 
          interview.mode
        );
        
        questionResponse.speechAnalysis = speechAnalysis.speechAnalysis;
        questionResponse.communicationStrengths = speechAnalysis.communicationStrengths;
        questionResponse.communicationImprovements = speechAnalysis.communicationImprovements;
        questionResponse.speechTips = speechAnalysis.speechTips;
        questionResponse.practiceExercises = speechAnalysis.practiceExercises;
      } catch (speechError) {
        console.error('Speech analysis failed:', speechError);
      }
    }

    // Enhanced video presence analysis for video interviews
    if (interview.mode === 'video') {
      try {
        const videoAnalysis = await EnhancedAIAnalysis.analyzeVideoPresence(
          { questionIndex, duration },
          duration
        );
        
        questionResponse.videoPresenceAnalysis = videoAnalysis.videoPresenceAnalysis;
        questionResponse.presenceStrengths = videoAnalysis.presenceStrengths;
        questionResponse.presenceImprovements = videoAnalysis.presenceImprovements;
        questionResponse.videoTips = videoAnalysis.videoTips;
        questionResponse.setupRecommendations = videoAnalysis.setupRecommendations;
      } catch (videoError) {
        console.error('Video analysis failed:', videoError);
      }
    }

    await interview.save();

    res.json({
      success: true,
      evaluation
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ error: error.message });
  }
};

// Complete interview with AI feedback
export const completeInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    interview.status = 'completed';
    interview.endTime = new Date();
    interview.actualDuration = Math.floor((interview.endTime - interview.startTime) / 1000);

    // Calculate scores and metrics
    interview.calculateScore();
    interview.calculateMetrics();

    // Generate comprehensive feedback with enhanced AI
    const overallFeedback = await generateComprehensiveFeedback(
      interview, 
      interview.questions, 
      interview.overallScore,
      true // Use AI
    );
    
    // Save basic feedback (backward compatibility)
    interview.overallFeedback = overallFeedback.feedback;
    interview.strengths = overallFeedback.strengths;
    interview.areasForImprovement = overallFeedback.improvements;
    interview.recommendations = overallFeedback.recommendations;
    
    // Save enhanced feedback
    if (overallFeedback.overallAssessment) {
      interview.overallAssessment = overallFeedback.overallAssessment;
    }
    if (overallFeedback.performanceAnalysis) {
      interview.performanceAnalysis = overallFeedback.performanceAnalysis;
    }
    if (overallFeedback.criticalImprovements) {
      interview.criticalImprovements = overallFeedback.criticalImprovements;
    }
    if (overallFeedback.roleSpecificAdvice) {
      interview.roleSpecificAdvice = overallFeedback.roleSpecificAdvice;
    }
    if (overallFeedback.experienceLevelGuidance) {
      interview.experienceLevelGuidance = overallFeedback.experienceLevelGuidance;
    }
    if (overallFeedback.interviewStrategy) {
      interview.interviewStrategy = overallFeedback.interviewStrategy;
    }
    if (overallFeedback.nextSteps) {
      interview.nextSteps = overallFeedback.nextSteps;
    }
    if (overallFeedback.benchmarkComparison) {
      interview.benchmarkComparison = overallFeedback.benchmarkComparison;
    }
    if (overallFeedback.motivationalMessage) {
      interview.motivationalMessage = overallFeedback.motivationalMessage;
    }
    if (overallFeedback.recommendedNextInterview) {
      interview.recommendedNextInterview = overallFeedback.recommendedNextInterview;
    }

    // Generate comprehensive enhanced analysis
    try {
      console.log('Generating comprehensive AI analysis...');
      const comprehensiveAnalysis = await EnhancedAIAnalysis.generateComprehensiveReport(interview);
      interview.comprehensiveAnalysis = comprehensiveAnalysis;
      console.log('Comprehensive analysis completed successfully');
    } catch (analysisError) {
      console.error('Comprehensive analysis failed:', analysisError);
      // Continue without comprehensive analysis - basic feedback is still available
    }

    await interview.save();
    
    // Update user stats
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.user.id);
    if (user) {
      user.stats.interviewsTaken = (user.stats.interviewsTaken || 0) + 1;
      
      // Update readiness score
      const Interview = (await import('../models/Interview.js')).default;
      const allInterviews = await Interview.find({ 
        userId: req.user.id, 
        status: 'completed' 
      });
      const avgInterviewScore = allInterviews.reduce((sum, i) => sum + i.overallScore, 0) / allInterviews.length;
      
      const resumeScore = user.stats.resumeScore || 0;
      const testsCompleted = user.stats.testsCompleted || 0;
      user.stats.readinessScore = Math.round((resumeScore * 0.3 + (testsCompleted > 0 ? 70 : 0) * 0.4 + avgInterviewScore * 0.3));
      
      await user.save();
    }

    res.json(interview);
  } catch (error) {
    console.error('Error completing interview:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get interview details
export const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    res.json(interview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's interview history
export const getInterviewHistory = async (req, res) => {
  try {
    const interviews = await Interview.find({
      userId: req.user.id,
      status: 'completed'
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('-questions.userAnswer -questions.feedback');

    res.json(interviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get interview statistics
export const getInterviewStats = async (req, res) => {
  try {
    const interviews = await Interview.find({
      userId: req.user.id,
      status: 'completed'
    });

    const stats = {
      totalInterviews: interviews.length,
      averageScore: 0,
      highestScore: 0,
      byType: {},
      recentImprovement: 0
    };

    if (interviews.length > 0) {
      const scores = interviews.map(i => i.overallScore);
      stats.averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      stats.highestScore = Math.max(...scores);

      // Group by type
      interviews.forEach(interview => {
        if (!stats.byType[interview.type]) {
          stats.byType[interview.type] = {
            count: 0,
            averageScore: 0,
            scores: []
          };
        }
        stats.byType[interview.type].count++;
        stats.byType[interview.type].scores.push(interview.overallScore);
      });

      // Calculate type averages
      Object.keys(stats.byType).forEach(type => {
        const typeData = stats.byType[type];
        typeData.averageScore = Math.round(
          typeData.scores.reduce((a, b) => a + b, 0) / typeData.scores.length
        );
        delete typeData.scores;
      });

      // Calculate improvement trend
      if (interviews.length >= 2) {
        const recent = interviews.slice(0, Math.min(3, interviews.length));
        const older = interviews.slice(-Math.min(3, interviews.length));
        const recentAvg = recent.reduce((a, b) => a + b.overallScore, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b.overallScore, 0) / older.length;
        stats.recentImprovement = Math.round(recentAvg - olderAvg);
      }
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get enhanced interview analysis
export const getEnhancedAnalysis = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user.id,
      status: 'completed'
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found or not completed' });
    }

    // If comprehensive analysis doesn't exist, generate it
    if (!interview.comprehensiveAnalysis) {
      try {
        console.log('Generating missing comprehensive analysis...');
        const comprehensiveAnalysis = await EnhancedAIAnalysis.generateComprehensiveReport(interview);
        interview.comprehensiveAnalysis = comprehensiveAnalysis;
        await interview.save();
        console.log('Comprehensive analysis generated and saved');
      } catch (error) {
        console.error('Failed to generate comprehensive analysis:', error);
        return res.status(500).json({ error: 'Failed to generate enhanced analysis' });
      }
    }

    res.json({
      interviewId: interview._id,
      basicInfo: {
        role: interview.role,
        type: interview.type,
        experience: interview.experience,
        mode: interview.mode,
        overallScore: interview.overallScore,
        completedAt: interview.endTime
      },
      comprehensiveAnalysis: interview.comprehensiveAnalysis,
      questionAnalyses: interview.questions.map(q => ({
        question: q.question,
        score: q.score,
        feedback: q.feedback,
        strengths: q.strengths,
        improvements: q.improvements,
        scoreBreakdown: q.scoreBreakdown,
        detailedAnalysis: q.detailedAnalysis,
        keywordAnalysis: q.keywordAnalysis,
        exampleQuality: q.exampleQuality,
        structureAnalysis: q.structureAnalysis,
        nextLevelTips: q.nextLevelTips,
        sampleImprovedAnswer: q.sampleImprovedAnswer,
        speechAnalysis: q.speechAnalysis,
        communicationStrengths: q.communicationStrengths,
        communicationImprovements: q.communicationImprovements,
        speechTips: q.speechTips,
        practiceExercises: q.practiceExercises,
        videoPresenceAnalysis: q.videoPresenceAnalysis,
        presenceStrengths: q.presenceStrengths,
        presenceImprovements: q.presenceImprovements,
        videoTips: q.videoTips,
        setupRecommendations: q.setupRecommendations
      }))
    });
  } catch (error) {
    console.error('Error getting enhanced analysis:', error);
    res.status(500).json({ error: error.message });
  }
};

// Regenerate enhanced analysis (for when AI models improve)
export const regenerateEnhancedAnalysis = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user.id,
      status: 'completed'
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found or not completed' });
    }

    console.log('Regenerating comprehensive analysis...');
    const comprehensiveAnalysis = await EnhancedAIAnalysis.generateComprehensiveReport(interview);
    interview.comprehensiveAnalysis = comprehensiveAnalysis;
    await interview.save();

    res.json({
      success: true,
      message: 'Enhanced analysis regenerated successfully',
      analysis: comprehensiveAnalysis
    });
  } catch (error) {
    console.error('Error regenerating enhanced analysis:', error);
    res.status(500).json({ error: error.message });
  }
};
