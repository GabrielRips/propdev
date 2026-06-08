import React, { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectType } from '../data/projects';
import { addProject } from '../data/projectStore';

const STATES = ['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT'];
const TYPES: ProjectType[] = ['Townhouse Development', 'Residential Tower', 'Subdivision'];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const field = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';
const label = 'block text-xs font-medium text-gray-500 mb-1';

export default function CreateProjectModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [type, setType] = useState<ProjectType>('Townhouse Development');
  const [address, setAddress] = useState('');
  const [suburb, setSuburb] = useState('');
  const [state, setState] = useState('VIC');
  const [units, setUnits] = useState('');
  const [value, setValue] = useState('');
  const [startDate, setStartDate] = useState(today());
  const [completion, setCompletion] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const unitsLabel = type === 'Subdivision' ? 'Number of lots' : 'Number of units';

  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      const project = await addProject({
        name,
        type,
        address,
        suburb,
        state,
        totalUnits: Number(units) || 0,
        estimatedValue: Number(value) || 0,
        startDate: startDate || today(),
        estimatedCompletion: completion || '',
        description,
      });
      onClose();
      navigate(`/project/${project.id}`);
    } catch {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-2xl shadow-pop w-full max-w-xl max-h-[90vh] overflow-y-auto animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h2 className="text-base font-semibold text-gray-900">New project</h2>
            <p className="text-xs text-gray-400 mt-0.5">Add a development to your portfolio</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className={label}>Project name *</label>
            <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Riverside Townhouses" autoFocus />
          </div>

          <div>
            <label className={label}>Type</label>
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`text-xs font-medium rounded-lg border px-2 py-2 transition-colors ${
                    type === t ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {t.replace(' Development', '').replace('Residential ', '')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={label}>Street address</label>
            <input className={field} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="42 Lithgow Street" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Suburb</label>
              <input className={field} value={suburb} onChange={(e) => setSuburb(e.target.value)} placeholder="Abbotsford" />
            </div>
            <div>
              <label className={label}>State</label>
              <select className={field} value={state} onChange={(e) => setState(e.target.value)}>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>{unitsLabel}</label>
              <input className={field} type="number" min={0} value={units} onChange={(e) => setUnits(e.target.value)} placeholder="12" />
            </div>
            <div>
              <label className={label}>Est. value (GDV, AUD)</label>
              <input className={field} type="number" min={0} value={value} onChange={(e) => setValue(e.target.value)} placeholder="14400000" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Start date</label>
              <input className={field} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className={label}>Est. completion</label>
              <input className={field} type="date" value={completion} onChange={(e) => setCompletion(e.target.value)} />
            </div>
          </div>

          <div>
            <label className={label}>Description (optional)</label>
            <textarea className={`${field} resize-none`} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short summary of the development…" />
          </div>
        </div>

        <div className="px-6 pb-5 pt-1 flex justify-end gap-2 sticky bottom-0 bg-white">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim() || saving}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {saving ? 'Creating…' : 'Create project'}
          </button>
        </div>
      </form>
    </div>
  );
}
