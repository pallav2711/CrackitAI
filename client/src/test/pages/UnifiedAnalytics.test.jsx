import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../utils/testUtils';
import UnifiedAnalytics from '../../pages/UnifiedAnalytics';

// Mock the services
vi.mock('../../services/analyticsService', () => ({
  default: {
    getDashboardAnalytics: vi.fn(() => Promise.resolve({
      data: {
        stats: {
          overallScore: 78,
          tests: 24,
          interviews: 8,
          streak: 12
        },
        trends: {
          overall: { direction: 'up', value: 12 },
          tests: { direction: 'up', value: 8 },
          interviews: { direction: 'up', value: 15 },
          streak: { direction: 'up', value: 5 }
        },
        weeklyProgress: [
          { day: 'Mon', value: 75 },
          { day: 'Tue', value: 78 },
          { day: 'Wed', value: 82 }
        ],
        skillBreakdown: {
          'Technical': 85,
          'Communication': 78,
          'Problem Solving': 82
        },
        categoryPerformance: {
          'Aptitude': 85,
          'Technical': 78,
          'Logical': 82
        },
        recentActivity: [
          { type: 'test', points: 85, timestamp: new Date().toISOString() }
        ],
        achievements: [
          { title: 'Test Master', description: 'Completed 20 tests' }
        ],
        performance: {
          accuracy: 82,
          avgTime: 45,
          consistency: 78
        }
      }
    })),
    getPerformanceReport: vi.fn(() => Promise.resolve({
      data: {
        summary: {
          totalTests: 24,
          totalInterviews: 8,
          currentStreak: 12,
          totalAchievements: 5,
          overallScore: 78
        },
        testAnalysis: {
          avgScore: 82,
          passRate: 88,
          improvement: 12
        },
        interviewAnalysis: {
          avgScore: 78,
          communication: 82,
          technical: 75
        },
        strengthsWeaknesses: {
          strengths: ['Strong analytical thinking'],
          weaknesses: ['Communication needs work']
        },
        recommendations: ['Practice more interviews']
      }
    }))
  }
}));

vi.mock('../../store/useAuthStore', () => ({
  default: () => ({
    user: { name: 'Test User', email: 'test@example.com' },
    isAuthenticated: true
  })
}));

describe('UnifiedAnalytics Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders analytics dashboard with tabs', async () => {
    renderWithRouter(<UnifiedAnalytics />);
    
    await waitFor(() => {
      expect(screen.getByText('Analytics & Reports')).toBeInTheDocument();
    });

    // Check for tab navigation
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
    expect(screen.getByText('Insights')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('displays key metrics in overview tab', async () => {
    renderWithRouter(<UnifiedAnalytics />);
    
    await waitFor(() => {
      expect(screen.getByText('Overall Score')).toBeInTheDocument();
      expect(screen.getByText('Tests Completed')).toBeInTheDocument();
      expect(screen.getByText('Interviews')).toBeInTheDocument();
      expect(screen.getByText('Study Streak')).toBeInTheDocument();
    });
  });

  it('switches between tabs correctly', async () => {
    const user = userEvent.setup();
    renderWithRouter(<UnifiedAnalytics />);
    
    await waitFor(() => {
      expect(screen.getByText('Analytics & Reports')).toBeInTheDocument();
    });

    // Click on Performance tab
    const performanceTab = screen.getByText('Performance');
    await user.click(performanceTab);
    
    // Should show performance content
    await waitFor(() => {
      expect(screen.getByText('Skill Assessment')).toBeInTheDocument();
    });
  });

  it('generates and displays report data', async () => {
    const user = userEvent.setup();
    renderWithRouter(<UnifiedAnalytics />);
    
    await waitFor(() => {
      expect(screen.getByText('Analytics & Reports')).toBeInTheDocument();
    });

    // Click on Reports tab
    const reportsTab = screen.getByText('Reports');
    await user.click(reportsTab);
    
    // Should show report generation interface
    await waitFor(() => {
      expect(screen.getByText('Generate Custom Report')).toBeInTheDocument();
    });
  });

  it('handles period selection', async () => {
    const user = userEvent.setup();
    renderWithRouter(<UnifiedAnalytics />);
    
    await waitFor(() => {
      expect(screen.getByText('Analytics & Reports')).toBeInTheDocument();
    });

    // Click on Month period
    const monthButton = screen.getByText('Month');
    await user.click(monthButton);
    
    // Should update the active period
    expect(monthButton).toHaveClass('bg-nb-black');
  });

  it('displays loading state initially', () => {
    renderWithRouter(<UnifiedAnalytics />);
    
    expect(screen.getByText('Loading comprehensive analytics...')).toBeInTheDocument();
  });
});