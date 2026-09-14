import OpenAI from 'openai';
import AIMentorSession from '../models/AIMentorSession.js';
import Interview from '../models/Interview.js';
import TestAttempt from '../models/TestAttempt.js';
import User from '../models/User.js';

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
 * Generate comprehensive system prompt based on user context
 */
const generateSystemPrompt = (userContext, sessionContext) => {
  return `You are Alex, an empathetic and highly knowledgeable AI Career Mentor and Life Coach. You specialize in helping students and professionals with:

🎯 CORE EXPERTISE:
- Career guidance and job preparation
- Emotional support and mental wellness
- Study planning and learning strategies
- Interview preparation and skill development
- Goal setting and motivation
- Stress management and work-life balance

👤 USER CONTEXT:
- Name: ${userContext.name || 'Student'}
- Current Goals: ${sessionContext.currentGoals?.join(', ') || 'Career development'}
- Emotional State: ${sessionContext.emotionalState || 'neutral'}
- Learning Style: ${sessionContext.learningStyle || 'visual'}
- Recent Activities: ${sessionContext.recentActivities?.join(', ') || 'None'}

🧠 YOUR PERSONALITY:
- Warm, supportive, and encouraging
- Professional yet approachable
- Empathetic and understanding
- Solution-oriented and practical
- Motivational and inspiring

💬 COMMUNICATION STYLE:
- Use encouraging and positive language
- Provide specific, actionable advice
- Ask thoughtful follow-up questions
- Acknowledge emotions and validate feelings
- Break down complex problems into manageable steps
- Use emojis sparingly but effectively
- Keep responses conversational and engaging

🎯 RESPONSE GUIDELINES:
- Always be supportive and non-judgmental
- Provide practical, actionable advice
- Ask clarifying questions when needed
- Offer specific resources and next steps
- Acknowledge progress and celebrate wins
- Help reframe negative thoughts positively
- Suggest concrete action items
- Be concise but comprehensive (aim for 2-4 paragraphs)

🚫 IMPORTANT BOUNDARIES:
- You are not a licensed therapist or medical professional
- For serious mental health concerns, recommend professional help
- Stay focused on career, education, and personal development
- Don't provide medical, legal, or financial advice
- Maintain professional boundaries while being supportive

Remember: Your goal is to empower, motivate, and guide students toward their career and personal goals while providing emotional support and practical strategies.`;
};

/**
 * Analyze user message for sentiment and topics
 */
const analyzeMessage = async (message) => {
  try {
    const client = getOpenAIClient();
    if (client) {
      const analysisPrompt = `Analyze this message for sentiment, topics, and action items:

Message: "${message}"

Provide a JSON response with:
{
  "sentiment": "positive|negative|neutral",
  "confidence": 0.0-1.0,
  "topics": ["topic1", "topic2"],
  "actionItems": ["action1", "action2"],
  "emotionalIndicators": ["indicator1", "indicator2"]
}`;

      const response = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: analysisPrompt }],
        temperature: 0.3,
        max_tokens: 300,
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content);
    }
  } catch (error) {
    console.log('AI analysis failed, using basic analysis:', error.message);
  }

  // Fallback analysis without AI
  return analyzeMessageBasic(message);
};

/**
 * Basic message analysis without AI
 */
const analyzeMessageBasic = (message) => {
  const text = message.toLowerCase();
  
  // Sentiment analysis
  const positiveWords = ['happy', 'excited', 'great', 'awesome', 'good', 'love', 'amazing', 'wonderful', 'fantastic', 'excellent', 'motivated', 'confident', 'proud', 'successful'];
  const negativeWords = ['sad', 'angry', 'frustrated', 'stressed', 'worried', 'anxious', 'overwhelmed', 'difficult', 'hard', 'struggle', 'problem', 'issue', 'fail', 'scared', 'nervous'];
  
  const positiveCount = positiveWords.filter(word => text.includes(word)).length;
  const negativeCount = negativeWords.filter(word => text.includes(word)).length;
  
  let sentiment = 'neutral';
  let confidence = 0.5;
  
  if (positiveCount > negativeCount) {
    sentiment = 'positive';
    confidence = Math.min(0.9, 0.5 + (positiveCount * 0.1));
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative';
    confidence = Math.min(0.9, 0.5 + (negativeCount * 0.1));
  }
  
  // Topic extraction
  const topics = [];
  if (/career|job|work|interview|resume|company/.test(text)) topics.push('career');
  if (/study|learn|exam|test|course|education/.test(text)) topics.push('study');
  if (/stress|anxiety|worried|overwhelmed/.test(text)) topics.push('stress');
  if (/goal|motivation|inspire|confidence/.test(text)) topics.push('motivation');
  if (/help|support|advice|guidance/.test(text)) topics.push('support');
  if (/skill|development|improve|growth/.test(text)) topics.push('skill-development');
  
  return {
    sentiment,
    confidence,
    topics,
    actionItems: [],
    emotionalIndicators: topics.includes('stress') ? ['stress'] : topics.includes('motivation') ? ['motivation'] : []
  };
};

