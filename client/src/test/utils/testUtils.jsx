import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Mock store
const mockStore = {
  user: null,
  isAuthenticated: false,
  login: vi.fn(),
  logout: vi.fn(),
  setUser: vi.fn(),
};

// Custom render function
export function renderWithRouter(ui, options = {}) {
  const { initialEntries = ['/'], ...renderOptions } = options;

  function Wrapper({ children }) {
    return (
      <BrowserRouter>
        {children}
      </BrowserRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Mock API responses
export const mockApiResponses = {
  user: {
    _id: '123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user'
  },
  interview: {
    _id: 'interview123',
    title: 'Software Engineer Interview',
    questions: [
      {
        _id: 'q1',
        question: 'Tell me about yourself',
        type: 'behavioral'
      }
    ]
  },
  test: {
    _id: 'test123',
    title: 'JavaScript Test',
    questions: [
      {
        _id: 'q1',
        question: 'What is closure?',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0
      }
    ]
  }
};

export { mockStore };