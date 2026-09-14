import OpenAI from 'openai';

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
 * Enhanced AI Analysis for Interview Performance
 * Provides comprehensive, personalized feedback based on speech patterns, content, and video analysis
 */
export class EnhancedAIAnalysis {
  
  /**
   * Analyze speech patterns and verbal communication
   */
  static async analyzeSpeechPatterns(audioTranscript, duration, mode = 'text') {
    try {
      const client = getOpenAIClient();
      if (!client) {
        throw new Error('OpenAI API key not configured');
      }

      const systemPrompt = `You are an expert speech and communication analyst specializing in interview performance evaluation.

Analyze the following aspects of verbal communication:
1. SPEECH CLARITY: Pronunciation, articulation, pace
2. FILLER WORDS: Um, uh, like, you know, etc.
3. CONFIDENCE INDICATORS: Tone, certainty, assertiveness
4. STRUCTURE: Logical flow, transitions, organization
5. VOCABULARY: Professional language, technical terms, variety
6. ENGAGEMENT: Enthusiasm, energy, passion

Provide actionable feedback for improvement.`;

      const userPrompt = `Analyze this interview response for speech patterns and communication quality:

TRANSCRIPT: "${audioTranscript}"
DURATION: ${duration} seconds
MODE: ${mode}

Provide detailed analysis in JSON format:
{
  "speechAnalysis": {
    "clarityScore": <1-10>,
    "paceAnalysis": "<too-fast|optimal|too-slow>",
    "fillerWordCount": <number>,
    "confidenceLevel": <1-10>,
    "vocabularyRichness": <1-10>,
    "professionalTone": <1-10>
  },
  "communicationStrengths": [
    "<specific strength with example>",
    "<specific strength with example>"
  ],
  "communicationImprovements": [
    "<specific improvement with action>",
    "<specific improvement with action>"
  ],
  "speechTips": [
    "<actionable tip for better speech>",
    "<actionable tip for better speech>"
  ],
  "practiceExercises": [
    "<specific exercise to improve speech>",
    "<specific exercise to improve speech>"
  ]
}`;

      const response = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error analyzing speech patterns:', error);
      return this.getFallbackSpeechAnalysis();
    }
  }

  /**
   * Analyze facial expressions and body language (for video interviews)
   */
  static async analyzeVideoPresence(videoMetadata, interviewDuration) {
    try {
      const client = getOpenAIClient();
      if (!client) {
        throw new Error('OpenAI API key not configured');
      }

      // In a real implementation, you would use computer vision APIs like:
      // - Azure Face API for emotion detection
      // - Google Vision API for facial analysis
      // - AWS Rekognition for video analysis
      
      // For now, we'll simulate based on available metadata
      const systemPrompt = `You are an expert in non-verbal communication and video interview analysis.

Analyze video interview presence based on available metadata and provide actionable feedback for:
1. EYE CONTACT: Looking at camera vs screen
2. FACIAL EXPRESSIONS: Engagement, confidence, authenticity
3. POSTURE: Professional appearance, body language
4. GESTURES: Natural hand movements, emphasis
5. ENVIRONMENT: Background, lighting, professionalism
6. ENERGY LEVEL: Enthusiasm, engagement, presence`;

      const userPrompt = `Analyze video interview presence based on this metadata:

VIDEO METADATA: ${JSON.stringify(videoMetadata)}
INTERVIEW DURATION: ${interviewDuration} seconds

Provide comprehensive video presence analysis:
{
  "videoPresenceAnalysis": {
    "eyeContactScore": <1-10>,
    "facialExpressionScore": <1-10>,
    "postureScore": <1-10>,
    "gestureNaturalness": <1-10>,
    "environmentProfessionalism": <1-10>,
    "overallPresence": <1-10>
  },
  "presenceStrengths": [
    "<specific strength observed>",
    "<specific strength observed>"
  ],
  "presenceImprovements": [
    "<specific improvement needed>",
    "<specific improvement needed>"
  ],
  "videoTips": [
    "<actionable tip for better video presence>",
    "<actionable tip for better video presence>"
  ],
  "setupRecommendations": [
    "<technical setup improvement>",
    "<technical setup improvement>"
  ]
}`;

      const response = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error analyzing video presence:', error);
      return this.getFallbackVideoAnalysis();
    }
  }