/**
 * Generate comprehensive, intelligent fallback response when AI is not available
 */
const generateIntelligentFallback = (userMessage, conversationHistory, userContext) => {
  const message = userMessage.toLowerCase();
  
  // Enhanced keyword analysis with more comprehensive categories
  const keywordCategories = {
    stress: ['stress', 'stressed', 'anxiety', 'anxious', 'overwhelmed', 'pressure', 'worried', 'nervous', 'panic', 'burnout', 'exhausted', 'tired', 'frustrated', 'angry', 'upset', 'crying', 'depressed', 'sad'],
    motivation: ['motivation', 'motivated', 'inspire', 'encourage', 'confidence', 'goal', 'dream', 'ambition', 'success', 'achieve', 'accomplish', 'determination', 'drive', 'passion', 'purpose', 'vision'],
    career: ['job', 'career', 'interview', 'resume', 'work', 'company', 'skill', 'experience', 'promotion', 'salary', 'boss', 'colleague', 'workplace', 'professional', 'networking', 'linkedin', 'application', 'hiring'],
    study: ['study', 'exam', 'test', 'learn', 'course', 'education', 'assignment', 'project', 'homework', 'grade', 'university', 'college', 'school', 'teacher', 'professor', 'research', 'thesis', 'dissertation'],
    help: ['help', 'support', 'advice', 'guidance', 'confused', 'lost', 'stuck', 'don\'t know', 'unsure', 'uncertain', 'doubt', 'question', 'problem', 'issue', 'challenge', 'difficulty'],
    relationships: ['friend', 'family', 'relationship', 'dating', 'love', 'breakup', 'conflict', 'argument', 'social', 'lonely', 'isolation', 'communication', 'trust'],
    health: ['health', 'sick', 'illness', 'doctor', 'medicine', 'exercise', 'fitness', 'diet', 'sleep', 'insomnia', 'headache', 'pain'],
    finance: ['money', 'budget', 'debt', 'loan', 'savings', 'investment', 'financial', 'expensive', 'cheap', 'cost', 'price', 'afford'],
    time: ['time', 'schedule', 'deadline', 'procrastination', 'productivity', 'organization', 'planning', 'busy', 'rush', 'late', 'early'],
    future: ['future', 'plan', 'planning', 'tomorrow', 'next', 'later', 'eventually', 'someday', 'hope', 'wish', 'want', 'need']
  };
  
  // Analyze message for multiple categories and context
  const detectedCategories = [];
  const categoryScores = {};
  
  Object.entries(keywordCategories).forEach(([category, keywords]) => {
    const matches = keywords.filter(keyword => message.includes(keyword));
    if (matches.length > 0) {
      detectedCategories.push(category);
      categoryScores[category] = matches.length;
    }
  });
  
  // Determine primary category
  const primaryCategory = detectedCategories.length > 0 
    ? detectedCategories.reduce((a, b) => categoryScores[a] > categoryScores[b] ? a : b)
    : 'general';
  
  // Analyze conversation history for context
  const conversationContext = analyzeConversationHistory(conversationHistory);
  
  // Generate comprehensive response based on category and context
  let response, suggestions, topics = [], sentiment = 'neutral';
  
  // Generate comprehensive responses based on primary category
  switch (primaryCategory) {
    case 'stress':
      topics = ['stress', 'emotional-support', 'wellness'];
      sentiment = 'negative';
      response = generateStressResponse(message, conversationContext, userContext);
      suggestions = [
        "Tell me more about what's causing this stress",
        "What would help you feel calmer right now?",
        "Let's create a step-by-step plan to tackle this",
        "What's one small thing you can do today to feel better?",
        "Have you tried any stress management techniques before?",
        "What usually helps you when you're feeling overwhelmed?"
      ];
      break;
      
    case 'motivation':
      topics = ['motivation', 'goals', 'personal-development'];
      sentiment = 'positive';
      response = generateMotivationResponse(message, conversationContext, userContext);
      suggestions = [
        "What's your biggest goal right now?",
        "Tell me about a recent achievement you're proud of",
        "What would success look like for you?",
        "What's one step you can take today toward your goal?",
        "What obstacles are you facing in reaching your goals?",
        "How do you usually stay motivated when things get tough?"
      ];
      break;
      
    case 'career':
      topics = ['career', 'professional-development', 'job-search'];
      sentiment = 'neutral';
      response = generateCareerResponse(message, conversationContext, userContext);
      suggestions = [
        "What career goals are you working toward?",
        "Tell me about your current job search or role",
        "What skills do you want to develop?",
        "How can I help with interview preparation?",
        "What's your ideal work environment?",
        "What challenges are you facing in your career?"
      ];
      break;
      
    case 'study':
      topics = ['study', 'education', 'learning'];
      sentiment = 'neutral';
      response = generateStudyResponse(message, conversationContext, userContext);
      suggestions = [
        "What subject are you studying?",
        "Tell me about your current study challenges",
        "What's your biggest upcoming exam or project?",
        "How do you prefer to learn new material?",
        "What study methods have worked best for you?",
        "How do you stay focused while studying?"
      ];
      break;
      
    case 'relationships':
      topics = ['relationships', 'social', 'communication'];
      sentiment = message.includes('conflict') || message.includes('argument') ? 'negative' : 'neutral';
      response = generateRelationshipResponse(message, conversationContext, userContext);
      suggestions = [
        "Tell me more about this relationship situation",
        "How do you usually handle conflicts?",
        "What would an ideal resolution look like?",
        "Have you tried talking to them about this?",
        "What support do you need right now?",
        "How are you taking care of yourself through this?"
      ];
      break;
      
    case 'time':
      topics = ['time-management', 'productivity', 'organization'];
      sentiment = 'neutral';
      response = generateTimeManagementResponse(message, conversationContext, userContext);
      suggestions = [
        "What's your biggest time management challenge?",
        "How do you currently organize your day?",
        "What tasks are taking up most of your time?",
        "What would help you feel more organized?",
        "Have you tried any productivity techniques?",
        "What's your ideal daily routine?"
      ];
      break;
      
    case 'future':
      topics = ['future-planning', 'goals', 'vision'];
      sentiment = 'positive';
      response = generateFuturePlanningResponse(message, conversationContext, userContext);
      suggestions = [
        "What does your ideal future look like?",
        "What steps are you taking toward your goals?",
        "What's exciting you most about your future?",
        "What concerns do you have about the future?",
        "How can I help you plan your next steps?",
        "What would make you feel more confident about your future?"
      ];
      break;
      
    default:
      topics = ['conversation', 'support', 'general'];
      response = generateGeneralResponse(message, conversationContext, userContext);
      suggestions = [
        "Tell me more about what's on your mind",
        "What's been the highlight of your week?",
        "What's something you're looking forward to?",
        "How can I best support you today?",
        "What would help you feel more confident?",
        "What's one thing you'd like to improve about yourself?"
      ];
  }
  
  return {
    response,
    suggestions,
    messageAnalysis: {
      sentiment,
      confidence: 0.8,
      topics,
      actionItems: extractActionItems(response)
    }
  };
};

