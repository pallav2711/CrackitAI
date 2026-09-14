import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock, Award, TrendingUp, Calendar, Eye, Filter,
  BarChart3, Target, CheckCircle, XCircle
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { testService } from '../services/testService';

const TestHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [historyData, statsData] = await Promise.all([
        testService.getHistory(),
        testService.getStats()
      ]);
      setHistory(historyData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 'excellent': return 'text-nb-green bg-nb-green/10 border border-nb-green/30';
      case 'good': return 'text-nb-blue bg-nb-blue/10 border border-nb-blue/30';
      case 'average': return 'text-nb-black bg-nb-yellow border border-nb-black/20';
      default: return 'text-nb-red bg-nb-red/10 border border-nb-red/30';
    }
  };

  const filteredHistory = filterCategory === 'all'
    ? history
    : history.filter(h => h.testId?.category === filterCategory);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-3 border-nb-black border-t-nb-yellow rounded-full animate-spin border-nb-black"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            Test History
          </h1>
          <p className="text-nb-black/55 text-lg">Track your progress and review past attempts</p>
        </motion.div>

        {/* Stats Overview */}
        {stats && stats.totalTests > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="nb-card-compat"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-nb-black/55 text-sm mb-1">Total Tests</p>
                  <p className="text-3xl font-bold text-nb-black">{stats.totalTests}</p>
                </div>
                <div className="w-10 h-10 bg-nb-black border-2 border-nb-black flex items-center justify-center flex-shrink-0" style={{ borderRadius: "5px" }}>
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="nb-card-compat"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-nb-black/55 text-sm mb-1">Average Score</p>
                  <p className="text-3xl font-bold text-nb-black">{stats.averageScore}%</p>
                </div>
                <div className="w-10 h-10 bg-nb-black border-2 border-nb-black flex items-center justify-center flex-shrink-0" style={{ borderRadius: "5px" }}>
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="nb-card-compat"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-nb-black/55 text-sm mb-1">Highest Score</p>
                  <p className="text-3xl font-bold text-nb-black">{stats.highestScore}%</p>
                </div>
                <div className="w-10 h-10 bg-nb-black border-2 border-nb-black flex items-center justify-center flex-shrink-0" style={{ borderRadius: "5px" }}>
                  <Award className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="nb-card-compat"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-nb-black/55 text-sm mb-1">Lowest Score</p>
                  <p className="text-3xl font-bold text-nb-black">{stats.lowestScore}%</p>
                </div>
                <div className="w-10 h-10 bg-nb-black border-2 border-nb-black flex items-center justify-center flex-shrink-0" style={{ borderRadius: "5px" }}>
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Category Performance */}
        {stats && Object.keys(stats.testsByCategory).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="nb-card-compat mb-8"
          >
            <h3 className="text-xl font-bold mb-6 text-nb-black">Performance by Category</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(stats.testsByCategory).map(([category, data], index) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="p-4 rounded-xl bg-nb-black text-white border border-nb-black/15"
                >
                  <p className="text-sm font-semibold text-nb-black/55 capitalize mb-2">{category}</p>
                  <p className="text-2xl font-bold text-nb-black mb-1">{data.averageScore}%</p>
                  <p className="text-xs text-nb-black/45">{data.count} tests taken</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="nb-card-compat mb-6"
        >
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-nb-black/55" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="nb-input flex-1"
            >
              <option value="all">All Categories</option>
              <option value="aptitude">Aptitude</option>
              <option value="technical">Technical</option>
              <option value="logical">Logical</option>
              <option value="verbal">Verbal</option>
              <option value="coding">Coding</option>
            </select>
          </div>
        </motion.div>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <div className="nb-card-compat text-center py-16">
            <BarChart3 className="w-16 h-16 text-nb-black/35 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-nb-black mb-2">No test history</h3>
            <p className="text-nb-black/55 mb-6">Start taking tests to see your history here</p>
            <button
              onClick={() => navigate('/mock-tests')}
              className="btn btn-primary"
            >
              Browse Tests
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((attempt, index) => (
              <motion.div
                key={attempt._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                className="nb-card-compat transition-all cursor-pointer group"
                onClick={() => navigate(`/test-results/${attempt._id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-nb-black group-hover:text-nb-black transition-colors">
                        {attempt.testId?.title || 'Test'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize bg-nb-black`}>
                        {attempt.rank}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-nb-black/55">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(attempt.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{Math.floor(attempt.duration / 60)} mins</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-nb-green" />
                        <span>{attempt.correctAnswers} correct</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <XCircle className="w-4 h-4 text-nb-red" />
                        <span>{attempt.incorrectAnswers} incorrect</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-3xl font-bold text-nb-black">{attempt.percentage}%</p>
                      <p className="text-sm text-nb-black/55">Score</p>
                    </div>
                    <button className="btn btn-secondary flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TestHistory;