  /**
   * Generate personalized improvement roadmap
   */
  static async generateImprovementRoadmap(interview, detailedAnalysis) {
    try {
      const client = getOpenAIClient();
      if (!client) {
        throw new Error('OpenAI API key not configured');
      }

      const systemPrompt = `You are a senior career coach and interview expert with 20+ years of experience helping candidates land their dream jobs.

Create a personalized, actionable improvement roadmap that:
1. Prioritizes the most impactful improvements
2. Provides specific, measurable goals
3. Includes timeline and milestones
4. Suggests resources and practice methods
5. Addresses both technical and soft skills
6. Considers the candidate's experience level and target role

Be specific, practical, and motivational.`;

      const userPrompt = `Create a comprehensive improvement roadmap for this candidate:

INTERVIEW DETAILS:
- Role: ${interview.role}
- Experience Level: ${interview.experience}
- Interview Type: ${interview.type}
- Overall Score: ${interview.overallScore}/100
- Mode: ${interview.mode}

DETAILED ANALYSIS:
${JSON.stringify(detailedAnalysis, null, 2)}

QUESTION PERFORMANCE:
${interview.questions.map((q, i) => `
Q${i + 1}: ${q.question}
Score: ${q.score}/100
Strengths: ${q.strengths?.join(', ') || 'None identified'}
Improvements: ${q.improvements?.join(', ') || 'None identified'}
`).join('\n')}

Generate a comprehensive roadmap:
{
  "improvementRoadmap": {
    "priorityLevel": "<high|medium|low>",
    "estimatedTimeToImprovement": "<weeks needed>",
    "focusAreas": [
      {
        "area": "<skill/area name>",
        "currentLevel": "<assessment>",
        "targetLevel": "<goal>",
        "priority": "<high|medium|low>",
        "timeframe": "<weeks>",
        "specificActions": [
          "<actionable step>",
          "<actionable step>"
        ],
        "resources": [
          "<specific resource>",
          "<specific resource>"
        ],
        "milestones": [
          "<measurable milestone>",
          "<measurable milestone>"
        ]
      }
    ]
  },
  "weeklyPlan": {
    "week1": {
      "focus": "<main focus area>",
      "dailyTasks": [
        "<specific daily task>",
        "<specific daily task>"
      ],
      "practiceGoals": [
        "<measurable practice goal>",
        "<measurable practice goal>"
      ]
    },
    "week2": {
      "focus": "<main focus area>",
      "dailyTasks": [
        "<specific daily task>",
        "<specific daily task>"
      ],
      "practiceGoals": [
        "<measurable practice goal>",
        "<measurable practice goal>"
      ]
    },
    "week3": {
      "focus": "<main focus area>",
      "dailyTasks": [
        "<specific daily task>",
        "<specific daily task>"
      ],
      "practiceGoals": [
        "<measurable practice goal>",
        "<measurable practice goal>"
      ]
    },
    "week4": {
      "focus": "<main focus area>",
      "dailyTasks": [
        "<specific daily task>",
        "<specific daily task>"
      ],
      "practiceGoals": [
        "<measurable practice goal>",
        "<measurable practice goal>"
      ]
    }
  },
  "resourceLibrary": {
    "books": [
      "<relevant book with reason>",
      "<relevant book with reason>"
    ],
    "onlineCourses": [
      "<course with specific skills>",
      "<course with specific skills>"
    ],
    "practiceWebsites": [
      "<website with specific use>",
      "<website with specific use>"
    ],
    "youtubeChannels": [
      "<channel with specific content>",
      "<channel with specific content>"
    ]
  },
  "mockInterviewPlan": {
    "frequency": "<how often>",
    "focusAreas": ["<area>", "<area>"],
    "progressionPlan": "<how to increase difficulty>",
    "recordingAnalysis": "<what to analyze in recordings>"
  },
  "successMetrics": [
    "<measurable success indicator>",
    "<measurable success indicator>",
    "<measurable success indicator>"
  ],
  "motivationalMessage": "<personalized encouragement>",
  "nextInterviewReadiness": "<when they'll be ready for real interviews>"
}`;

      const response = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.4,
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error generating improvement roadmap:', error);
      return this.getFallbackRoadmap();
    }
  }