// Helper function to analyze conversation history
const analyzeConversationHistory = (history) => {
  if (!history || history.length === 0) return { isFirstMessage: true, recentTopics: [] };
  
  const recentMessages = history.slice(-5);
  const recentTopics = [];
  const userMessages = recentMessages.filter(msg => msg.role === 'user');
  
  userMessages.forEach(msg => {
    const content = msg.content.toLowerCase();
    if (content.includes('stress') || content.includes('anxiety')) recentTopics.push('stress');
    if (content.includes('career') || content.includes('job')) recentTopics.push('career');
    if (content.includes('study') || content.includes('exam')) recentTopics.push('study');
  });
  
  return {
    isFirstMessage: history.length <= 1,
    recentTopics: [...new Set(recentTopics)],
    conversationLength: history.length,
    lastUserMessage: userMessages[userMessages.length - 1]?.content || ''
  };
};

// Comprehensive response generators
const generateStressResponse = (message, context, userContext) => {
  const stressLevel = message.includes('overwhelmed') || message.includes('panic') ? 'high' : 
                    message.includes('worried') || message.includes('nervous') ? 'medium' : 'low';
  
  let response = `I can sense you're going through a challenging time, and I want you to know that what you're feeling is completely valid and understandable. Stress affects everyone, and reaching out shows incredible strength and self-awareness.

**Immediate Relief Strategies:**
🌬️ **Breathing Exercise**: Try the 4-7-8 technique right now - inhale for 4 counts, hold for 7, exhale for 8. Repeat 3 times.
🧘 **Grounding Technique**: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.
💪 **Physical Release**: Do 10 jumping jacks or stretch your arms above your head - movement helps release tension.

**Longer-term Strategies:**
📝 **Brain Dump**: Write down everything that's stressing you - getting it out of your head onto paper can provide immediate relief.
🎯 **Priority Matrix**: Categorize your stressors into "urgent & important," "important but not urgent," etc.
🤝 **Support Network**: Identify 2-3 people you can talk to when stress becomes overwhelming.`;

  if (stressLevel === 'high') {
    response += `\n\n**Important Note**: If you're feeling overwhelmed to the point where it's affecting your daily life, sleep, or well-being significantly, please consider reaching out to a counselor, therapist, or trusted adult. There's no shame in seeking professional support - it's actually a sign of wisdom and self-care.`;
  }

  response += `\n\nRemember: You've overcome challenges before, and you have the strength to get through this one too. What specific situation is causing you the most stress right now? Let's break it down together.`;

  return response;
};

