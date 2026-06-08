import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from './AppShell';
import FeasibilityTab from './FeasibilityTab';
import { useProjects } from '../data/projectStore';
import { feasibilityData } from '../data/feasibility-data';
import { useAuth } from '../auth/AuthContext';
import { canAccessProject } from '../data/roles';

function fmtShort(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export default function FeasibilityPortal() {
  const { user } = useAuth();
  const projects = useProjects();
  const visible = projects.filter((p) => canAccessProject(user, p.id) && feasibilityData[p.id]);
  const [activeId, setActiveId] = useState(visible[0]?.id ?? '');
  const active = visible.find((p) => p.id === activeId);

  // portfolio roll-up across visible projects
  const totalGdv = visible.reduce((t, p) => t + (feasibilityData[p.id]?.gdv ?? 0), 0);
  const totalProfit = visible.reduce((t, p) => t + (feasibilityData[p.id]?.profit ?? 0), 0);
  const avgMargin = visible.length
    ? visible.reduce((t, p) => t + (feasibilityData[p.id]?.marginOnCost ?? 0), 0) / visible.length
    : 0;

  return (
    <AppShell title="Feasibility Engine" subtitle="Development modelling — feasibility vs live performance">
      {visible.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">No feasibility models available to you.</p>
        </div>
      ) : (
        <>
          {/* Portfolio roll-up */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-400">Portfolio GDV</p>
              <p className="text-xl font-bold text-gray-900">{fmtShort(totalGdv)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-400">Forecast profit</p>
              <p className="text-xl font-bold text-emerald-600">{fmtShort(totalProfit)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-400">Avg margin on cost</p>
              <p className="text-xl font-bold text-gray-900">{avgMargin.toFixed(1)}%</p>
            </div>
          </div>

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
              </button>
            ))}
          </div>

          {active && (
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{active.name}</h2>
              <Link to={`/project/${active.id}`} className="text-sm text-blue-600 hover:underline">
                Open project →
              </Link>
            </div>
          )}

          {active && <FeasibilityTab projectId={active.id} />}
        </>
      )}
    </AppShell>
  );
}
