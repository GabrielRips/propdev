import React from 'react';
import { Link } from 'react-router-dom';
import { Project, PROJECT_PHASES, overallCompletion } from '../data/projects';

const phaseBarColors: Record<string, string> = {
  'Site Identification': 'bg-gray-400',
  'Feasibility': 'bg-blue-500',
  'Financing': 'bg-indigo-500',
  'Pre-sales': 'bg-purple-500',
  'Land Acquisition': 'bg-pink-500',
  'Architecture': 'bg-orange-500',
  'Planning Permit': 'bg-yellow-500',
  'Construction': 'bg-emerald-500',
  'Marketing': 'bg-teal-500',
  'Sales': 'bg-green-500',
};

const typeIcons: Record<string, string> = {
  'Townhouse Development': '🏘️',
  'Residential Tower': '🏢',
  'Subdivision': '🗺️',
};

function formatAUD(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  return `$${(value / 1_000).toFixed(0)}K`;
}

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const overall = overallCompletion(project.phases);
  const activePhases = PROJECT_PHASES
    .filter((phase) => (project.phases[phase] ?? 0) > 1);

  return (
    <Link to={`/project/${project.id}`} className="block bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {project.name}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {project.address}, {project.suburb} {project.state}
          </p>
        </div>
        <span className="text-2xl ml-3" title={project.type}>
          {typeIcons[project.type]}
        </span>
      </div>

      {/* Phase Progress Bars */}
      <div className="space-y-2 mb-4">
        {activePhases.map((phase) => {
          const pct = project.phases[phase]!;
          const done = pct === 100;
          return (
            <div key={phase}>
              <div className="flex justify-between items-center text-xs mb-0.5">
                <span className={done ? 'text-gray-400' : 'text-gray-600 font-medium'}>
                  {phase}
                </span>
                <span className={done ? 'text-gray-400' : 'text-gray-500'}>
                  {done ? 'Done' : `${pct}%`}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className={`${
                    done ? 'bg-gray-300' : phaseBarColors[phase]
                  } h-1.5 rounded-full transition-all`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall progress */}
      <div className="mb-4 pt-2 border-t border-gray-100">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span className="font-medium">Overall</span>
          <span>{overall}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              overall >= 60 ? 'bg-emerald-500' : overall >= 30 ? 'bg-blue-500' : 'bg-gray-400'
            }`}
            style={{ width: `${overall}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-gray-400 text-xs">Est. Value</p>
          <p className="font-semibold text-gray-800">{formatAUD(project.estimatedValue)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">
            {project.type === 'Subdivision' ? 'Lots' : 'Units'}
          </p>
          <p className="font-semibold text-gray-800">{project.totalUnits}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Est. Completion</p>
          <p className="font-semibold text-gray-800">
            {new Date(project.estimatedCompletion).toLocaleDateString('en-AU', {
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Recent Emails</p>
          <p className="font-semibold text-gray-800 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {project.recentEmails}
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-4 line-clamp-2">
        {project.description}
      </p>
    </Link>
  );
}
