import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { PORTALS } from '../data/roles';
import logo from '../assets/logo.jpg';

interface AppShellProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  wide?: boolean;
}

function initials(name: string): string {
  return name
    .replace(/\(.*?\)/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export default function AppShell({ title, subtitle, actions, children, wide }: AppShellProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const portals = PORTALS.filter((p) => user?.portals.includes(p.id));

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src={logo}
                alt="PropDev"
                className="w-9 h-9 rounded-xl object-cover ring-1 ring-gray-200 group-hover:ring-gray-300 transition"
              />
              <div className="leading-none">
                <span className="block text-[17px] font-bold text-gray-900 tracking-tight">PropDev</span>
                <span className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mt-0.5">
                  Property Dev OS
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-0.5 text-sm">
            {portals.map((p) => {
              const active = isActive(p.path);
              return (
                <Link
                  key={p.id}
                  to={p.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                    active
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className={active ? 'opacity-100' : 'opacity-70'}>{p.icon}</span>
                  {p.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            {user && (
              <div className="hidden sm:flex items-center gap-2.5 pl-1">
                <div className="text-right leading-tight">
                  <p className="text-xs font-semibold text-gray-800">{user.name}</p>
                  <p className="text-[10px] text-gray-400">{user.roleLabel}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-gray-900 text-white text-xs font-semibold flex items-center justify-center">
                  {initials(user.name)}
                </div>
              </div>
            )}
            <button
              onClick={logout}
              title="Sign out"
              className="text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg p-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H2.25" />
              </svg>
            </button>
          </div>
        </div>

        {/* mobile portal scroller */}
        <div className="lg:hidden border-t border-gray-100 overflow-x-auto">
          <div className="flex gap-1.5 px-3 py-2 min-w-max">
            {portals.map((p) => (
              <Link
                key={p.id}
                to={p.path}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive(p.path) ? 'bg-gray-900 text-white' : 'text-gray-600 bg-gray-100'
                }`}
              >
                <span>{p.icon}</span> {p.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className={wide ? 'px-4 sm:px-6 lg:px-8 py-8' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
        {(title || actions) && (
          <div className="mb-7 flex items-end justify-between gap-4 flex-wrap">
            <div>
              {title && <h1 className="text-[26px] font-bold text-gray-900 tracking-tight">{title}</h1>}
              {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        )}
        <div className="animate-fadeIn">{children}</div>
      </main>
    </div>
  );
}
