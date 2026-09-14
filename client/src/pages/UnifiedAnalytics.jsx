import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Award, Target, Calendar, BarChart3, PieChart, 
  Activity, Download, Filter, FileText, Users, Clock, Star, Brain,
  CheckCircle, AlertCircle, ArrowUp, ArrowDown, Eye, Share2
} from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, Title, Tooltip, Legend, Filler, RadialLinearScale
} from 'chart.js';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import PerformanceReportPDF from '../components/reports/PDFReport';
import analyticsService from '../services/analyticsService';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, Title, Tooltip, Legend, Filler, RadialLinearScale
);

const UnifiedAnalytics = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsRes, reportRes] = await Promise.all([
        analyticsService.getDashboardAnalytics(period),
        analyticsService.getPerformanceReport(dateRange.startDate, dateRange.endDate)
      ]);
      setAnalytics(analyticsRes.data);
      setReportData(reportRes.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setReportLoading(true);
      const response = await analyticsService.getPerformanceReport(
        dateRange.startDate,
        dateRange.endDate
      );
      setReportData(response.data);
      toast.success('Report generated successfully!');
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report');
    } finally {
      setReportLoading(false);
    }
  };

  const quickDateRanges = [
    { label: 'Last 7 Days', days: 7 },
    { label: 'Last 30 Days', days: 30 },
    { label: 'Last 90 Days', days: 90 },
    { label: 'This Year', days: 365 }
  ];

  const setQuickRange = (days) => {
    const end = new Date();
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    setDateRange({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-nb-black border-t-nb-yellow rounded-full animate-spin border-nb-black mx-auto mb-4"></div>
            <p className="text-nb-black/55">Loading comprehensive analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'insights', label: 'Insights', icon: Brain },
    { id: 'reports', label: 'Reports', icon: FileText }
  ];

  // Chart configurations
  const performanceChartData = analytics?.weeklyProgress ? {
    labels: analytics.weeklyProgress.map(d => d.day),
    datasets: [
      {
        label: 'Performance Score',
        data: analytics.weeklyProgress.map(d => d.value),
        fill: true,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderColor: 'rgb(99, 102, 241)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  } : null;

  const skillRadarData = analytics?.skillBreakdown ? {
    labels: Object.keys(analytics.skillBreakdown),
    datasets: [
      {
        label: 'Skill Level',
        data: Object.values(analytics.skillBreakdown),
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: 'rgb(34, 197, 94)',
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(34, 197, 94)'
      }
    ]
  } : null;

  const categoryPerformanceData = analytics?.categoryPerformance ? {
    labels: Object.keys(analytics.categoryPerformance),
    datasets: [
      {
        data: Object.values(analytics.categoryPerformance),
        backgroundColor: [
          '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'
        ],
        borderWidth: 0
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    }
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-nb-black flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-nb-black" />
              Analytics & Reports
            </h1>
            <p className="text-nb-black/55 mt-1">Comprehensive performance analysis and reporting</p>
          </div>
          <div className="flex gap-3">
            <div className="flex gap-2">
              {['week', 'month', 'quarter', 'year'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    period === p
                      ? 'bg-nb-black text-white shadow-lg'
                      : 'bg-[#F5F1E8] text-nb-black/55 hover:bg-gray-200'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-nb-black/15">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-nb-black text-nb-black'
                      : 'border-transparent text-nb-black/45 hover:text-nb-black/75 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {/* Overview Tab */}
          {activeTab === 'overview' && analytics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    label: 'Overall Score',
                    value: analytics.stats?.overallScore || 0,
                    icon: Target,
                    gradient: 'bg-nb-black',
                    trend: analytics.trends?.overall
                  },
                  {
                    label: 'Tests Completed',
                    value: analytics.stats?.tests || 0,
                    icon: CheckCircle,
                    gradient: 'bg-nb-black',
                    trend: analytics.trends?.tests
                  },
                  {
                    label: 'Interviews',
                    value: analytics.stats?.interviews || 0,
                    icon: Users,
                    gradient: 'bg-nb-black',
                    trend: analytics.trends?.interviews
                  },
                  {
                    label: 'Study Streak',
                    value: analytics.stats?.streak || 0,
                    icon: Calendar,
                    gradient: 'bg-nb-black',
                    trend: analytics.trends?.streak,
                    suffix: ' days'
                  }
                ].map((stat, index) => {
                  const Icon = stat.icon;
                  const TrendIcon = stat.trend?.direction === 'up' ? ArrowUp : ArrowDown;
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="nb-card-compat transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-nb-black flex items-center justify-center text-white shadow-lg`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        {stat.trend && (
                          <div className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${
                            stat.trend.direction === 'up' 
                              ? 'text-nb-green bg-nb-green/10' 
                              : 'text-nb-red bg-nb-red/10'
                          }`}>
                            <TrendIcon className="w-3 h-3" />
                            {stat.trend.value}%
                          </div>
                        )}
                      </div>
                      <p className="text-nb-black/55 text-sm mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-nb-black">
                        {stat.value}{stat.suffix || (stat.label.includes('Score') ? '%' : '')}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Performance Chart */}
              {performanceChartData && (
                <div className="nb-card-compat">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-nb-black">Performance Trend</h3>
                    <div className="flex items-center gap-2 text-sm text-nb-black/45">
                      <Activity className="w-4 h-4" />
                      Last {period}
                    </div>
                  </div>
                  <div className="h-80">
                    <Line data={performanceChartData} options={chartOptions} />
                  </div>
                </div>
              )}

              {/* Quick Stats Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Category Performance */}
                {categoryPerformanceData && (
                  <div className="nb-card-compat">
                    <h3 className="text-lg font-bold text-nb-black mb-4">Category Performance</h3>
                    <div className="h-48">
                      <Doughnut 
                        data={categoryPerformanceData} 
                        options={{ 
                          responsive: true, 
                          maintainAspectRatio: false,
                          plugins: { legend: { position: 'bottom' } }
                        }} 
                      />
                    </div>
                  </div>
                )}

                {/* Recent Activity */}
                <div className="nb-card-compat">
                  <h3 className="text-lg font-bold text-nb-black mb-4">Recent Activity</h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {analytics.recentActivity?.length > 0 ? (
                      analytics.recentActivity.map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-[#F5F1E8] hover:bg-[#F5F1E8] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-nb-black rounded-full flex items-center justify-center">
                              <Activity className="w-4 h-4 text-nb-black" />
                            </div>
                            <div>
                              <p className="font-medium text-nb-black text-sm capitalize">{activity.type}</p>
                              <p className="text-xs text-nb-black/45">
                                {new Date(activity.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-nb-black font-semibold text-sm">+{activity.points}</div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-nb-black/45 py-8 text-sm">No recent activity</p>
                    )}
                  </div>
                </div>

                {/* Achievements */}
                <div className="nb-card-compat">
                  <h3 className="text-lg font-bold text-nb-black mb-4">Latest Achievements</h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {analytics.achievements?.length > 0 ? (
                      analytics.achievements.slice(0, 3).map((achievement, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 rounded-lg bg-nb-black text-white border border-nb-black/20"
                        >
                          <Award className="w-6 h-6 text-nb-black flex-shrink-0" />
                          <div>
                            <p className="font-medium text-nb-black text-sm">{achievement.title}</p>
                            <p className="text-xs text-nb-black/55">{achievement.description}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-nb-black/45 py-8 text-sm">No achievements yet</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && analytics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Skill Radar Chart */}
              {skillRadarData && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="nb-card-compat">
                    <h3 className="text-xl font-bold text-nb-black mb-6">Skill Assessment</h3>
                    <div className="h-80">
                      <Radar data={skillRadarData} options={radarOptions} />
                    </div>
                  </div>

                  {/* Performance Breakdown */}
                  <div className="nb-card-compat">
                    <h3 className="text-xl font-bold text-nb-black mb-6">Performance Breakdown</h3>
                    <div className="space-y-4">
                      {Object.entries(analytics.skillBreakdown || {}).map(([skill, score]) => (
                        <div key={skill} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-nb-black/75 capitalize">{skill}</span>
                            <span className="text-sm font-bold text-nb-black">{score}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-nb-black text-white h-2 rounded-full transition-all duration-500"
                              style={{ width: `${score}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Performance Metrics */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="nb-card-compat bg-nb-black text-white border-2 border-nb-blue/30">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="w-8 h-8 text-nb-blue" />
                    <h3 className="text-lg font-bold text-nb-black">Accuracy</h3>
                  </div>
                  <p className="text-3xl font-bold text-nb-black mb-2">{analytics.performance?.accuracy || 0}%</p>
                  <p className="text-sm text-nb-black/55">Average test accuracy</p>
                </div>

                <div className="nb-card-compat bg-nb-black text-white border-2 border-nb-green/30">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-8 h-8 text-nb-green" />
                    <h3 className="text-lg font-bold text-nb-black">Speed</h3>
                  </div>
                  <p className="text-3xl font-bold text-nb-black mb-2">{analytics.performance?.avgTime || 0}s</p>
                  <p className="text-sm text-nb-black/55">Average response time</p>
                </div>

                <div className="nb-card-compat bg-nb-black text-white border-2 border-nb-blue/30">
                  <div className="flex items-center gap-3 mb-4">
                    <Star className="w-8 h-8 text-nb-blue" />
                    <h3 className="text-lg font-bold text-nb-black">Consistency</h3>
                  </div>
                  <p className="text-3xl font-bold text-nb-black mb-2">{analytics.performance?.consistency || 0}%</p>
                  <p className="text-sm text-nb-black/55">Performance consistency</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && reportData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Strengths & Weaknesses */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="nb-card-compat bg-nb-black text-white border-2 border-nb-green/30">
                  <h3 className="text-xl font-bold text-nb-black mb-6 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-nb-green" />
                    Key Strengths
                  </h3>
                  <div className="space-y-3">
                    {reportData.strengthsWeaknesses?.strengths?.length > 0 ? (
                      reportData.strengthsWeaknesses.strengths.map((strength, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-nb-green/30">
                          <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-nb-black/75 text-sm">{strength}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-nb-black/45 text-center py-8">Keep working to build your strengths</p>
                    )}
                  </div>
                </div>

                <div className="nb-card-compat bg-nb-black text-white border-2 border-nb-red/30">
                  <h3 className="text-xl font-bold text-nb-black mb-6 flex items-center gap-2">
                    <AlertCircle className="w-6 h-6 text-nb-red" />
                    Areas for Improvement
                  </h3>
                  <div className="space-y-3">
                    {reportData.strengthsWeaknesses?.weaknesses?.length > 0 ? (
                      reportData.strengthsWeaknesses.weaknesses.map((weakness, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-nb-red/30">
                          <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-nb-black/75 text-sm">{weakness}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-nb-black/45 text-center py-8">Great job! No major weaknesses identified</p>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="nb-card-compat bg-nb-black text-white border-2 border-nb-black">
                <h3 className="text-xl font-bold text-nb-black mb-6 flex items-center gap-2">
                  <Brain className="w-6 h-6 text-nb-black" />
                  AI-Powered Recommendations
                </h3>
                <div className="space-y-4">
                  {reportData.recommendations?.length > 0 ? (
                    reportData.recommendations.map((rec, index) => (
                      <div key={index} className="p-4 bg-white rounded-lg border-l-3 border-nb-black shadow-sm">
                        <p className="text-nb-black/75">{rec}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-nb-black/45 text-center py-8">No recommendations available</p>
                  )}
                </div>
              </div>

              {/* Progress Insights */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="nb-card-compat">
                  <h3 className="text-lg font-bold text-nb-black mb-4">Progress Insights</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-[#F5F1E8] rounded-lg">
                      <span className="text-nb-black/55">Learning Velocity</span>
                      <span className="font-bold text-nb-black">
                        {analytics.insights?.learningVelocity || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#F5F1E8] rounded-lg">
                      <span className="text-nb-black/55">Retention Rate</span>
                      <span className="font-bold text-nb-black">
                        {analytics.insights?.retentionRate || 'N/A'}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#F5F1E8] rounded-lg">
                      <span className="text-nb-black/55">Improvement Rate</span>
                      <span className="font-bold text-nb-black">
                        {analytics.insights?.improvementRate || 'N/A'}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="nb-card-compat">
                  <h3 className="text-lg font-bold text-nb-black mb-4">Study Patterns</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-[#F5F1E8] rounded-lg">
                      <span className="text-nb-black/55">Peak Performance Time</span>
                      <span className="font-bold text-nb-black">
                        {analytics.patterns?.peakTime || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#F5F1E8] rounded-lg">
                      <span className="text-nb-black/55">Preferred Study Duration</span>
                      <span className="font-bold text-nb-black">
                        {analytics.patterns?.preferredDuration || 'N/A'} min
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#F5F1E8] rounded-lg">
                      <span className="text-nb-black/55">Most Active Day</span>
                      <span className="font-bold text-nb-black">
                        {analytics.patterns?.mostActiveDay || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Report Generation */}
              <div className="nb-card-compat">
                <h3 className="text-xl font-bold text-nb-black mb-6 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-nb-black" />
                  Generate Custom Report
                </h3>
                
                {/* Quick Date Ranges */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-nb-black/75 mb-3">Quick Date Ranges</label>
                  <div className="flex flex-wrap gap-2">
                    {quickDateRanges.map((range) => (
                      <button
                        key={range.label}
                        onClick={() => setQuickRange(range.days)}
                        className="px-4 py-2 bg-[#F5F1E8] hover:bg-gray-200 text-nb-black/75 rounded-lg text-sm font-medium transition-colors"
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Date Range */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-nb-black/75 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nb-black/75 mb-2">End Date</label>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={generateReport}
                      disabled={reportLoading}
                      className="w-full px-6 py-2 bg-nb-black text-white rounded-lg hover:bg-nb-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {reportLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Filter className="w-4 h-4" />
                          Generate Report
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Report Preview */}
              {reportData && (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="nb-card-compat bg-nb-black text-white border-2 border-nb-blue/30">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-6 h-6 text-nb-blue" />
                        <p className="text-sm text-nb-black/55">Total Tests</p>
                      </div>
                      <p className="text-3xl font-bold text-nb-black">{reportData.summary?.totalTests || 0}</p>
                    </div>

                    <div className="nb-card-compat bg-nb-black text-white border-2 border-nb-blue/30">
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="w-6 h-6 text-nb-blue" />
                        <p className="text-sm text-nb-black/55">Interviews</p>
                      </div>
                      <p className="text-3xl font-bold text-nb-black">{reportData.summary?.totalInterviews || 0}</p>
                    </div>

                    <div className="nb-card-compat bg-nb-black text-white border-2 border-nb-green/30">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-6 h-6 text-nb-green" />
                        <p className="text-sm text-nb-black/55">Current Streak</p>
                      </div>
                      <p className="text-3xl font-bold text-nb-black">{reportData.summary?.currentStreak || 0} days</p>
                    </div>

                    <div className="nb-card-compat bg-nb-black text-white border-2 border-nb-black/20">
                      <div className="flex items-center gap-3 mb-2">
                        <Award className="w-6 h-6 text-nb-black" />
                        <p className="text-sm text-nb-black/55">Achievements</p>
                      </div>
                      <p className="text-3xl font-bold text-nb-black">{reportData.summary?.totalAchievements || 0}</p>
                    </div>
                  </div>

                  {/* Performance Analysis */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="nb-card-compat">
                      <h3 className="text-xl font-bold text-nb-black mb-4">Test Performance</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-[#F5F1E8] rounded-lg">
                          <span className="text-nb-black/55">Average Score</span>
                          <span className="text-xl font-bold text-nb-black">{reportData.testAnalysis?.avgScore || 0}%</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-[#F5F1E8] rounded-lg">
                          <span className="text-nb-black/55">Pass Rate</span>
                          <span className="text-xl font-bold text-nb-black">{reportData.testAnalysis?.passRate || 0}%</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-[#F5F1E8] rounded-lg">
                          <span className="text-nb-black/55">Improvement</span>
                          <span className="text-xl font-bold text-nb-green">+{reportData.testAnalysis?.improvement || 0}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="nb-card-compat">
                      <h3 className="text-xl font-bold text-nb-black mb-4">Interview Performance</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-[#F5F1E8] rounded-lg">
                          <span className="text-nb-black/55">Average Score</span>
                          <span className="text-xl font-bold text-nb-black">{reportData.interviewAnalysis?.avgScore || 0}%</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-[#F5F1E8] rounded-lg">
                          <span className="text-nb-black/55">Confidence Level</span>
                          <span className="text-xl font-bold text-nb-black">{reportData.interviewAnalysis?.confidence || 0}%</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-[#F5F1E8] rounded-lg">
                          <span className="text-nb-black/55">Communication</span>
                          <span className="text-xl font-bold text-nb-blue">{reportData.interviewAnalysis?.communication || 0}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Download Actions */}
                  <div className="nb-card-compat bg-nb-black text-white text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold mb-2">Download Your Comprehensive Report</h3>
                        <p className="text-white/90">Get a professional PDF report with detailed analytics and insights</p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            // Share functionality
                            if (navigator.share) {
                              navigator.share({
                                title: 'My Performance Report',
                                text: 'Check out my performance analytics from CrackIt AI',
                                url: window.location.href
                              });
                            } else {
                              toast.success('Link copied to clipboard!');
                              navigator.clipboard.writeText(window.location.href);
                            }
                          }}
                          className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
                        >
                          <Share2 className="w-4 h-4" />
                          Share
                        </button>
                        <PDFDownloadLink
                          document={<PerformanceReportPDF data={{...reportData, user, period: dateRange}} />}
                          fileName={`performance-report-${user?.name?.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`}
                          className="px-6 py-2 bg-white text-nb-black rounded-lg font-semibold hover:bg-[#F5F1E8] transition-colors flex items-center gap-2"
                        >
                          {({ loading }) => (
                            loading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-nb-black"></div>
                                Preparing...
                              </>
                            ) : (
                              <>
                                <Download className="w-5 h-5" />
                                Download PDF
                              </>
                            )
                          )}
                        </PDFDownloadLink>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!reportData && !reportLoading && (
                <div className="nb-card-compat text-center py-12">
                  <FileText className="w-16 h-16 text-nb-black/60 mx-auto mb-4" />
                  <p className="text-nb-black/45 font-medium mb-2">No report generated yet</p>
                  <p className="text-sm text-nb-black/35">Select a date range and click "Generate Report" to create your comprehensive analytics report</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UnifiedAnalytics;