const generateMotivationResponse = (message, context, userContext) => {
  const hasGoals = message.includes('goal') || message.includes('dream') || message.includes('want');
  const needsEncouragement = message.includes('give up') || message.includes('quit') || message.includes('can\'t');
  
  let response = `I absolutely love your focus on growth and motivation! The fact that you're actively thinking about your goals and seeking inspiration shows that you have the mindset of a winner. 🌟

**The Science of Motivation:**
🧠 **Intrinsic vs Extrinsic**: The most sustainable motivation comes from within - from your values, interests, and personal satisfaction.
🎯 **Goal Setting**: SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound) are 42% more likely to be achieved.
🔄 **Habit Formation**: It takes an average of 66 days to form a new habit - consistency beats perfection every time.

**Practical Motivation Strategies:**
✅ **Daily Wins**: Set 3 small, achievable goals each day to build momentum
📊 **Progress Tracking**: Keep a visual record of your progress - seeing improvement is incredibly motivating
🎉 **Celebration Ritual**: Acknowledge and celebrate every small victory along the way
🔥 **Why Power**: Connect your goals to your deeper "why" - your values and what matters most to you`;

  if (needsEncouragement) {
    response += `\n\n**Special Message for You**: I can sense you might be feeling discouraged right now. That's completely normal - every successful person has felt this way. The difference between those who succeed and those who don't isn't the absence of doubt, it's the decision to keep going despite it. You have something special inside you, and the world needs what you have to offer.`;
  }

  if (hasGoals) {
    response += `\n\n**Goal Achievement Framework:**
1. **Clarity**: Get crystal clear on exactly what you want
2. **Planning**: Break it down into smaller, manageable steps
3. **Action**: Take one small step today, no matter how tiny
4. **Consistency**: Show up every day, even when you don't feel like it
5. **Adjustment**: Be flexible and adjust your approach as needed`;
  }

  response += `\n\nWhat specific goal or dream are you working toward? I'd love to help you create a concrete action plan to make it happen!`;

  return response;
};

const generateCareerResponse = (message, context, userContext) => {
  const isJobSearch = message.includes('job') || message.includes('application') || message.includes('hiring');
  const isSkillDevelopment = message.includes('skill') || message.includes('learn') || message.includes('improve');
  const isInterviewPrep = message.includes('interview') || message.includes('preparation');
  
  let response = `Career development is one of the most important investments you can make in yourself, and I'm excited to support you on this journey! Whether you're just starting out or looking to advance, every step you take is building toward your future success. 🚀

**Career Success Framework:**
🎯 **Self-Assessment**: Understanding your strengths, values, and interests
💼 **Market Research**: Knowing what employers want and industry trends
🛠️ **Skill Development**: Continuously building relevant technical and soft skills
🌐 **Networking**: Building genuine relationships in your field
📈 **Personal Branding**: Showcasing your unique value proposition`;

  if (isJobSearch) {
    response += `\n\n**Job Search Strategy:**
📝 **Resume Optimization**: Tailor your resume for each application with relevant keywords
🔍 **Strategic Applications**: Quality over quantity - research companies and roles thoroughly
💬 **Networking**: 70% of jobs are never posted publicly - tap into your network
📞 **Follow-up**: Send thank-you notes and follow up professionally
🎯 **Interview Prep**: Practice common questions and prepare specific examples (STAR method)

**Daily Job Search Routine:**
- Morning: Apply to 2-3 targeted positions
- Afternoon: Network with 1-2 people in your field
- Evening: Research companies and prepare for upcoming interviews`;
  }

  if (isSkillDevelopment) {
    response += `\n\n**Skill Development Roadmap:**
🔍 **Gap Analysis**: Identify the skills most in-demand for your target role
📚 **Learning Plan**: Mix of online courses, books, and hands-on projects
🏗️ **Project Portfolio**: Build real projects that demonstrate your skills
🤝 **Mentorship**: Find experienced professionals who can guide your growth
📊 **Progress Tracking**: Regularly assess your improvement and adjust your plan`;
  }

  if (isInterviewPrep) {
    response += `\n\n**Interview Excellence Guide:**
📋 **Research**: Know the company, role, and interviewer thoroughly
💡 **STAR Method**: Structure your answers with Situation, Task, Action, Result
🎭 **Practice**: Do mock interviews and record yourself to improve
❓ **Questions**: Prepare thoughtful questions that show your interest
👔 **Presentation**: Dress appropriately and arrive 10-15 minutes early
🤝 **Follow-up**: Send a personalized thank-you note within 24 hours`;
  }

  response += `\n\nWhat specific aspect of your career would you like to focus on? I can help you create a detailed action plan with specific steps and timelines!`;

  return response;
};

