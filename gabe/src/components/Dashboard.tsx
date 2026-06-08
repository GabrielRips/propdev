import React from 'react';
import { Link } from 'react-router-dom';
import { projects, ProjectPhase, Project } from '../data/projects';
import { projectCommandData, ProjectHealthStatus } from '../data/project-insights';
import ProjectCard from './ProjectCard';
import AppShell from './AppShell';
import { useAuth } from '../auth/AuthContext';
import { canAccessProject } from '../data/roles';

const PHASE_SECTIONS = ['Planning Permit', 'Pre-sales', 'Construction', 'Sales'] as const;

const healthDot: Record<ProjectHealthStatus, string> = {
  on_track: 'bg-emerald-500',
  at_risk: 'bg-amber-500',
  critical: 'bg-red-500',
};

function fmtAUDShort(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function getProjectsInPhase(phase: ProjectPhase, visibleProjects: Project[]) {
  return visibleProjects
    .filter((p) => {
      const pct = p.phases[phase] ?? 0;
      return pct > 0 && pct < 100;
    })
    .map((p) => ({
      id: p.id,
      name: p.name,
      progress: p.phases[phase] ?? 0,
      health: projectCommandData[p.id]?.health.status ?? ('on_track' as ProjectHealthStatus),
    }));
}

export default function Dashboard() {
  const { user } = useAuth();
  const visibleProjects = projects.filter((p) => canAccessProject(user, p.id));

  // Portfolio roll-up — all derived from existing project data (no invented figures).
  const totalGdv = visibleProjects.reduce((t, p) => t + p.estimatedValue, 0);
  const totalUnits = visibleProjects.reduce((t, p) => t + p.totalUnits, 0);
  const health = visibleProjects.reduce(
    (acc, p) => {
      const s = projectCommandData[p.id]?.health.status ?? 'on_track';
      acc[s] += 1;
      return acc;
    },
    { on_track: 0, at_risk: 0, critical: 0 } as Record<ProjectHealthStatus, number>
  );

  const stats = [
    { label: 'Active projects', value: String(visibleProjects.length) },
    { label: 'Portfolio GDV', value: fmtAUDShort(totalGdv) },
    { label: 'Total dwellings', value: totalUnits.toLocaleString('en-AU') },
  ];

  if (visibleProjects.length === 0) {
    return (
      <AppShell
        title={`Welcome${user ? `, ${user.name.split(/\s|\(/)[0]}` : ''}`}
        subtitle="Your property development portfolio"
      >
        <div className="surface p-12 sm:p-16 text-center">
          <div className="text-4xl mb-3">🏗️</div>
          <h3 className="text-lg font-semibold text-gray-900">No projects yet</h3>
          <p className="text-sm text-gray-500 mt-1.5 max-w-md mx-auto">
            This is a clean slate. Once a project is added it appears here with its
            phases, feasibility, financials, construction and sales.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={`Welcome back, ${user?.name.split(/\s|\(/)[0] ?? ''}`}
      subtitle="Your property development portfolio at a glance"
    >
      {/* Portfolio summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="surface p-5">
            <p className="text-xs font-medium text-gray-400">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1 tracking-tight">{s.value}</p>
          </div>
        ))}
        <div className="surface p-5">
          <p className="text-xs font-medium text-gray-400">Project health</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />{health.on_track}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />{health.at_risk}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />{health.critical}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">On track · At risk · Critical</p>
        </div>
      </div>

      {/* Pipeline by phase */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Active across phases</h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-9">
        {PHASE_SECTIONS.map((phase) => {
          const phaseProjects = getProjectsInPhase(phase, visibleProjects);
          return (
            <div key={phase} className="surface p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">{phase}</p>
                {phaseProjects.length > 0 && (
                  <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                    {phaseProjects.length}
                  </span>
                )}
              </div>
              {phaseProjects.length > 0 ? (
                <ul className="mt-3 space-y-2.5">
                  {phaseProjects.map((p) => (
                    <li key={p.id}>
                      <Link to={`/project/${p.id}`} className="flex items-center gap-2 group">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${healthDot[p.health]}`} />
                        <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors truncate">
                          {p.name}
                        </span>
                        <span className="text-xs font-medium text-gray-400 flex-shrink-0 ml-auto">{p.progress}%</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-300 mt-3">No active projects</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Projects */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {visibleProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </AppShell>
  );
}
