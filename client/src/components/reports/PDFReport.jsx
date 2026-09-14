import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Enhanced PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    fontSize: 12,
    lineHeight: 1.4
  },
  header: {
    marginBottom: 30,
    borderBottom: '3 solid #6366f1',
    paddingBottom: 20,
    backgroundColor: '#f8fafc'
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: {
    width: 60,
    height: 60,
    backgroundColor: '#6366f1',
    borderRadius: 8,
    marginBottom: 10
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 5
  },
  userInfo: {
    textAlign: 'right'
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4
  },
  userEmail: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8
  },
  section: {
    marginBottom: 30,
    pageBreakInside: false
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
    borderLeft: '5 solid #6366f1',
    paddingLeft: 12,
    backgroundColor: '#f8fafc',
    paddingVertical: 8
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
    marginTop: 20
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    gap: 10
  },
  statCard: {
    width: '23%',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    border: '2 solid #e5e7eb',
    alignItems: 'center'
  },
  statIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    marginBottom: 8
  },
  statLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 6,
    textAlign: 'center'
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center'
  },
  statTrend: {
    fontSize: 9,
    color: '#10b981',
    marginTop: 4,
    textAlign: 'center'
  },
  table: {
    marginTop: 15,
    border: '1 solid #e5e7eb',
    borderRadius: 8
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 15
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
    paddingVertical: 15,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8
  },
  tableCell: {
    fontSize: 11,
    color: '#374151',
    flex: 1,
    paddingRight: 10
  },
  tableCellBold: {
    fontSize: 11,
    color: '#1f2937',
    fontWeight: 'bold',
    flex: 1,
    paddingRight: 10
  },
  recommendation: {
    padding: 15,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    marginBottom: 12,
    borderLeft: '4 solid #3b82f6'
  },
  recommendationText: {
    fontSize: 12,
    color: '#1e40af',
    lineHeight: 1.6
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#9ca3af',
    borderTop: '2 solid #e5e7eb',
    paddingTop: 15
  },
  badge: {
    padding: '6 12',
    backgroundColor: '#10b981',
    borderRadius: 6,
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5
  },
  badgeWarning: {
    backgroundColor: '#f59e0b'
  },
  badgeError: {
    backgroundColor: '#ef4444'
  },
  strengthsList: {
    marginTop: 15
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
    paddingLeft: 5
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 12,
    marginTop: 4
  },
  bulletWarning: {
    backgroundColor: '#f59e0b'
  },
  bulletError: {
    backgroundColor: '#ef4444'
  },
  listText: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
    lineHeight: 1.5
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginTop: 5,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4
  },
  scoreCard: {
    padding: 20,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    border: '2 solid #0ea5e9',
    marginBottom: 20,
    alignItems: 'center'
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#0ea5e9',
    marginBottom: 5
  },
  scoreLabel: {
    fontSize: 14,
    color: '#0369a1',
    fontWeight: 'bold'
  },
  twoColumnLayout: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20
  },
  column: {
    flex: 1
  },
  highlight: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    borderLeft: '3 solid #f59e0b'
  },
  highlightText: {
    fontSize: 11,
    color: '#92400e',
    fontWeight: 'bold'
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    right: 40,
    fontSize: 10,
    color: '#9ca3af'
  }
});

