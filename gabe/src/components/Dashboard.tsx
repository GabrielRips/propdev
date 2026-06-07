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

  return (
    <AppShell title="Dashboard" subtitle="Overview of all property development projects">
      {/* Phase Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {PHASE_SECTIONS.map((phase) => {
          const phaseProjects = getProjectsInPhase(phase, visibleProjects);
          return (
            <div key={phase} className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm font-semibold text-gray-700">{phase}</p>
              {phaseProjects.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {phaseProjects.map((p) => (
                    <li key={p.id}>
                      <Link to={`/project/${p.id}`} className="flex items-center gap-2 group">
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${healthDot[p.health]}`} />
                        <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors truncate">
                          {p.name}
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-auto">{p.progress}%</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400 mt-3 italic">No active projects</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {visibleProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </AppShell>
  );
}
