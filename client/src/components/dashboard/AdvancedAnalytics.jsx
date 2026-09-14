import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Line, Doughnut, Bar, Radar } from 'react-chartjs-2';
import { 
  BarChart3, PieChart, LineChart, Activity,
  TrendingUp, TrendingDown, Target, Brain,
  Calendar, Filter, Download, Share2,
  ChevronLeft, ChevronRight, Maximize2
} from 'lucide-react';

const AdvancedAnalytics = ({ 
  analyticsData, 
  selectedPeriod, 
  onPeriodChange,
  onExport = () => {},
  className = ""
}) => {
  const [activeChart, setActiveChart] = useState('performance');
  const [chartType, setChartType] = useState('line');
  const [showComparison, setShowComparison] = useState(false);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1
      }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };

  const performanceChartData = useMemo(() => {
    if (!analyticsData?.weeklyProgress || analyticsData.weeklyProgress.every(d => d.value === 0)) return null;
    
    return {
      labels: analyticsData.weeklyProgress.map(d => d.day),
      datasets: [
        {
          label: 'Performance Score',
          data: analyticsData.weeklyProgress.map(d => d.value),
          fill: true,
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderColor: 'rgb(99, 102, 241)',
          tension: 0.4,
          pointBackgroundColor: 'rgb(99, 102, 241)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }
      ]
    };
  }, [analyticsData]);

  const skillRadarData = useMemo(() => {
    if (!analyticsData?.skillBreakdown || Object.keys(analyticsData.skillBreakdown).length === 0) return null;
    
    const skills = Object.keys(analyticsData.skillBreakdown);
    const values = Object.values(analyticsData.skillBreakdown);
    
    // Only show if there's actual data
    if (values.every(v => v === 0)) return null;
    
    return {
      labels: skills,
      datasets: [
        {
          label: 'Current Skills',
          data: values,
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          borderColor: 'rgb(99, 102, 241)',
          borderWidth: 2,
          pointBackgroundColor: 'rgb(99, 102, 241)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }
      ]
    };
  }, [analyticsData]);

  const categoryBarData = useMemo(() => {
    if (!analyticsData?.categoryPerformance || Object.keys(analyticsData.categoryPerformance).length === 0) return null;
    
    const categories = Object.keys(analyticsData.categoryPerformance);
    const scores = Object.values(analyticsData.categoryPerformance);
    
    // Only show if there's actual data
    if (scores.every(s => s === 0)) return null;
    
    return {
      labels: categories,
      datasets: [
        {
          label: 'Performance by Category',
          data: scores,
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)'
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)',
            'rgb(139, 92, 246)'
          ],
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false
        }
      ]
    };
  }, [analyticsData]);

  const charts = [
    {
      id: 'performance',
      title: 'Performance Trend',
      icon: LineChart,
      data: performanceChartData,
      type: 'line',
      description: 'Track your performance over time'
    },
    {
      id: 'skills',
      title: 'Skill Assessment',
      icon: Target,
      data: skillRadarData,
      type: 'radar',
      description: 'Comprehensive skill breakdown'
    },
    {
      id: 'categories',
      title: 'Category Performance',
      icon: BarChart3,
      data: categoryBarData,
      type: 'bar',
      description: 'Performance across different categories'
    }
  ];

  const renderChart = (chart) => {
    if (!chart.data) return (
      <div className="flex items-center justify-center h-64 text-nb-black/45">
        <div className="text-center">
          <chart.icon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-nb-black/55 mb-1">No {chart.title} Data</p>
          <p className="text-xs text-nb-black/45">Complete activities to see insights</p>
        </div>
      </div>
    );

    const ChartComponent = {
      line: Line,
      radar: Radar,
      bar: Bar,
      doughnut: Doughnut
    }[chart.type];

    return (
      <div className="h-64">
        <ChartComponent 
          data={chart.data} 
          options={{
            ...chartOptions,
            ...(chart.type === 'radar' ? {
              scales: {
                r: {
                  beginAtZero: true,
                  max: 100,
                  grid: { color: 'rgba(0, 0, 0, 0.1)' },
                  angleLines: { color: 'rgba(0, 0, 0, 0.1)' },
                  pointLabels: { font: { size: 12 } }
                }
              }
            } : {})
          }} 
        />
      </div>
    );
  };

  const activeChartData = charts.find(c => c.id === activeChart);

  return (
    <div className={`card ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-nb-black flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-nb-black" />
            Advanced Analytics
          </h3>
          <p className="text-sm text-nb-black/55 mt-1">
            {activeChartData?.description}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Period Selector */}
          <div className="flex bg-[#F5F1E8] rounded-lg p-1">
            {['week', 'month', 'quarter'].map((period) => (
              <button
                key={period}
                onClick={() => onPeriodChange(period)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  selectedPeriod === period
                    ? 'bg-white text-nb-black shadow-sm'
                    : 'text-nb-black/55 hover:text-nb-black'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Actions */}
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`p-2 rounded-lg transition-colors ${
              showComparison ? 'bg-nb-black text-nb-black' : 'bg-[#F5F1E8] text-nb-black/55 hover:bg-gray-200'
            }`}
            title="Toggle comparison"
          >
            <Filter className="w-4 h-4" />
          </button>
          
          <button
            onClick={onExport}
            className="p-2 bg-[#F5F1E8] text-nb-black/55 rounded-lg hover:bg-gray-200 transition-colors"
            title="Export data"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chart Navigation */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto">
        {charts.map((chart) => {
          const Icon = chart.icon;
          return (
            <button
              key={chart.id}
              onClick={() => setActiveChart(chart.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeChart === chart.id
                  ? 'bg-nb-black text-white shadow-lg'
                  : 'bg-[#F5F1E8] text-nb-black/55 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{chart.title}</span>
            </button>
          );
        })}
      </div>

      {/* Chart Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeChart}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderChart(activeChartData)}
        </motion.div>
      </AnimatePresence>

      {/* Insights */}
      {analyticsData?.insights && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-nb-black text-white rounded-lg border border-nb-blue/30"
        >
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-5 h-5 text-nb-blue" />
            <h4 className="font-semibold text-nb-black">AI Insights</h4>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-nb-black/75 mb-1">Key Strength</p>
              <p className="text-sm text-nb-black/55">
                {analyticsData.insights.strongestSkill || 'Analytical thinking'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-nb-black/75 mb-1">Focus Area</p>
              <p className="text-sm text-nb-black/55">
                {analyticsData.insights.weakestSkill || 'Communication skills'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-nb-black/75 mb-1">Learning Velocity</p>
              <p className="text-sm text-nb-black/55">
                {analyticsData.insights.learningVelocity || 'High'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-nb-black/75 mb-1">Improvement Rate</p>
              <div className="flex items-center gap-1">
                {analyticsData.insights.improvementRate >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <p className="text-sm text-nb-black/55">
                  {analyticsData.insights.improvementRate || 0}% this period
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdvancedAnalytics;