import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Send, MessageSquare, Heart, Target, Calendar, 
  Lightbulb, TrendingUp, Smile, Frown, Meh, Star,
  Clock, CheckCircle, AlertCircle, Sparkles, Brain,
  Coffee, BookOpen, Users, Award, Zap, Plus, Trash2,
  BarChart3, Settings, RefreshCw, Mic, MicOff
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { aiMentorService } from '../services/aiMentorService';

const AIMentor = () => {
  const [currentView, setCurrentView] = useState('chat'); // chat, dashboard, sessions
  const [currentSession, setCurrentSession] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [dailyMotivation, setDailyMotivation] = useState(null);
  const [wellnessCheckIn, setWellnessCheckIn] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [emotionalState, setEmotionalState] = useState('neutral');
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadInitialData = async () => {
    try {
      const [sessionsData, motivationData, analyticsData] = await Promise.all([
        aiMentorService.getSessions().catch(() => ({ sessions: [] })),
        aiMentorService.getDailyMotivation().catch(() => null),
        aiMentorService.getAnalytics().catch(() => null)
      ]);
      
      setSessions(sessionsData.sessions || []);
      setDailyMotivation(motivationData);
      setAnalytics(analyticsData);
      
      // Start new session if no recent sessions
      if (sessionsData.sessions.length === 0) {
        await startNewSession();
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const startNewSession = async () => {
    try {
      setLoading(true);
      const sessionData = await aiMentorService.startSession();
      setCurrentSession(sessionData);
      setMessages(sessionData.messages || []);
      setCurrentView('chat');
      
      // Refresh sessions list
      const sessionsData = await aiMentorService.getSessions();
      setSessions(sessionsData.sessions || []);
    } catch (error) {
      console.error('Failed to start new session:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSession = async (sessionId) => {
    try {
      setLoading(true);
      const sessionData = await aiMentorService.getSession(sessionId);
      setCurrentSession(sessionData);
      setMessages(sessionData.messages || []);
      setCurrentView('chat');
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !currentSession) return;
    
    const userMessage = message.trim();
    setMessage('');
    setTyping(true);
    
    // Add user message immediately
    const newMessages = [...messages, { 
      role: 'user', 
      content: userMessage,
      timestamp: new Date()
    }];
    setMessages(newMessages);
    
    try {
      const response = await aiMentorService.sendMessage(currentSession.sessionId, userMessage);
      
      // Add AI response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        metadata: response.messageAnalysis
      }]);
      
      setSuggestions(response.suggestions || []);
      
      // Update session data
      if (response.session) {
        setCurrentSession(response.session);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble responding right now. Please try again in a moment.',
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion);
    inputRef.current?.focus();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getEmotionalStateIcon = (state) => {
    switch (state) {
      case 'motivated': case 'excited': case 'confident': return <Smile className="w-5 h-5 text-green-500" />;
      case 'stressed': case 'anxious': case 'overwhelmed': return <Frown className="w-5 h-5 text-red-500" />;
      default: return <Meh className="w-5 h-5 text-nb-black/45" />;
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (currentView === 'dashboard') {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2 bg-nb-black text-white bg-clip-text text-transparent">
                  AI Mentor Dashboard
                </h1>
                <p className="text-nb-black/55">Your personal AI companion for career and emotional support</p>
              </div>
              <button
                onClick={() => setCurrentView('chat')}
                className="btn btn-primary flex items-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                Start Chatting
              </button>
            </div>
          </motion.div>

          {/* Daily Motivation */}
          {dailyMotivation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="nb-card-compat mb-8 bg-nb-black text-white border-nb-blue/30"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-nb-black text-white flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-nb-blue mb-2">Daily Motivation</h3>
                  <p className="text-nb-blue leading-relaxed mb-4">{dailyMotivation.motivation}</p>
                  
                  {dailyMotivation.affirmation && (
                    <div className="bg-white/50 rounded-lg p-3 mb-4">
                      <p className="text-nb-blue font-medium italic">"{dailyMotivation.affirmation}"</p>
                    </div>
                  )}
                  
                  {dailyMotivation.tip && (
                    <div className="flex items-start gap-2 text-nb-blue">
                      <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{dailyMotivation.tip}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Daily Tasks */}
          {dailyMotivation?.tasks && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="nb-card-compat mb-8"
            >
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-6 h-6 text-nb-blue" />
                <h3 className="text-xl font-bold text-nb-black">Today's Tasks</h3>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dailyMotivation.tasks.map((task, index) => (
                  <div key={index} className="bg-[#F5F1E8] rounded-lg p-4 hover:bg-[#F5F1E8] transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-nb-black">{task.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        task.priority === 'high' ? 'bg-nb-red/10 text-nb-red' :
                        task.priority === 'medium' ? 'bg-nb-yellow/20 text-nb-black' :
                        'bg-nb-green/10 text-nb-green'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-nb-black/55 text-sm mb-3">{task.description}</p>
                    <div className="flex items-center justify-between text-xs text-nb-black/45">
                      <span className="capitalize">{task.category}</span>
                      <span>{task.estimatedTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Analytics */}
          {analytics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <div className="nb-card-compat text-center">
                <div className="w-12 h-12 rounded-full bg-nb-blue/10 flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6 text-nb-blue" />
                </div>
                <div className="text-2xl font-bold text-nb-black">{analytics.totalSessions}</div>
                <div className="text-sm text-nb-black/55">Total Sessions</div>
              </div>
              
              <div className="nb-card-compat text-center">
                <div className="w-12 h-12 rounded-full bg-nb-green/10 flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-nb-green" />
                </div>
                <div className="text-2xl font-bold text-nb-black">{analytics.totalMessages}</div>
                <div className="text-sm text-nb-black/55">Messages Exchanged</div>
              </div>
              
              <div className="nb-card-compat text-center">
                <div className="w-12 h-12 rounded-full bg-nb-blue flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-6 h-6 text-nb-blue" />
                </div>
                <div className="text-2xl font-bold text-nb-black">{analytics.avgMessagesPerSession}</div>
                <div className="text-sm text-nb-black/55">Avg per Session</div>
              </div>
              
              <div className="nb-card-compat text-center">
                <div className="w-12 h-12 rounded-full bg-nb-yellow flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-nb-black" />
                </div>
                <div className="text-2xl font-bold text-nb-black">
                  {Object.keys(analytics.emotionalTrends || {}).length}
                </div>
                <div className="text-sm text-nb-black/55">Emotional States</div>
              </div>
            </motion.div>
          )}

          {/* Recent Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="nb-card-compat"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-nb-black">Recent Conversations</h3>
              <button
                onClick={() => setCurrentView('sessions')}
                className="text-nb-black hover:text-nb-black font-semibold text-sm"
              >
                View All →
              </button>
            </div>
            
            <div className="space-y-3">
              {sessions.slice(0, 5).map((session, index) => (
                <div
                  key={session.sessionId}
                  onClick={() => loadSession(session.sessionId)}
                  className="flex items-center justify-between p-4 rounded-lg border border-nb-black/15 hover:border-nb-black hover:bg-[#F5F1E8] cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    {getEmotionalStateIcon(session.emotionalState)}
                    <div>
                      <h4 className="font-semibold text-nb-black">{session.title}</h4>
                      <p className="text-sm text-nb-black/55">
                        {session.messageCount} messages • {formatTime(session.lastMessageAt)}
                      </p>
                    </div>
                  </div>
                  <MessageSquare className="w-5 h-5 text-nb-black/35" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  if (currentView === 'sessions') {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-nb-black">Chat Sessions</h1>
              <p className="text-nb-black/55">Manage your conversations with Alex</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="btn btn-secondary"
              >
                Dashboard
              </button>
              <button
                onClick={startNewSession}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Chat
              </button>
            </div>
          </div>

          {/* Sessions List */}
          <div className="space-y-4">
            {sessions.map((session) => (
              <motion.div
                key={session.sessionId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="nb-card-compat hover:shadow-lg transition-all cursor-pointer"
                onClick={() => loadSession(session.sessionId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-nb-black text-white flex items-center justify-center">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-nb-black">{session.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-nb-black/55">
                        <span>{session.messageCount} messages</span>
                        <span>•</span>
                        <span>{new Date(session.lastMessageAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          {getEmotionalStateIcon(session.emotionalState)}
                          <span className="capitalize">{session.emotionalState}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Delete session functionality
                      }}
                      className="p-2 text-nb-black/35 hover:text-nb-red transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <MessageSquare className="w-5 h-5 text-nb-black/35" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Chat View
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-nb-black/15 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-nb-black/15">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-nb-black text-white flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-nb-black">Alex</h2>
                <p className="text-sm text-nb-black/55">Your AI Mentor</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="btn btn-secondary text-sm flex-1"
              >
                Dashboard
              </button>
              <button
                onClick={startNewSession}
                className="btn btn-primary text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                New
              </button>
            </div>
          </div>

          {/* Sessions */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="font-semibold text-nb-black mb-3">Recent Chats</h3>
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.sessionId}
                  onClick={() => loadSession(session.sessionId)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    currentSession?.sessionId === session.sessionId
                      ? 'bg-nb-black border border-nb-black'
                      : 'hover:bg-[#F5F1E8]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getEmotionalStateIcon(session.emotionalState)}
                    <h4 className="font-medium text-nb-black text-sm truncate">
                      {session.title}
                    </h4>
                  </div>
                  <p className="text-xs text-nb-black/55">
                    {session.messageCount} messages
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {currentSession ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-nb-black/15 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-bold text-nb-black">{currentSession.title}</h1>
                    <p className="text-sm text-nb-black/55">
                      {messages.length} messages • Started {new Date(currentSession.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentSession.context?.emotionalState && (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F1E8]">
                        {getEmotionalStateIcon(currentSession.context.emotionalState)}
                        <span className="text-sm capitalize">{currentSession.context.emotionalState}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 bg-[#F5F1E8]">
                <div className="space-y-6">
                  {messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                        {msg.role === 'assistant' && (
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-nb-black text-white flex items-center justify-center">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold text-nb-black">Alex</span>
                            <span className="text-xs text-nb-black/45">{formatTime(msg.timestamp)}</span>
                          </div>
                        )}
                        
                        <div className={`p-4 rounded-2xl ${
                          msg.role === 'user'
                            ? 'bg-nb-black text-white ml-12'
                            : msg.isError
                            ? 'bg-red-50 text-nb-red border border-nb-red/30'
                            : 'bg-white text-nb-black shadow-sm border border-nb-black/15'
                        }`}>
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          
                          {msg.role === 'user' && (
                            <div className="text-right mt-2">
                              <span className="text-xs opacity-75">{formatTime(msg.timestamp)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {typing && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-nb-black text-white flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-nb-black">Alex</span>
                      </div>
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-nb-black/15 ml-12">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="p-4 bg-white border-t border-nb-black/15">
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-2 bg-[#F5F1E8] hover:bg-gray-200 text-nb-black/75 rounded-full text-sm transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-6 bg-white border-t border-nb-black/15">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Share what's on your mind... I'm here to help!"
                      className="nb-input w-full pr-12"
                      disabled={loading || typing}
                    />
                    <button
                      onClick={() => setIsListening(!isListening)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${
                        isListening ? 'text-nb-red bg-nb-red/10 border border-nb-red/30' : 'text-nb-black/35 hover:text-nb-black/55'
                      }`}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!message.trim() || loading || typing}
                    className="btn btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-3 text-xs text-nb-black/45">
                  <span>Press Enter to send • Click mic to use voice input</span>
                  <span>Powered by AI • Always here to help</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-[#F5F1E8]">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-nb-black text-white flex items-center justify-center mx-auto mb-6">
                  <Bot className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-nb-black mb-2">Welcome to AI Mentor</h2>
                <p className="text-nb-black/55 mb-6 max-w-md">
                  Start a conversation with Alex, your personal AI mentor for career guidance and emotional support.
                </p>
                <button
                  onClick={startNewSession}
                  className="btn btn-primary flex items-center gap-2 mx-auto"
                >
                  <MessageSquare className="w-5 h-5" />
                  Start New Conversation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIMentor;
