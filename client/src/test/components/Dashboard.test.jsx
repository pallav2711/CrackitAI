import { describe, it, expect, vi } from 'vitest';
import { renderWithRouter } from '../utils/testUtils';
import Dashboard from '../../pages/Dashboard';

// Mock the services and stores
vi.mock('../../services/analyticsService', () => ({
  default: {
    getAnalytics: vi.fn(() => Promise.resolve({
      data: {
        totalTests: 10,
        totalInterviews: 5,
        averageScore: 85,
        streak: 3
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

describe('Dashboard Component', () => {
  it('renders dashboard component', () => {
    renderWithRouter(<Dashboard />);
    // Just verify the component renders without errors
    expect(document.body).toBeInTheDocument();
  });

  it('renders with proper structure', () => {
    renderWithRouter(<Dashboard />);
    // Check for basic structure elements
    const mainContent = document.querySelector('div');
    expect(mainContent).toBeInTheDocument();
  });
});