import React from 'react';
import { Link } from 'react-router-dom';
import { Project, PROJECT_PHASES, overallCompletion } from '../data/projects';
import { projectCommandData, ProjectHealthStatus } from '../data/project-insights';

const typeIcons: Record<string, string> = {
  'Townhouse Development': '🏘️',
  'Residential Tower': '🏢',
  'Subdivision': '🗺️',
};

const healthStyle: Record<ProjectHealthStatus, { dot: string; text: string; bg: string; label: string }> = {
  on_track: { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', label: 'On track' },
  at_risk: { dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50', label: 'At risk' },
  critical: { dot: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50', label: 'Critical' },
};

function formatAUD(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  return `$${(value / 1_000).toFixed(0)}K`;
}

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const overall = overallCompletion(project.phases);
  const health = projectCommandData[project.id]?.health.status ?? 'on_track';
  const hs = healthStyle[health];

  // Show the phases that are actively in progress (keeps the card scannable).
  const inProgress = PROJECT_PHASES.filter((p) => {
    const pct = project.phases[p] ?? 0;
    return pct > 0 && pct < 100;
  }).slice(0, 3);

  const overallColor = overall >= 60 ? 'bg-emerald-500' : overall >= 30 ? 'bg-blue-500' : 'bg-gray-400';

  return (
    <Link
      to={`/project/${project.id}`}
      className="group block surface surface-hover p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl flex-shrink-0">
            {typeIcons[project.type]}
          </div>
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {project.name}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {project.suburb} {project.state} · {project.type}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full flex-shrink-0 ${hs.bg} ${hs.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${hs.dot}`} />
          {hs.label}
        </span>
      </div>

      {/* Overall progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="font-medium text-gray-500">Overall progress</span>
          <span className="font-semibold text-gray-700">{overall}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div className={`h-2 rounded-full transition-all ${overallColor}`} style={{ width: `${overall}%` }} />
        </div>
        {inProgress.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {inProgress.map((phase) => (
              <span key={phase} className="text-[11px] font-medium text-gray-600 bg-gray-100 rounded-md px-2 py-0.5">
                {phase} {project.phases[phase]}%
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100 text-sm">
        <div>
          <p className="text-gray-400 text-[11px]">Est. value</p>
          <p className="font-semibold text-gray-800">{formatAUD(project.estimatedValue)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-[11px]">{project.type === 'Subdivision' ? 'Lots' : 'Units'}</p>
          <p className="font-semibold text-gray-800">{project.totalUnits}</p>
        </div>
        <div>
          <p className="text-gray-400 text-[11px]">Completion</p>
          <p className="font-semibold text-gray-800">
            {new Date(project.estimatedCompletion).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>
    </Link>
  );
}
