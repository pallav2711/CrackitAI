import { v4 as uuidv4 } from 'uuid';
import AIMentorSession from '../models/AIMentorSession.js';
import {
  generateMentorResponse,
  generateDailyMotivation,
  getUserSessions,
  getSession,
  generateWellnessCheckIn
} from '../services/aiMentorService.js';

/**
 * Start a new chat session or continue existing one
 */
export const startChatSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.body;

    let session;
    
    if (sessionId) {
      // Get existing session
      session = await getSession(userId, sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
    } else {
      // Create new session
      const newSessionId = uuidv4();
      session = new AIMentorSession({
        userId,
        sessionId: newSessionId,
        context: {
          emotionalState: 'neutral',
          currentGoals: [],
          recentActivities: [],
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

      // Add welcome message
      session.addMessage('assistant', 
        "Hello! I'm Alex, your AI Career Mentor. I'm here to support you with career guidance, study planning, emotional support, and personal development. How are you feeling today, and what would you like to work on?",
        'text',
        { messageType: 'welcome' }
      );

      await session.save();
    }

    res.json({
      sessionId: session.sessionId,
      title: session.title,
      messages: session.messages,
      context: session.context,
      insights: session.insights
    });
  } catch (error) {
    console.error('Error starting chat session:', error);
    res.status(500).json({ 
      error: 'Failed to start chat session',
      message: error.message 
    });
  }
};

/**
 * Send message to AI mentor
 */
export const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get session for conversation history
    const session = await getSession(userId, sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Prepare conversation history
    const conversationHistory = session.getRecentMessages(10).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Generate AI response
    const mentorResponse = await generateMentorResponse({
      userId,
      sessionId,
      userMessage: message.trim(),
      conversationHistory
    }).catch(error => {
      console.error('AI response generation failed:', error);
      // Fallback response when AI is not available
      return {
        response: "I understand you're reaching out, and I want to help! I'm currently experiencing some technical difficulties with my AI processing, but I'm still here to support you. Could you tell me more about what's on your mind? In the meantime, remember that every challenge is an opportunity to grow stronger. 💪",
        suggestions: [
          "Tell me about your current goals",
          "What's been challenging for you lately?",
          "How can I support you today?",
          "What would help you feel more confident?"
        ],
        messageAnalysis: {
          sentiment: 'neutral',
          confidence: 0.5,
          topics: ['support', 'conversation'],
          actionItems: []
        }
      };
    });

    // Get updated session
    const updatedSession = await getSession(userId, sessionId);

    res.json({
      response: mentorResponse.response,
      suggestions: mentorResponse.suggestions,
      messageAnalysis: mentorResponse.messageAnalysis,
      session: {
        sessionId: updatedSession.sessionId,
        title: updatedSession.title,
        messages: updatedSession.messages.slice(-20), // Last 20 messages
        context: updatedSession.context,
        insights: updatedSession.insights
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ 
      error: 'Failed to send message',
      message: error.message 
    });
  }
};

/**
 * Get user's chat sessions
 */
export const getChatSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const sessions = await getUserSessions(userId, parseInt(limit));

    res.json({ sessions });
  } catch (error) {
    console.error('Error getting chat sessions:', error);
    res.status(500).json({ 
      error: 'Failed to get chat sessions',
      message: error.message 
    });
  }
};

/**
 * Get specific chat session
 */
export const getChatSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;

    const session = await getSession(userId, sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      sessionId: session.sessionId,
      title: session.title,
      messages: session.messages,
      context: session.context,
      insights: session.insights,
      createdAt: session.createdAt,
      lastMessageAt: session.lastMessageAt,
      totalMessages: session.totalMessages
    });
  } catch (error) {
    console.error('Error getting chat session:', error);
    res.status(500).json({ 
      error: 'Failed to get chat session',
      message: error.message 
    });
  }
};

/**
 * Delete chat session
 */
export const deleteChatSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;

    const session = await AIMentorSession.findOneAndDelete({ 
      userId, 
      sessionId 
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ 
      success: true, 
      message: 'Session deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting chat session:', error);
    res.status(500).json({ 
      error: 'Failed to delete chat session',
      message: error.message 
    });
  }
};

