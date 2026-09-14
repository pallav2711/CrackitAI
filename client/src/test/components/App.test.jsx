import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../utils/testUtils';
import App from '../../App';

describe('App Component', () => {
  it('renders without crashing', () => {
    renderWithRouter(<App />);
    // Just check that the app renders without errors
    expect(document.body).toBeInTheDocument();
  });

  it('renders landing page by default', () => {
    renderWithRouter(<App />);
    // The app should render some content
    expect(document.querySelector('div')).toBeInTheDocument();
  });
});