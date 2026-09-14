import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Calendar, Filter, TrendingUp, Award } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import PerformanceReportPDF from '../components/reports/PDFReport';
import analyticsService from '../services/analyticsService';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await analyticsService.getPerformanceReport(
        dateRange.startDate,
        dateRange.endDate
      );
      setReportData(response.data);
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleGenerateReport = () => {
    fetchReport();
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-nb-black flex items-center gap-3">
              <FileText className="w-8 h-8 text-nb-black" />
              Performance Reports
            </h1>
            <p className="text-nb-black/55 mt-1">Generate detailed performance reports with PDF export</p>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="nb-card-compat">
          <h3 className="text-lg font-bold text-nb-black mb-4">Select Report Period</h3>
          
          {/* Quick Ranges */}
          <div className="flex flex-wrap gap-2 mb-4">
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

          {/* Custom Date Range */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-nb-black/75 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-nb-black/75 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className="w-full px-6 py-2 bg-nb-black text-white rounded-lg hover:bg-nb-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
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
                <p className="text-3xl font-bold text-nb-black">{reportData.summary.totalTests}</p>
              </div>

              <div className="nb-card-compat bg-nb-black text-white border-2 border-nb-blue/30">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-6 h-6 text-nb-blue" />
                  <p className="text-sm text-nb-black/55">Interviews</p>
                </div>
                <p className="text-3xl font-bold text-nb-black">{reportData.summary.totalInterviews}</p>
              </div>

              <div className="nb-card-compat bg-nb-black text-white border-2 border-nb-green/30">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-6 h-6 text-nb-green" />
                  <p className="text-sm text-nb-black/55">Current Streak</p>
                </div>
                <p className="text-3xl font-bold text-nb-black">{reportData.summary.currentStreak} days</p>
              </div>

              <div className="nb-card-compat bg-nb-black text-white border-2 border-nb-black/20">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="w-6 h-6 text-nb-black" />
                  <p className="text-sm text-nb-black/55">Achievements</p>
                </div>
                <p className="text-3xl font-bold text-nb-black">{reportData.summary.totalAchievements}</p>
              </div>
            </div>

            {/* Detailed Analysis */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Test Analysis */}
              <div className="nb-card-compat">
                <h3 className="text-xl font-bold text-nb-black mb-4">Test Performance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-[#F5F1E8] rounded-lg">
                    <span className="text-nb-black/55">Average Score</span>
                    <span className="text-xl font-bold text-nb-black">{reportData.testAnalysis.avgScore}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[#F5F1E8] rounded-lg">
                    <span className="text-nb-black/55">Pass Rate</span>
                    <span className="text-xl font-bold text-nb-black">{reportData.testAnalysis.passRate}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[#F5F1E8] rounded-lg">
                    <span className="text-nb-black/55">Total Tests</span>
                    <span className="text-xl font-bold text-nb-black">{reportData.testAnalysis.totalTests}</span>
                  </div>
                </div>
              </div>

              {/* Interview Analysis */}
              <div className="nb-card-compat">
                <h3 className="text-xl font-bold text-nb-black mb-4">Interview Performance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-[#F5F1E8] rounded-lg">
                    <span className="text-nb-black/55">Average Score</span>
                    <span className="text-xl font-bold text-nb-black">{reportData.interviewAnalysis.avgScore}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[#F5F1E8] rounded-lg">
                    <span className="text-nb-black/55">Total Interviews</span>
                    <span className="text-xl font-bold text-nb-black">{reportData.interviewAnalysis.totalInterviews}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="nb-card-compat bg-nb-black text-white">
                <h3 className="text-xl font-bold text-nb-black mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6 text-nb-green" />
                  Key Strengths
                </h3>
                <ul className="space-y-2">
                  {reportData.strengthsWeaknesses.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-green-600 rounded-full mt-2"></span>
                      <span className="text-nb-black/75">{strength}</span>
                    </li>
                  ))}
                  {reportData.strengthsWeaknesses.strengths.length === 0 && (
                    <p className="text-nb-black/45 text-center py-4">Keep working to build your strengths</p>
                  )}
                </ul>
              </div>

              <div className="nb-card-compat bg-nb-black text-white">
                <h3 className="text-xl font-bold text-nb-black mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-nb-red" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {reportData.strengthsWeaknesses.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-red-600 rounded-full mt-2"></span>
                      <span className="text-nb-black/75">{weakness}</span>
                    </li>
                  ))}
                  {reportData.strengthsWeaknesses.weaknesses.length === 0 && (
                    <p className="text-nb-black/45 text-center py-4">Great job! No major weaknesses identified</p>
                  )}
                </ul>
              </div>
            </div>

            {/* Recommendations */}
            <div className="nb-card-compat bg-nb-black text-white">
              <h3 className="text-xl font-bold text-nb-black mb-4">Personalized Recommendations</h3>
              <div className="space-y-3">
                {reportData.recommendations.map((rec, index) => (
                  <div key={index} className="p-4 bg-white rounded-lg border-l-3 border-nb-black">
                    <p className="text-nb-black/75">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Download Button */}
            <div className="nb-card-compat bg-nb-black text-white text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Download Your Report</h3>
                  <p className="text-white/90">Get a professional PDF report to share with recruiters</p>
                </div>
                <PDFDownloadLink
                  document={<PerformanceReportPDF data={reportData} />}
                  fileName={`performance-report-${new Date().toISOString().split('T')[0]}.pdf`}
                  className="px-6 py-3 bg-white text-nb-black rounded-lg font-semibold hover:bg-[#F5F1E8] transition-colors flex items-center gap-2"
                >
                  {({ loading }) => (
                    loading ? 'Preparing...' : (
                      <>
                        <Download className="w-5 h-5" />
                        Download PDF
                      </>
                    )
                  )}
                </PDFDownloadLink>
              </div>
            </div>
          </>
        )}

        {!reportData && !loading && (
          <div className="nb-card-compat text-center py-12">
            <FileText className="w-16 h-16 text-nb-black/60 mx-auto mb-4" />
            <p className="text-nb-black/45 font-medium mb-2">No report generated yet</p>
            <p className="text-sm text-nb-black/35">Select a date range and click "Generate Report"</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Reports;