/**
 * Get daily motivation and tasks
 */
export const getDailyMotivation = async (req, res) => {
  try {
    const userId = req.user.id;

    const dailyContent = await generateDailyMotivation(userId).catch(error => {
      console.error('Daily motivation generation failed:', error);
      // Fallback daily content
      return {
        motivation: "Every day is a new opportunity to grow and move closer to your goals. You have the strength and determination to overcome any challenge that comes your way!",
        tasks: [
          {
            title: "Set your daily intention",
            description: "Take 5 minutes to reflect on what you want to accomplish today",
            category: "wellness",
            estimatedTime: "5 minutes",
            priority: "high"
          },
          {
            title: "Review your progress",
            description: "Look back at what you've achieved recently and celebrate your wins",
            category: "career",
            estimatedTime: "10 minutes",
            priority: "medium"
          },
          {
            title: "Learn something new",
            description: "Spend time learning a new skill or concept related to your goals",
            category: "skill",
            estimatedTime: "30 minutes",
            priority: "medium"
          }
        ],
        tip: "Break large goals into smaller, manageable steps. Progress is progress, no matter how small!",
        affirmation: "I am capable of achieving my goals through consistent effort and learning."
      };
    });

    res.json(dailyContent);
  } catch (error) {
    console.error('Error getting daily motivation:', error);
    res.status(500).json({ 
      error: 'Failed to get daily motivation',
      message: error.message 
    });
  }
};

/**
 * Get wellness check-in
 */
export const getWellnessCheckIn = async (req, res) => {
  try {
    const userId = req.user.id;

    const wellnessContent = await generateWellnessCheckIn(userId);

    res.json(wellnessContent);
  } catch (error) {
    console.error('Error getting wellness check-in:', error);
    res.status(500).json({ 
      error: 'Failed to get wellness check-in',
      message: error.message 
    });
  }
};

/**
 * Update session context (emotional state, goals, etc.)
 */
export const updateSessionContext = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;
    const { context } = req.body;

    const session = await AIMentorSession.findOne({ userId, sessionId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.updateContext(context);
    await session.save();

    res.json({ 
      success: true, 
      context: session.context 
    });
  } catch (error) {
    console.error('Error updating session context:', error);
    res.status(500).json({ 
      error: 'Failed to update session context',
      message: error.message 
    });
  }
};

/**
 * Get mentor analytics and insights
 */
export const getMentorAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all user sessions
    const sessions = await AIMentorSession.find({ userId });

    // Calculate analytics
    const totalSessions = sessions.length;
    const totalMessages = sessions.reduce((sum, s) => sum + s.totalMessages, 0);
    const avgMessagesPerSession = totalSessions > 0 ? Math.round(totalMessages / totalSessions) : 0;

    // Get emotional state trends
    const emotionalStates = sessions.map(s => s.context.emotionalState).filter(Boolean);
    const emotionalTrends = emotionalStates.reduce((acc, state) => {
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {});

    // Get most discussed topics
    const allTopics = sessions.flatMap(s => 
      s.messages.flatMap(m => m.metadata?.topics || [])
    );
    const topicCounts = allTopics.reduce((acc, topic) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {});

    const topTopics = Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([topic, count]) => ({ topic, count }));

    // Get recent activity
    const recentSessions = sessions
      .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
      .slice(0, 5)
      .map(s => ({
        sessionId: s.sessionId,
        title: s.title,
        lastMessageAt: s.lastMessageAt,
        emotionalState: s.context.emotionalState,
        messageCount: s.totalMessages
      }));

    res.json({
      totalSessions,
      totalMessages,
      avgMessagesPerSession,
      emotionalTrends,
      topTopics,
      recentSessions,
      lastActiveDate: sessions.length > 0 ? 
        Math.max(...sessions.map(s => new Date(s.lastMessageAt))) : null
    });
  } catch (error) {
    console.error('Error getting mentor analytics:', error);
    res.status(500).json({ 
      error: 'Failed to get mentor analytics',
      message: error.message 
    });
  }
};