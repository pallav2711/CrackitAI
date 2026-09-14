import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Award, Target, Calendar,
  BarChart3, PieChart, Activity, Download, Filter
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import analyticsService from '../services/analyticsService';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsService.getDashboardAnalytics(period);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await analyticsService.getPerformanceReport();
      // Generate PDF from report data
      generatePDF(response.data);
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  const generatePDF = (data) => {
    // PDF generation will be implemented separately
    console.log('Generating PDF with data:', data);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="w-10 h-10 border-3 border-nb-black border-t-nb-yellow rounded-full animate-spin border-nb-black"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!analytics) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-nb-black/45">No analytics data available</p>
        </div>
      </DashboardLayout>
    );
  }

  const { stats, performanceTrends, weeklyProgress } = analytics;

  // Chart configurations
  const performanceChartData = {
    labels: weeklyProgress.map(d => d.day),
    datasets: [
      {
        label: 'Activity Score',
        data: weeklyProgress.map(d => d.value),
        fill: true,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderColor: 'rgb(99, 102, 241)',
        tension: 0.4
      }
    ]
  };

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-nb-black">Analytics Dashboard</h1>
            <p className="text-nb-black/55 mt-1">Track your progress and performance</p>
          </div>
          <div className="flex gap-3">
            <div className="flex gap-2">
              {['week', 'month', 'year', 'all'].map((p) => (
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
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: 'Resume Score',
              value: stats.resumeScore,
              icon: Target,
              gradient: 'bg-nb-black',
              trend: performanceTrends?.resume
            },
            {
              label: 'Interviews',
              value: stats.interviews,
              icon: Activity,
              gradient: 'bg-nb-black',
              trend: performanceTrends?.interviews
            },
            {
              label: 'Tests Completed',
              value: stats.tests,
              icon: BarChart3,
              gradient: 'bg-nb-black',
              trend: performanceTrends?.tests
            },
            {
              label: 'Readiness Score',
              value: stats.readinessScore,
              icon: Award,
              gradient: 'bg-nb-black',
              trend: performanceTrends?.overall
            }
          ].map((stat, index) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trend?.trend === 'up' ? TrendingUp : TrendingDown;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="nb-card-compat"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-nb-black flex items-center justify-center text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  {stat.trend && (
                    <div className={`flex items-center gap-1 text-sm font-semibold ${
                      stat.trend.trend === 'up' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      <TrendIcon className="w-4 h-4" />
                      {stat.trend.value}%
                    </div>
                  )}
                </div>
                <p className="text-nb-black/55 text-sm mb-1">{stat.label}</p>
                <p className="text-4xl font-bold text-nb-black">
                  {stat.value}{stat.label.includes('Score') ? '%' : ''}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Performance Chart */}
        <div className="nb-card-compat">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-nb-black">Performance Trend</h3>
            <BarChart3 className="w-5 h-5 text-nb-black/35" />
          </div>
          <div className="h-80">
            <Line data={performanceChartData} options={chartOptions} />
          </div>
        </div>

        {/* Recent Activity & Achievements */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="nb-card-compat">
            <h3 className="text-xl font-bold text-nb-black mb-6">Recent Activity</h3>
            <div className="space-y-3">
              {analytics.recentActivity?.length > 0 ? (
                analytics.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F5F1E8] transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-nb-black capitalize">{activity.type}</p>
                      <p className="text-sm text-nb-black/45">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-nb-black font-semibold">+{activity.points} pts</div>
                  </div>
                ))
              ) : (
                <p className="text-center text-nb-black/45 py-8">No recent activity</p>
              )}
            </div>
          </div>

          <div className="nb-card-compat">
            <h3 className="text-xl font-bold text-nb-black mb-6">Recent Achievements</h3>
            <div className="space-y-3">
              {analytics.achievements?.length > 0 ? (
                analytics.achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-nb-black text-white border border-nb-black/20"
                  >
                    <Award className="w-8 h-8 text-nb-black" />
                    <div>
                      <p className="font-semibold text-nb-black">{achievement.title}</p>
                      <p className="text-sm text-nb-black/55">{achievement.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-nb-black/45 py-8">No achievements yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
