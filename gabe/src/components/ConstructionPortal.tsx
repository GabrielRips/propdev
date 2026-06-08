import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from './AppShell';
import ConstructionTab from './ConstructionTab';
import { useProjects } from '../data/projectStore';
import { useAuth } from '../auth/AuthContext';
import { canAccessProject } from '../data/roles';

export default function ConstructionPortal() {
  const { user } = useAuth();
  const projects = useProjects();
  const visible = projects.filter((p) => canAccessProject(user, p.id) && (p.phases['Construction'] ?? 0) > 0);
  const [activeId, setActiveId] = useState(visible[0]?.id ?? '');
  const active = visible.find((p) => p.id === activeId);

  return (
    <AppShell title="Construction Hub" subtitle="Checklists, inspections, OH&S, defects, RFIs & progress photos">
      {visible.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">No projects in construction available to you.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {visible.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveId(p.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  p.id === activeId
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {p.name}
                <span className="ml-2 text-xs opacity-70">{p.phases['Construction'] ?? 0}%</span>
              </button>
            ))}
          </div>

          {active && (
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{active.name}</h2>
                <p className="text-sm text-gray-500">{active.address}, {active.suburb} {active.state}</p>
              </div>
              <Link to={`/project/${active.id}`} className="text-sm text-blue-600 hover:underline">
                Open project →
              </Link>
            </div>
          )}

          {active && <ConstructionTab projectId={active.id} />}
        </>
      )}
    </AppShell>
  );
}
