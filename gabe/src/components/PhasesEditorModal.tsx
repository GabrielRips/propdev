import React, { useEffect, useState } from 'react';
import { PROJECT_PHASES, ProjectPhase, PhaseProgress, Project } from '../data/projects';
import { updateProject } from '../data/projectStore';

export default function PhasesEditorModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const [values, setValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    PROJECT_PHASES.forEach((p) => { init[p] = project.phases[p] ?? 0; });
    return init;
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const setPhase = (phase: string, v: number) =>
    setValues((prev) => ({ ...prev, [phase]: Math.max(0, Math.min(100, v)) }));

  function save() {
    const phases: PhaseProgress = {};
    PROJECT_PHASES.forEach((p) => { if (values[p] > 0) phases[p as ProjectPhase] = values[p]; });
    updateProject(project.id, { phases });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-pop w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scaleIn" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Phase progress</h2>
            <p className="text-xs text-gray-400 mt-0.5">Set how far along each phase is</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4 space-y-3">
          {PROJECT_PHASES.map((phase) => (
            <div key={phase} className="flex items-center gap-3">
              <span className="text-sm text-gray-700 w-40 flex-shrink-0">{phase}</span>
              <input
                type="range" min={0} max={100} step={5}
                value={values[phase]}
                onChange={(e) => setPhase(phase, Number(e.target.value))}
                className="flex-1 accent-gray-900"
              />
              <div className="flex items-center gap-1 w-16 flex-shrink-0">
                <input
                  type="number" min={0} max={100}
                  value={values[phase]}
                  onChange={(e) => setPhase(phase, Number(e.target.value))}
                  className="w-12 text-sm text-right border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-400">%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 pb-5 pt-1 flex justify-end gap-2 sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={save} className="px-5 py-2 text-sm font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
