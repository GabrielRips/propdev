import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './auth/AuthContext';
import { USERS } from './data/roles';
import Dashboard from './components/Dashboard';
import Planner from './components/Planner';
import AgenticDashboard from './components/AgenticDashboard';
import AssetPortal from './components/AssetPortal';
import InvestorPortal from './components/InvestorPortal';
import ConstructionPortal from './components/ConstructionPortal';
import FeasibilityPortal from './components/FeasibilityPortal';

// The data layer now talks to the backend; stub fetch so components mount
// against an empty API in tests.
beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  (global as any).fetch = jest.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => [],
    text: async () => '[]',
  }));
});

// ── Auth / login ──────────────────────────────────────────────────────────────
test('requires authentication before rendering the app', () => {
  render(<App />);
  expect(screen.getByText('Sign in to continue')).toBeInTheDocument();
});

test('shows the PropDev brand on the login screen', () => {
  render(<App />);
  expect(screen.getAllByText('PropDev').length).toBeGreaterThan(0);
  expect(screen.getByText('Property Development OS')).toBeInTheDocument();
});

// ── Smoke: every portal renders without crashing on empty data ──────────────────
function renderAuthed(node: React.ReactElement) {
  localStorage.setItem('propdev-token', 'test-token');
  localStorage.setItem('propdev-user', JSON.stringify(USERS[0]));
  return render(
    <AuthProvider>
      <MemoryRouter>{node}</MemoryRouter>
    </AuthProvider>
  );
}

describe('portals render against an empty backend', () => {
  test('Dashboard', () => { expect(() => renderAuthed(<Dashboard />)).not.toThrow(); });
  test('Planner', () => { expect(() => renderAuthed(<Planner />)).not.toThrow(); });
  test('AgenticDashboard', () => { expect(() => renderAuthed(<AgenticDashboard />)).not.toThrow(); });
  test('AssetPortal', () => { expect(() => renderAuthed(<AssetPortal />)).not.toThrow(); });
  test('InvestorPortal', () => { expect(() => renderAuthed(<InvestorPortal />)).not.toThrow(); });
  test('ConstructionPortal', () => { expect(() => renderAuthed(<ConstructionPortal />)).not.toThrow(); });
  test('FeasibilityPortal', () => { expect(() => renderAuthed(<FeasibilityPortal />)).not.toThrow(); });
});
