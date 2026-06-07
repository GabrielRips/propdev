import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

function signIn() {
  render(<App />);
  fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'revity' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'propdev26' } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
}

beforeEach(() => {
  sessionStorage.clear();
});

test('requires authentication before rendering the app', () => {
  render(<App />);
  expect(screen.getByText('Sign in to continue')).toBeInTheDocument();
  expect(screen.queryByText('Riverside Townhouses')).not.toBeInTheDocument();
});

test('shows the GABE brand on the login screen', () => {
  render(<App />);
  expect(screen.getAllByText('GABE').length).toBeGreaterThan(0);
  expect(screen.getByText('Property Development OS')).toBeInTheDocument();
});

test('shows an error for invalid credentials', () => {
  render(<App />);
  fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'revity' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong-password' } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

  expect(screen.getByText('Invalid username or password.')).toBeInTheDocument();
});

test('renders dashboard with project cards after sign in', () => {
  signIn();
  expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Riverside Townhouses').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Horizon Tower').length).toBeGreaterThan(0);
});