const generateStudyResponse = (message, context, userContext) => {
  const hasExam = message.includes('exam') || message.includes('test');
  const hasProject = message.includes('project') || message.includes('assignment');
  const hasConcentration = message.includes('focus') || message.includes('concentrate') || message.includes('distracted');
  
  let response = `Learning effectively is a superpower that will serve you throughout your entire life! I'm here to help you develop study strategies that work specifically for your learning style and goals. 📚

**The Science of Learning:**
🧠 **Active Recall**: Testing yourself is 2x more effective than re-reading
🔄 **Spaced Repetition**: Review material at increasing intervals (1 day, 3 days, 1 week, 2 weeks)
🎯 **Focused Practice**: Deliberate practice on your weakest areas yields the fastest improvement
💤 **Sleep & Memory**: Your brain consolidates memories during sleep - aim for 7-9 hours

**Proven Study Techniques:**
⏰ **Pomodoro Technique**: 25 minutes focused study + 5 minute break
📝 **Cornell Notes**: Divide your page into notes, cues, and summary sections
🗣️ **Feynman Technique**: Explain concepts in simple terms as if teaching someone else
🎨 **Visual Learning**: Use mind maps, diagrams, and color coding
👥 **Study Groups**: Teach others and learn from different perspectives`;

  if (hasExam) {
    response += `\n\n**Exam Preparation Strategy:**
📅 **Timeline**: Start preparing at least 2-3 weeks before the exam
📊 **Study Schedule**: Break down topics and allocate time based on difficulty
🔍 **Practice Tests**: Take as many practice exams as possible under timed conditions
📋 **Review Strategy**: Focus 70% on weak areas, 30% on reinforcing strong areas
😴 **Pre-Exam**: Get good sleep, eat well, and arrive early with all materials

**Day Before Exam:**
- Light review only (no new material)
- Prepare everything you need the night before
- Do something relaxing and get to bed early
- Visualize yourself succeeding`;
  }

  if (hasProject) {
    response += `\n\n**Project Success Framework:**
🎯 **Planning Phase**: Break the project into smaller, manageable tasks
📅 **Timeline**: Work backwards from the deadline to create milestones
🔍 **Research**: Gather all necessary resources and information first
✍️ **Execution**: Start with the most challenging parts when your energy is high
🔄 **Review**: Build in time for revision and improvement

**Project Management Tips:**
- Use tools like Trello or Notion to track progress
- Set mini-deadlines for each section
- Get feedback early and often
- Don't aim for perfection in the first draft`;
  }

  if (hasConcentration) {
    response += `\n\n**Focus Enhancement Strategies:**
🎧 **Environment**: Find or create a distraction-free study space
📱 **Digital Detox**: Use apps like Forest or put your phone in another room
🧘 **Mindfulness**: Start with 5 minutes of meditation before studying
⚡ **Energy Management**: Study your most challenging subjects when you're most alert
🍎 **Nutrition**: Eat brain-healthy foods and stay hydrated`;
  }

  response += `\n\nWhat specific study challenge are you facing? Let's create a personalized study plan that works for your schedule and learning style!`;

  return response;
};

const generateRelationshipResponse = (message, context, userContext) => {
  return `Relationships are such an important part of our lives, and navigating them can be both rewarding and challenging. I'm here to help you work through whatever relationship situation you're facing. 💙

**Healthy Relationship Principles:**
🗣️ **Communication**: Express your needs clearly and listen actively
🤝 **Respect**: Honor boundaries and treat others with dignity
💝 **Empathy**: Try to understand others' perspectives and feelings
🌱 **Growth**: Support each other's personal development and goals
⚖️ **Balance**: Maintain your individual identity while being part of a relationship

**Conflict Resolution Strategies:**
1. **Cool Down**: Take time to process emotions before discussing
2. **Use "I" Statements**: Express how you feel without blaming
3. **Listen Actively**: Really hear what the other person is saying
4. **Find Common Ground**: Focus on shared values and goals
5. **Seek Solutions**: Work together to find win-win outcomes

**Self-Care in Relationships:**
- Maintain your own interests and friendships
- Set healthy boundaries and communicate them clearly
- Practice self-compassion and don't lose yourself in others
- Remember that you can only control your own actions and responses

What specific relationship situation would you like to talk through? I'm here to listen and help you find a path forward.`;
};

