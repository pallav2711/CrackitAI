import { describe, it, expect } from 'vitest';

// Simple utility functions to test
const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2023-12-06');
      const formatted = formatDate(date);
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });
  });

  describe('calculatePercentage', () => {
    it('calculates percentage correctly', () => {
      expect(calculatePercentage(50, 100)).toBe(50);
      expect(calculatePercentage(25, 100)).toBe(25);
      expect(calculatePercentage(1, 3)).toBe(33);
    });

    it('handles zero total', () => {
      expect(calculatePercentage(10, 0)).toBe(0);
    });
  });

  describe('validateEmail', () => {
    it('validates correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('rejects invalid email', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
    });
  });
});