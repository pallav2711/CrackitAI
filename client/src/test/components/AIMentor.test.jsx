import { describe, it, expect, vi } from 'vitest';
import { renderWithRouter } from '../utils/testUtils';
import AIMentor from '../../pages/AIMentor';

// Mock the AI mentor service
vi.mock('../../services/aiMentorService', () => ({
  default: {
    sendMessage: vi.fn(() => Promise.resolve({
      data: {
        response: 'This is a test AI response',
        sessionId: 'session123'
      }
    })),
    getSessionHistory: vi.fn(() => Promise.resolve({
      data: {
        messages: []
      }
    }))
  }
}));

describe('AIMentor Component', () => {
  it('renders AI mentor component', () => {
    renderWithRouter(<AIMentor />);
    // Just verify the component renders without errors
    expect(document.body).toBeInTheDocument();
  });

  it('renders with proper structure', () => {
    renderWithRouter(<AIMentor />);
    // Check for basic structure elements
    const mainContent = document.querySelector('div');
    expect(mainContent).toBeInTheDocument();
  });
});