const generateTimeManagementResponse = (message, context, userContext) => {
  return `Time management is truly a life skill that can transform not just your productivity, but your overall well-being and success! I'm excited to help you develop systems that work for your unique lifestyle and goals. ⏰

**Time Management Fundamentals:**
🎯 **Priority Matrix**: Urgent vs Important - focus on important but not urgent tasks
📅 **Time Blocking**: Schedule specific times for different types of activities
🔄 **Batch Processing**: Group similar tasks together for efficiency
⚡ **Energy Management**: Match your most important tasks to your peak energy times
🚫 **Saying No**: Protect your time by declining non-essential commitments

**Productivity Systems:**
📝 **Getting Things Done (GTD)**: Capture, clarify, organize, reflect, engage
🍅 **Pomodoro Technique**: 25-minute focused work sessions with 5-minute breaks
📊 **Time Tracking**: Use apps like RescueTime to understand where your time actually goes
🎯 **MIT (Most Important Tasks)**: Identify 1-3 most important tasks each day
📱 **Digital Tools**: Use calendars, task managers, and automation to your advantage

**Overcoming Procrastination:**
- Start with the smallest possible step (2-minute rule)
- Use the "Swiss Cheese" method - poke holes in big tasks
- Create accountability through deadlines and check-ins
- Reward yourself for completing tasks
- Understand your procrastination triggers and plan around them

**Weekly Planning Ritual:**
- Sunday: Review the past week and plan the upcoming one
- Identify your top 3 priorities for the week
- Schedule important tasks during your peak energy times
- Build in buffer time for unexpected tasks
- Plan something fun to look forward to

What's your biggest time management challenge right now? Let's create a personalized system that fits your lifestyle!`;
};

const generateFuturePlanningResponse = (message, context, userContext) => {
  return `I love that you're thinking about your future! Having a vision and working toward it is one of the most powerful things you can do for yourself. Your future is created by the choices you make today. 🌟

**Future Planning Framework:**
🎯 **Vision Creation**: Imagine your ideal life in 5-10 years - be specific and vivid
📋 **Goal Setting**: Break your vision into yearly, monthly, and weekly goals
🛤️ **Path Planning**: Identify the steps, skills, and experiences you need
📊 **Progress Tracking**: Regular check-ins to assess and adjust your plan
🔄 **Flexibility**: Stay open to new opportunities and course corrections

**Life Areas to Consider:**
💼 **Career**: What work would fulfill you and align with your values?
🎓 **Education**: What knowledge and skills do you want to develop?
❤️ **Relationships**: What kind of relationships do you want to cultivate?
💰 **Financial**: What financial goals and security do you want to achieve?
🏠 **Lifestyle**: Where do you want to live and how do you want to spend your time?
🌱 **Personal Growth**: What kind of person do you want to become?

**Overcoming Future Anxiety:**
- Focus on what you can control today
- Remember that uncertainty is normal and part of growth
- Build confidence through small, consistent actions
- Develop multiple skills and options (don't put all eggs in one basket)
- Connect with mentors and people living the life you want

**Action Planning:**
1. **30-Day Goals**: What can you accomplish in the next month?
2. **90-Day Milestones**: What significant progress can you make in 3 months?
3. **1-Year Vision**: Where do you want to be a year from now?
4. **Daily Actions**: What one thing can you do today to move forward?

What aspect of your future are you most excited about? And what concerns or uncertainties do you have? Let's work together to create a clear, actionable plan!`;
};

const generateGeneralResponse = (message, context, userContext) => {
  const userName = userContext.name || 'friend';
  const timeOfDay = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening';
  
  return `Hello ${userName}! I'm so glad you're here. Whether you're having a great ${timeOfDay} or facing some challenges, I want you to know that I'm here to support you in whatever way I can. 🤗

**I'm here to help you with:**
🎯 **Career & Professional Growth**: Job search strategies, interview prep, skill development, networking
📚 **Academic Success**: Study techniques, exam preparation, project management, learning strategies
💪 **Personal Development**: Goal setting, habit formation, confidence building, time management
❤️ **Emotional Support**: Stress management, motivation, dealing with setbacks, building resilience
🧠 **Mental Wellness**: Mindfulness, self-care, work-life balance, emotional intelligence

**What makes our conversations special:**
- I remember our previous conversations and your goals
- I adapt my advice to your unique situation and learning style
- I provide practical, actionable strategies you can implement immediately
- I'm available 24/7 whenever you need support or guidance
- I celebrate your wins and help you learn from challenges

**Popular conversation starters:**
💭 "I'm feeling overwhelmed with everything I need to do"
🎯 "I want to work on my career goals but don't know where to start"
📚 "I'm struggling to stay motivated with my studies"
💪 "I want to build better habits and be more productive"
❤️ "I'm dealing with some personal challenges and need support"

What's on your mind today? I'm here to listen, understand, and help you find your way forward. Remember, every conversation we have is a step toward the life you want to create! ✨`;
};

// Extract action items from response
const extractActionItems = (response) => {
  const actionItems = [];
  const lines = response.split('\n');
  
  lines.forEach(line => {
    if (line.includes('try') || line.includes('practice') || line.includes('start') || line.includes('create')) {
      const cleanLine = line.replace(/[•\-\*]/g, '').trim();
      if (cleanLine.length > 10 && cleanLine.length < 100) {
        actionItems.push(cleanLine);
      }
    }
  });
  
  return actionItems.slice(0, 3); // Return top 3 action items
};

/**
 * Generate AI mentor response
 */