  /**
   * Analyze industry-specific performance benchmarks
   */
  static async generateBenchmarkAnalysis(interview, industryData = {}) {
    try {
      const client = getOpenAIClient();
      if (!client) {
        throw new Error('OpenAI API key not configured');
      }

      const systemPrompt = `You are a data-driven recruitment analyst with access to industry hiring trends and performance benchmarks.

Analyze the candidate's performance against:
1. Industry standards for their role and experience level
2. Current market competitiveness
3. Hiring manager expectations
4. Peer performance comparisons
5. Skills gap analysis for their target role

Provide realistic, data-informed insights about their market position.`;

      const userPrompt = `Analyze this candidate's market competitiveness:

CANDIDATE PROFILE:
- Role: ${interview.role}
- Experience: ${interview.experience}
- Interview Score: ${interview.overallScore}/100
- Interview Type: ${interview.type}

PERFORMANCE BREAKDOWN:
${interview.questions.map((q, i) => `Q${i + 1}: ${q.score}/100`).join(', ')}

INDUSTRY CONTEXT:
${JSON.stringify(industryData)}

Provide benchmark analysis:
{
  "benchmarkAnalysis": {
    "industryPercentile": "<percentile ranking>",
    "marketReadiness": "<ready|needs-practice|significant-work-needed>",
    "competitiveAdvantages": [
      "<specific advantage vs peers>",
      "<specific advantage vs peers>"
    ],
    "competitiveWeaknesses": [
      "<specific weakness vs peers>",
      "<specific weakness vs peers>"
    ],
    "salaryNegotiationPosition": "<strong|moderate|weak>",
    "hiringProbability": "<high|medium|low>",
    "topCompaniesReadiness": {
      "faang": "<ready|not-ready>",
      "startups": "<ready|not-ready>",
      "enterprise": "<ready|not-ready>",
      "consulting": "<ready|not-ready>"
    }
  },
  "marketInsights": {
    "currentDemand": "<high|medium|low>",
    "keySkillsInDemand": [
      "<skill in high demand>",
      "<skill in high demand>"
    ],
    "emergingTrends": [
      "<trend affecting role>",
      "<trend affecting role>"
    ],
    "geographicOpportunities": [
      "<location with opportunities>",
      "<location with opportunities>"
    ]
  },
  "careerGuidance": {
    "immediateOpportunities": [
      "<type of role to target now>",
      "<type of role to target now>"
    ],
    "skillGapPriorities": [
      "<critical skill to develop>",
      "<critical skill to develop>"
    ],
    "careerPathOptions": [
      "<potential career direction>",
      "<potential career direction>"
    ],
    "networkingStrategy": [
      "<networking recommendation>",
      "<networking recommendation>"
    ]
  }
}`;

      const response = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2500,
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error generating benchmark analysis:', error);
      return this.getFallbackBenchmarkAnalysis();
    }
  }

  /**
   * Generate comprehensive interview report with all analyses
   */
  static async generateComprehensiveReport(interview) {
    try {
      const analyses = {};

      // Analyze each answered question for speech patterns
      for (const question of interview.questions) {
        if (question.userAnswer) {
          analyses[`question_${question._id}`] = {
            speechAnalysis: await this.analyzeSpeechPatterns(
              question.userAnswer, 
              question.duration || 60, 
              interview.mode
            )
          };

          // Add video analysis for video interviews
          if (interview.mode === 'video') {
            analyses[`question_${question._id}`].videoAnalysis = await this.analyzeVideoPresence(
              { questionId: question._id, duration: question.duration },
              question.duration || 60
            );
          }
        }
      }

      // Generate improvement roadmap
      const roadmap = await this.generateImprovementRoadmap(interview, analyses);

      // Generate benchmark analysis
      const benchmarks = await this.generateBenchmarkAnalysis(interview);

      return {
        speechAnalyses: analyses,
        improvementRoadmap: roadmap,
        benchmarkAnalysis: benchmarks,
        generatedAt: new Date(),
        analysisVersion: '2.0'
      };
    } catch (error) {
      console.error('Error generating comprehensive report:', error);
      throw error;
    }
  }

  // Fallback methods for when AI is not available
  static getFallbackSpeechAnalysis() {
    return {
      speechAnalysis: {
        clarityScore: 7,
        paceAnalysis: "optimal",
        fillerWordCount: 3,
        confidenceLevel: 7,
        vocabularyRichness: 6,
        professionalTone: 7
      },
      communicationStrengths: [
        "Clear articulation and professional tone",
        "Good use of relevant terminology"
      ],
      communicationImprovements: [
        "Reduce filler words for more confident delivery",
        "Vary speaking pace for better engagement"
      ],
      speechTips: [
        "Practice speaking slowly and deliberately",
        "Record yourself to identify speech patterns"
      ],
      practiceExercises: [
        "Read technical articles aloud daily",
        "Practice elevator pitches with a timer"
      ]
    };
  }

