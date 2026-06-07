import React, { FormEvent, useState, ReactElement } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ProjectDetail from './components/ProjectDetail';
import Planner from './components/Planner';
import AgenticDashboard from './components/AgenticDashboard';
import ConstructionPortal from './components/ConstructionPortal';
import FeasibilityPortal from './components/FeasibilityPortal';
import AssetPortal from './components/AssetPortal';
import InvestorPortal from './components/InvestorPortal';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { Portal, canAccessPortal, USERS } from './data/roles';
import logo from './assets/logo.jpg';

function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!login(username, password)) {
      setError('Invalid username or password.');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <section className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-xl p-7">
        <div className="flex items-center gap-3 mb-1">
          <img src={logo} alt="GABE" className="w-10 h-10 rounded-lg object-cover" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-none">GABE</h1>
            <p className="text-[11px] text-teal-700 font-semibold uppercase tracking-wide mt-1">
              Property Development OS
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-6">Sign in to continue</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              id="username" name="username" type="text" autoComplete="username"
              value={username} onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password" name="password" type="password" autoComplete="current-password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Sign in
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Demo roles (click to fill)</p>
          <ul className="space-y-1">
            {USERS.map((u) => (
              <li key={u.username} className="flex items-center justify-between text-xs">
                <span className="text-gray-600">{u.roleLabel}</span>
                <button
                  type="button"
                  onClick={() => { setUsername(u.username); setPassword(u.password); }}
                  className="font-mono text-gray-400 hover:text-blue-600"
                >
                  {u.username} / {u.password}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

function RequirePortal({ portal, children }: { portal: Portal; children: ReactElement }) {
  const { user } = useAuth();
  return canAccessPortal(user, portal) ? children : <Navigate to="/" replace />;
}

function AuthedApp() {
  const { user } = useAuth();
  if (!user) return <LoginScreen />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/project/:projectId" element={<ProjectDetail />} />
        <Route path="/planner" element={<RequirePortal portal="planner"><Planner /></RequirePortal>} />
        <Route path="/agentic" element={<RequirePortal portal="agentic"><AgenticDashboard /></RequirePortal>} />
        <Route path="/feasibility" element={<RequirePortal portal="feasibility"><FeasibilityPortal /></RequirePortal>} />
        <Route path="/construction" element={<RequirePortal portal="construction"><ConstructionPortal /></RequirePortal>} />
        <Route path="/assets" element={<RequirePortal portal="asset"><AssetPortal /></RequirePortal>} />
        <Route path="/investor" element={<RequirePortal portal="investor"><InvestorPortal /></RequirePortal>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthedApp />
    </AuthProvider>
  );
}