export const generateMentorResponse = async ({
  userId,
  sessionId,
  userMessage,
  conversationHistory = []
}) => {
  try {
    // Get user context first
    const user = await User.findById(userId);
    const session = await AIMentorSession.findOne({ sessionId, userId });
    const userContext = await getUserContext(userId);
    const sessionContext = session?.context || {};

    // Try AI response first
    let mentorResponse, suggestions, messageAnalysis;
    
    try {
      const client = getOpenAIClient();
      if (!client) {
        throw new Error('OpenAI API key not configured');
      }

      // Analyze user message
      messageAnalysis = await analyzeMessage(userMessage);

      // Generate system prompt
      const systemPrompt = generateSystemPrompt(userContext, sessionContext);

      // Prepare conversation history
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-10), // Last 10 messages for context
        { role: 'user', content: userMessage }
      ];

      // Generate response
      const response = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 800,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      mentorResponse = response.choices[0].message.content;
      suggestions = await generateFollowUpSuggestions(userMessage, mentorResponse, messageAnalysis);

    } catch (aiError) {
      console.log('AI generation failed, using intelligent fallback:', aiError.message);
      
      // Intelligent fallback based on message content
      const fallbackResult = generateIntelligentFallback(userMessage, conversationHistory, userContext);
      mentorResponse = fallbackResult.response;
      suggestions = fallbackResult.suggestions;
      messageAnalysis = fallbackResult.messageAnalysis;
    }

    // Update or create session
    let mentorSession = session;
    if (!mentorSession) {
      mentorSession = new AIMentorSession({
        userId,
        sessionId,
        systemPrompt: 'Fallback mentor session',
        context: {
          currentGoals: [],
          recentActivities: [],
          emotionalState: 'neutral',
          focusAreas: [],
          learningStyle: 'visual'
        },
        insights: {
          personalityProfile: {
            traits: [],
            strengths: [],
            growthAreas: []
          },
          careerRecommendations: [],
          studyRecommendations: [],
          wellnessRecommendations: [],
          progressTracking: {
            goalsCompleted: 0,
            tasksCompleted: 0,
            streakDays: 0,
            lastActiveDate: new Date()
          }
        }
      });
    }

    // Add messages to session
    mentorSession.addMessage('user', userMessage, 'text', messageAnalysis);
    mentorSession.addMessage('assistant', mentorResponse, 'text', {
      suggestions,
      topics: messageAnalysis.topics
    });

    // Update context based on conversation
    await updateSessionContext(mentorSession, messageAnalysis, userContext);

    await mentorSession.save();

    return {
      response: mentorResponse,
      suggestions,
      messageAnalysis,
      sessionId: mentorSession.sessionId
    };
  } catch (error) {
    console.error('Error generating mentor response:', error);
    throw new Error('Failed to generate mentor response: ' + error.message);
  }
};

/**
 * Get user context from various sources
 */
const getUserContext = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    // Get recent interviews
    const recentInterviews = await Interview.find({ 
      userId, 
      status: 'completed' 
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('type role overallScore createdAt');

    // Get recent test attempts
    const recentTests = await TestAttempt.find({ 
      userId, 
      status: 'completed' 
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('testType score createdAt');

    // Calculate performance trends
    const avgInterviewScore = recentInterviews.length > 0 
      ? recentInterviews.reduce((sum, i) => sum + i.overallScore, 0) / recentInterviews.length 
      : 0;

    const avgTestScore = recentTests.length > 0 
      ? recentTests.reduce((sum, t) => sum + t.score, 0) / recentTests.length 
      : 0;

    return {
      name: user.name,
      email: user.email,
      joinDate: user.createdAt,
      recentInterviews,
      recentTests,
      avgInterviewScore: Math.round(avgInterviewScore),
      avgTestScore: Math.round(avgTestScore),
      totalInterviews: recentInterviews.length,
      totalTests: recentTests.length,
      lastActive: new Date()
    };
  } catch (error) {
    console.error('Error getting user context:', error);
    return {};
  }
};

/**
 * Generate follow-up suggestions
 */
const generateFollowUpSuggestions = async (userMessage, mentorResponse, messageAnalysis) => {
  try {
    const client = getOpenAIClient();
    if (!client) {
      return [];
    }

    const suggestionPrompt = `Based on this conversation, generate 3-4 helpful follow-up suggestions:

User: "${userMessage}"
Mentor: "${mentorResponse}"
Sentiment: ${messageAnalysis.sentiment}
Topics: ${messageAnalysis.topics.join(', ')}

Generate practical, actionable suggestions that would help the user. Return as JSON array:
["suggestion1", "suggestion2", "suggestion3"]`;

    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: suggestionPrompt }],
      temperature: 0.8,
      max_tokens: 200,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.suggestions || [];
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return [
      "Tell me more about your current challenges",
      "What specific goals are you working toward?",
      "How can I help you with your next steps?"
    ];
  }
};

/**
 * Update session context based on conversation
 */
