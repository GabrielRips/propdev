import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { PORTALS } from '../data/roles';
import logo from '../assets/logo.jpg';

interface AppShellProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  /** when false, renders content full width with no max-w container */
  wide?: boolean;
}

export default function AppShell({ title, subtitle, children, wide }: AppShellProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const portals = PORTALS.filter((p) => user?.portals.includes(p.id));

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="flex items-center gap-2.5">
              <img src={logo} alt="GABE" className="w-8 h-8 rounded-lg object-cover" />
              <span className="text-xl font-bold text-gray-900">GABE</span>
            </Link>
            <span className="hidden md:inline text-[10px] font-semibold text-teal-700 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded uppercase tracking-wide">
              Property Dev OS
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-1 text-sm">
            {portals.map((p) => (
              <Link
                key={p.id}
                to={p.path}
                className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                  isActive(p.path)
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {p.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user && (
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-gray-800 leading-tight">{user.name}</p>
                <p className="text-[10px] text-gray-400 leading-tight">{user.roleLabel}</p>
              </div>
            )}
            <button
              onClick={logout}
              className="text-xs font-medium text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-100 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* mobile portal scroller */}
        <div className="lg:hidden border-t border-gray-100 overflow-x-auto">
          <div className="flex gap-1 px-3 py-2 min-w-max">
            {portals.map((p) => (
              <Link
                key={p.id}
                to={p.path}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                  isActive(p.path) ? 'bg-gray-900 text-white' : 'text-gray-500 bg-gray-100'
                }`}
              >
                {p.icon} {p.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className={wide ? 'px-4 sm:px-6 lg:px-8 py-8' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
        {title && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