// Enhanced PDF Document Component
const PerformanceReportPDF = ({ data }) => {
  const { 
    user = {}, 
    summary = {}, 
    testAnalysis = {}, 
    interviewAnalysis = {}, 
    strengthsWeaknesses = { strengths: [], weaknesses: [] }, 
    recommendations = [], 
    period = {},
    analytics = {}
  } = data || {};

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Average';
    if (score >= 60) return 'Below Average';
    return 'Needs Improvement';
  };

  return (
    <Document>
      {/* Page 1: Cover & Summary */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <View style={styles.logo} />
              <Text style={styles.title}>Performance Report</Text>
              <Text style={styles.subtitle}>Comprehensive Analytics & Insights</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user.email || 'user@example.com'}</Text>
              <Text style={styles.subtitle}>
                Report Period: {formatDate(period.startDate)} - {formatDate(period.endDate)}
              </Text>
              <Text style={styles.subtitle}>
                Generated: {formatDate(new Date())}
              </Text>
            </View>
          </View>
        </View>

        {/* Overall Score Card */}
        <View style={styles.scoreCard}>
          <Text style={[styles.scoreValue, { color: getScoreColor(summary.overallScore || 0) }]}>
            {summary.overallScore || 0}%
          </Text>
          <Text style={styles.scoreLabel}>Overall Performance Score</Text>
          <Text style={[styles.badge, { backgroundColor: getScoreColor(summary.overallScore || 0) }]}>
            {getScoreGrade(summary.overallScore || 0)}
          </Text>
        </View>

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Performance Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon} />
              <Text style={styles.statLabel}>Tests Completed</Text>
              <Text style={styles.statValue}>{summary.totalTests || 0}</Text>
              <Text style={styles.statTrend}>+{summary.testGrowth || 0}% this period</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon} />
              <Text style={styles.statLabel}>Mock Interviews</Text>
              <Text style={styles.statValue}>{summary.totalInterviews || 0}</Text>
              <Text style={styles.statTrend}>+{summary.interviewGrowth || 0}% this period</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon} />
              <Text style={styles.statLabel}>Study Streak</Text>
              <Text style={styles.statValue}>{summary.currentStreak || 0}</Text>
              <Text style={styles.statTrend}>days consecutive</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon} />
              <Text style={styles.statLabel}>Achievements</Text>
              <Text style={styles.statValue}>{summary.totalAchievements || 0}</Text>
              <Text style={styles.statTrend}>badges earned</Text>
            </View>
          </View>
        </View>

        {/* Quick Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Key Insights</Text>
          <View style={styles.highlight}>
            <Text style={styles.highlightText}>
              Your performance has improved by {analytics.improvementRate || 0}% compared to the previous period.
            </Text>
          </View>
          <View style={styles.highlight}>
            <Text style={styles.highlightText}>
              You're most productive during {analytics.peakTime || 'morning'} hours.
            </Text>
          </View>
          <View style={styles.highlight}>
            <Text style={styles.highlightText}>
              Your strongest skill area is {analytics.topSkill || 'Technical Knowledge'}.
            </Text>
          </View>
        </View>

        {/* Page Number */}
        <Text style={styles.pageNumber}>Page 1 of 3</Text>
        
        {/* Footer */}
        <Text style={styles.footer}>
          CrackIt AI Performance Report • Confidential Document • Generated on {formatDate(new Date())}
        </Text>
      </Page>

      {/* Page 2: Detailed Performance Analysis */}
      <Page size="A4" style={styles.page}>
        {/* Test Performance Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Test Performance Analysis</Text>
          
          <View style={styles.twoColumnLayout}>
            <View style={styles.column}>
              <Text style={styles.subsectionTitle}>Overall Statistics</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.tableCellBold}>Metric</Text>
                  <Text style={styles.tableCellBold}>Value</Text>
                  <Text style={styles.tableCellBold}>Grade</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>Average Score</Text>
                  <Text style={styles.tableCellBold}>{testAnalysis.avgScore || 0}%</Text>
                  <Text style={[styles.tableCell, { color: getScoreColor(testAnalysis.avgScore || 0) }]}>
                    {getScoreGrade(testAnalysis.avgScore || 0)}
                  </Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>Pass Rate</Text>
                  <Text style={styles.tableCellBold}>{testAnalysis.passRate || 0}%</Text>
                  <Text style={[styles.tableCell, { color: getScoreColor(testAnalysis.passRate || 0) }]}>
                    {getScoreGrade(testAnalysis.passRate || 0)}
                  </Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>Improvement Rate</Text>
                  <Text style={styles.tableCellBold}>+{testAnalysis.improvement || 0}%</Text>
                  <Text style={styles.tableCell}>Trending Up</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>Time Efficiency</Text>
                  <Text style={styles.tableCellBold}>{testAnalysis.timeEfficiency || 0}%</Text>
                  <Text style={[styles.tableCell, { color: getScoreColor(testAnalysis.timeEfficiency || 0) }]}>
                    {getScoreGrade(testAnalysis.timeEfficiency || 0)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.column}>
              <Text style={styles.subsectionTitle}>Category Breakdown</Text>
              <View style={styles.strengthsList}>
                {Object.entries(analytics.categoryPerformance || {}).map(([category, score], index) => (
                  <View key={index} style={styles.listItem}>
                    <View style={[styles.bullet, { backgroundColor: getScoreColor(score) }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.listText}>{category}: {score}%</Text>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${score}%`, backgroundColor: getScoreColor(score) }]} />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Interview Performance Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎤 Interview Performance Analysis</Text>
          
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCellBold}>Assessment Area</Text>
              <Text style={styles.tableCellBold}>Score</Text>
              <Text style={styles.tableCellBold}>Feedback</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Communication Skills</Text>
              <Text style={styles.tableCellBold}>{interviewAnalysis.communication || 0}%</Text>
              <Text style={styles.tableCell}>
                {(interviewAnalysis.communication || 0) >= 80 ? 'Excellent clarity' : 'Needs improvement'}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Technical Knowledge</Text>
              <Text style={styles.tableCellBold}>{interviewAnalysis.technical || 0}%</Text>
              <Text style={styles.tableCell}>
                {(interviewAnalysis.technical || 0) >= 80 ? 'Strong foundation' : 'Study more concepts'}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Problem Solving</Text>
              <Text style={styles.tableCellBold}>{interviewAnalysis.problemSolving || 0}%</Text>
              <Text style={styles.tableCell}>
                {(interviewAnalysis.problemSolving || 0) >= 80 ? 'Great approach' : 'Practice more problems'}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Confidence Level</Text>
              <Text style={styles.tableCellBold}>{interviewAnalysis.confidence || 0}%</Text>
              <Text style={styles.tableCell}>
                {(interviewAnalysis.confidence || 0) >= 80 ? 'Very confident' : 'Build more confidence'}
              </Text>
            </View>
          </View>
        </View>

        {/* Study Patterns */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Study Patterns & Habits</Text>
          <View style={styles.twoColumnLayout}>
            <View style={styles.column}>
              <Text style={styles.subsectionTitle}>Time Analysis</Text>
              <View style={styles.listItem}>
                <View style={styles.bullet} />
                <Text style={styles.listText}>Peak Performance: {analytics.peakTime || 'Morning'}</Text>
              </View>
              <View style={styles.listItem}>
                <View style={styles.bullet} />
                <Text style={styles.listText}>Average Session: {analytics.avgSessionTime || 45} minutes</Text>
              </View>
              <View style={styles.listItem}>
                <View style={styles.bullet} />
                <Text style={styles.listText}>Most Active Day: {analytics.mostActiveDay || 'Monday'}</Text>
              </View>
            </View>
            <View style={styles.column}>
              <Text style={styles.subsectionTitle}>Learning Metrics</Text>
              <View style={styles.listItem}>
                <View style={styles.bullet} />
                <Text style={styles.listText}>Retention Rate: {analytics.retentionRate || 85}%</Text>
              </View>
              <View style={styles.listItem}>
                <View style={styles.bullet} />
                <Text style={styles.listText}>Learning Velocity: {analytics.learningVelocity || 'High'}</Text>
              </View>
              <View style={styles.listItem}>
                <View style={styles.bullet} />
                <Text style={styles.listText}>Consistency Score: {analytics.consistencyScore || 78}%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Page Number */}
        <Text style={styles.pageNumber}>Page 2 of 3</Text>
        
        {/* Footer */}
        <Text style={styles.footer}>
          CrackIt AI Performance Report • Confidential Document • Generated on {formatDate(new Date())}
        </Text>
      </Page>

      {/* Page 3: Insights & Recommendations */}
      <Page size="A4" style={styles.page}>
        {/* Strengths */}
        {strengthsWeaknesses.strengths?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💪 Key Strengths</Text>
            <View style={styles.strengthsList}>
              {strengthsWeaknesses.strengths.map((strength, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.listText}>{strength}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Areas for Improvement */}
        {strengthsWeaknesses.weaknesses?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Areas for Improvement</Text>
            <View style={styles.strengthsList}>
              {strengthsWeaknesses.weaknesses.map((weakness, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={[styles.bullet, styles.bulletError]} />
                  <Text style={styles.listText}>{weakness}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* AI-Powered Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤖 AI-Powered Recommendations</Text>
          {recommendations?.length > 0 ? (
            recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendation}>
                <Text style={styles.recommendationText}>
                  {index + 1}. {rec}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.recommendation}>
              <Text style={styles.recommendationText}>
                Continue your excellent progress! Focus on maintaining consistency in your study habits.
              </Text>
            </View>
          )}
        </View>

        {/* Next Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 Recommended Next Steps</Text>
          <View style={styles.strengthsList}>
            <View style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>
                Focus on your weakest skill area: {analytics.weakestSkill || 'Problem Solving'}
              </Text>
            </View>
            <View style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>
                Increase practice frequency to maintain your {summary.currentStreak || 0}-day streak
              </Text>
            </View>
            <View style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>
                Take more mock interviews to improve confidence and communication
              </Text>
            </View>
            <View style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>
                Review and practice questions from categories with scores below 70%
              </Text>
            </View>
          </View>
        </View>

        {/* Report Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Report Summary</Text>
          <View style={styles.highlight}>
            <Text style={styles.highlightText}>
              Overall Performance: {getScoreGrade(summary.overallScore || 0)} ({summary.overallScore || 0}%)
            </Text>
          </View>
          <Text style={styles.listText}>
            This report analyzed {summary.totalTests || 0} tests and {summary.totalInterviews || 0} interviews 
            over a {Math.ceil((new Date(period.endDate) - new Date(period.startDate)) / (1000 * 60 * 60 * 24)) || 30}-day period. 
            Your performance shows {analytics.improvementRate >= 0 ? 'positive growth' : 'areas needing attention'} 
            with a {analytics.improvementRate || 0}% change from the previous period.
          </Text>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>Need Help?</Text>
          <Text style={styles.listText}>
            For personalized coaching and additional support, contact our AI mentors through the CrackIt AI platform.
          </Text>
        </View>

        {/* Page Number */}
        <Text style={styles.pageNumber}>Page 3 of 3</Text>
        
        {/* Footer */}
        <Text style={styles.footer}>
          CrackIt AI Performance Report • Confidential Document • Generated on {formatDate(new Date())}
        </Text>
      </Page>
    </Document>
  );
};

export default PerformanceReportPDF;