const updateSessionContext = async (session, messageAnalysis, userContext) => {
  try {
    const contextUpdates = {};

    // Update emotional state based on sentiment
    if (messageAnalysis.sentiment === 'positive') {
      contextUpdates.emotionalState = 'motivated';
    } else if (messageAnalysis.sentiment === 'negative') {
      if (messageAnalysis.topics.includes('stress') || messageAnalysis.topics.includes('anxiety')) {
        contextUpdates.emotionalState = 'stressed';
      } else {
        contextUpdates.emotionalState = 'anxious';
      }
    }

    // Update focus areas based on topics
    if (messageAnalysis.topics.length > 0) {
      contextUpdates.focusAreas = [...new Set([
        ...(session.context.focusAreas || []),
        ...messageAnalysis.topics
      ])].slice(0, 5); // Keep top 5 focus areas
    }

    // Update recent activities
    contextUpdates.recentActivities = [
      `Discussed: ${messageAnalysis.topics.join(', ')}`,
      ...(session.context.recentActivities || [])
    ].slice(0, 3); // Keep last 3 activities

    session.updateContext(contextUpdates);

    // Update insights
    const currentInsights = session.insights || {};
    const currentProgressTracking = currentInsights.progressTracking || {};
    
    const insightUpdates = {
      progressTracking: {
        goalsCompleted: currentProgressTracking.goalsCompleted || 0,
        tasksCompleted: currentProgressTracking.tasksCompleted || 0,
        streakDays: currentProgressTracking.streakDays || 0,
        lastActiveDate: new Date()
      }
    };

    session.updateInsights(insightUpdates);
  } catch (error) {
    console.error('Error updating session context:', error);
  }
};

/**
 * Generate daily motivation and tasks
 */
export const generateDailyMotivation = async (userId) => {
  try {
    const client = getOpenAIClient();
    if (!client) {
      throw new Error('OpenAI API key not configured');
    }

    const userContext = await getUserContext(userId);
    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const motivationPrompt = `Generate a personalized daily motivation message and 3 actionable tasks for this student:

Date: ${today}
User Context: ${JSON.stringify(userContext, null, 2)}

Create a JSON response with:
{
  "motivation": "Inspiring and personalized message (2-3 sentences)",
  "tasks": [
    {
      "title": "Task title",
      "description": "Brief description",
      "category": "study|career|wellness|skill",
      "estimatedTime": "15 minutes",
      "priority": "high|medium|low"
    }
  ],
  "tip": "One practical tip for today",
  "affirmation": "Positive affirmation"
}`;

    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: motivationPrompt }],
      temperature: 0.8,
      max_tokens: 600,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error generating daily motivation:', error);
    return {
      motivation: "Every step forward is progress, no matter how small. You're building the foundation for your future success!",
      tasks: [
        {
          title: "Review your goals",
          description: "Take 10 minutes to review and adjust your current goals",
          category: "career",
          estimatedTime: "10 minutes",
          priority: "medium"
        }
      ],
      tip: "Break large tasks into smaller, manageable chunks to avoid overwhelm.",
      affirmation: "I am capable of achieving my goals through consistent effort and learning."
    };
  }
};

/**
 * Get user's mentor sessions
 */
export const getUserSessions = async (userId, limit = 10) => {
  try {
    const sessions = await AIMentorSession.find({ userId })
      .sort({ lastMessageAt: -1 })
      .limit(limit)
      .select('sessionId title lastMessageAt totalMessages context.emotionalState isActive');

    return sessions;
  } catch (error) {
    console.error('Error getting user sessions:', error);
    return [];
  }
};

/**
 * Get specific session with messages
 */
export const getSession = async (userId, sessionId) => {
  try {
    const session = await AIMentorSession.findOne({ userId, sessionId });
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

/**
 * Generate wellness check-in
 */
export const generateWellnessCheckIn = async (userId) => {
  try {
    const client = getOpenAIClient();
    if (!client) {
      throw new Error('OpenAI API key not configured');
    }

    const userContext = await getUserContext(userId);
    const recentSessions = await AIMentorSession.find({ userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('context.emotionalState messages');

    const checkInPrompt = `Generate a personalized wellness check-in for this student:

User Context: ${JSON.stringify(userContext, null, 2)}
Recent Emotional States: ${recentSessions.map(s => s.context.emotionalState).join(', ')}

Create a JSON response with:
{
  "checkIn": "Caring check-in message asking about their well-being",
  "questions": [
    "How are you feeling about your progress this week?",
    "What's been your biggest challenge lately?",
    "What would help you feel more confident?"
  ],
  "resources": [
    {
      "title": "Resource title",
      "description": "Brief description",
      "url": "https://example.com",
      "type": "article|video|exercise"
    }
  ]
}`;

    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: checkInPrompt }],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error generating wellness check-in:', error);
    return {
      checkIn: "How are you doing today? I'm here to support you in any way I can.",
      questions: [
        "How are you feeling about your progress?",
        "What's been challenging for you lately?",
        "What would make you feel more confident?"
      ],
      resources: []
    };
  }
};