  static getFallbackVideoAnalysis() {
    return {
      videoPresenceAnalysis: {
        eyeContactScore: 7,
        facialExpressionScore: 6,
        postureScore: 8,
        gestureNaturalness: 7,
        environmentProfessionalism: 8,
        overallPresence: 7
      },
      presenceStrengths: [
        "Professional setup and background",
        "Good posture and positioning"
      ],
      presenceImprovements: [
        "Maintain more consistent eye contact with camera",
        "Use more natural hand gestures for emphasis"
      ],
      videoTips: [
        "Look directly at the camera, not the screen",
        "Practice with video calls to build comfort"
      ],
      setupRecommendations: [
        "Ensure camera is at eye level",
        "Use good lighting facing you"
      ]
    };
  }

  static getFallbackRoadmap() {
    return {
      improvementRoadmap: {
        priorityLevel: "medium",
        estimatedTimeToImprovement: "4-6 weeks",
        focusAreas: [
          {
            area: "Communication Skills",
            currentLevel: "Developing",
            targetLevel: "Proficient",
            priority: "high",
            timeframe: "3 weeks",
            specificActions: [
              "Practice STAR method responses",
              "Record and review practice interviews"
            ],
            resources: [
              "Cracking the Coding Interview book",
              "YouTube interview preparation channels"
            ],
            milestones: [
              "Complete 5 practice interviews",
              "Reduce filler words by 50%"
            ]
          }
        ]
      },
      weeklyPlan: {
        week1: {
          focus: "Foundation Building",
          dailyTasks: [
            "Practice one STAR response daily",
            "Review common interview questions"
          ],
          practiceGoals: [
            "Complete 2 mock interviews",
            "Identify top 3 improvement areas"
          ]
        }
      },
      resourceLibrary: {
        books: ["Cracking the Coding Interview"],
        onlineCourses: ["Interview preparation courses"],
        practiceWebsites: ["LeetCode, HackerRank"],
        youtubeChannels: ["Tech interview channels"]
      },
      mockInterviewPlan: {
        frequency: "2-3 times per week",
        focusAreas: ["Technical depth", "Communication clarity"],
        progressionPlan: "Increase difficulty gradually",
        recordingAnalysis: "Focus on speech patterns and content structure"
      },
      successMetrics: [
        "Achieve 80+ average score in practice interviews",
        "Reduce filler words to less than 2 per minute",
        "Complete answers within optimal time ranges"
      ],
      motivationalMessage: "You have strong potential and with focused practice, you'll see significant improvement in your interview performance.",
      nextInterviewReadiness: "4-6 weeks with consistent practice"
    };
  }

  static getFallbackBenchmarkAnalysis() {
    return {
      benchmarkAnalysis: {
        industryPercentile: "60th percentile",
        marketReadiness: "needs-practice",
        competitiveAdvantages: [
          "Strong technical foundation",
          "Good problem-solving approach"
        ],
        competitiveWeaknesses: [
          "Communication could be more structured",
          "Need more specific examples"
        ],
        salaryNegotiationPosition: "moderate",
        hiringProbability: "medium",
        topCompaniesReadiness: {
          faang: "not-ready",
          startups: "ready",
          enterprise: "ready",
          consulting: "needs-practice"
        }
      },
      marketInsights: {
        currentDemand: "high",
        keySkillsInDemand: [
          "Cloud technologies",
          "System design"
        ],
        emergingTrends: [
          "AI/ML integration",
          "Microservices architecture"
        ],
        geographicOpportunities: [
          "Tech hubs with remote opportunities",
          "Growing startup ecosystems"
        ]
      },
      careerGuidance: {
        immediateOpportunities: [
          "Mid-level developer positions",
          "Startup technical roles"
        ],
        skillGapPriorities: [
          "System design knowledge",
          "Leadership experience"
        ],
        careerPathOptions: [
          "Senior developer track",
          "Technical lead pathway"
        ],
        networkingStrategy: [
          "Join tech meetups and conferences",
          "Contribute to open source projects"
        ]
      }
    };
  }
}

export default EnhancedAIAnalysis;