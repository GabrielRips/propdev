import React, { useEffect, useState } from 'react';
import { useCollection } from '../data/useCollection';

// ─── Record type ────────────────────────────────────────────────────────────────

type UtilityKind = 'Electricity' | 'Water' | 'Gas' | 'Other';
type UtilityStatus = 'not_applied' | 'applied' | 'approved' | 'energised' | 'connected';

interface UtilityRecord {
  id: string;
  kind: UtilityKind;
  provider: string;
  status: UtilityStatus;
  applicationNo?: string;
  feesPaid?: number;
  notes?: string;
  date?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAUD(n: number): string {
  if (n === 0) return '—';
  return n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

const kindIcon: Record<UtilityKind, string> = {
  Electricity: '⚡',
  Water: '💧',
  Gas: '🔥',
  Other: '🔌',
};

const kindOptions: UtilityKind[] = ['Electricity', 'Water', 'Gas', 'Other'];

// ─── Status pill ────────────────────────────────────────────────────────────────

const statusConfig: Record<UtilityStatus, { label: string; className: string }> = {
  not_applied: { label: 'Not Applied', className: 'bg-gray-100 text-gray-500' },
  applied:     { label: 'Applied',     className: 'bg-amber-100 text-amber-700' },
  approved:    { label: 'Approved',    className: 'bg-blue-100 text-blue-700' },
  energised:   { label: 'Energised',   className: 'bg-emerald-100 text-emerald-700' },
  connected:   { label: 'Connected',   className: 'bg-emerald-100 text-emerald-700' },
};

const statusOptions: { value: UtilityStatus; label: string }[] = [
  { value: 'not_applied', label: 'Not Applied' },
  { value: 'applied', label: 'Applied' },
  { value: 'approved', label: 'Approved' },
  { value: 'energised', label: 'Energised' },
  { value: 'connected', label: 'Connected' },
];

function StatusPill({ status }: { status: UtilityStatus }) {
  const { label, className } = statusConfig[status];
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${className}`}>{label}</span>;
}

// ─── Add / Edit Modal ────────────────────────────────────────────────────────────

const inputClass =
  'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';

function UtilityModal({
  initial,
  onClose,
  onSubmit,
}: {
  initial?: UtilityRecord;
  onClose: () => void;
  onSubmit: (data: Omit<UtilityRecord, 'id'>) => void;
}) {
  const [kind, setKind] = useState<UtilityKind>(initial?.kind ?? 'Electricity');
  const [provider, setProvider] = useState(initial?.provider ?? '');
  const [status, setStatus] = useState<UtilityStatus>(initial?.status ?? 'not_applied');
  const [applicationNo, setApplicationNo] = useState(initial?.applicationNo ?? '');
  const [feesPaid, setFeesPaid] = useState(initial?.feesPaid != null ? String(initial.feesPaid) : '');
  const [date, setDate] = useState(initial?.date ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!provider.trim()) return;
    const feesNum = parseFloat(feesPaid);
    onSubmit({
      kind,
      provider: provider.trim(),
      status,
      applicationNo: applicationNo.trim() || undefined,
      feesPaid: isNaN(feesNum) ? undefined : feesNum,
      date: date || undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">{initial ? 'Edit utility connection' : 'Add utility connection'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-400 block mb-1">Kind</label>
              <select value={kind} onChange={(e) => setKind(e.target.value as UtilityKind)} className={inputClass}>
                {kindOptions.map((k) => (
                  <option key={k} value={k}>{kindIcon[k]} {k}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 block mb-1">
                Provider <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="AusNet Services"
                className={inputClass}
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 block mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as UtilityStatus)} className={inputClass}>
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1">Application No.</label>
                <input type="text" value={applicationNo} onChange={(e) => setApplicationNo(e.target.value)} placeholder="APP-12345" className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1">Fees paid (AUD)</label>
                <input type="number" min="0" value={feesPaid} onChange={(e) => setFeesPaid(e.target.value)} placeholder="0" className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1">Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 block mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Any additional details…"
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
          <div className="px-6 pb-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!provider.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {initial ? 'Save changes' : 'Add connection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

interface AuthoritiesTabProps {
  projectId: string;
}

export default function AuthoritiesTab({ projectId }: AuthoritiesTabProps) {
  const utilities = useCollection<UtilityRecord>(`propdev:${projectId}:utilities`);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<UtilityRecord | null>(null);

  const addButton = (
    <button
      onClick={() => setShowAdd(true)}
      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      Add utility connection
    </button>
  );

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            Utilities
            {utilities.items.length > 0 && (
              <span className="ml-2 text-xs font-normal text-gray-400">{utilities.items.length}</span>
            )}
          </h3>
          {addButton}
        </div>

        {utilities.items.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-gray-400">No utility connections yet — add one</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {utilities.items.map((util) => (
              <li key={util.id} className="group px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span className="text-xl mt-0.5 flex-shrink-0" aria-hidden>{kindIcon[util.kind]}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900">{util.provider}</p>
                        <StatusPill status={util.status} />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{util.kind}</p>
                      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
                        {util.applicationNo && (
                          <span><span className="text-gray-400">App No:</span> {util.applicationNo}</span>
                        )}
                        {util.feesPaid != null && util.feesPaid > 0 && (
                          <span><span className="text-gray-400">Fees:</span> {formatAUD(util.feesPaid)}</span>
                        )}
                        {util.date && (
                          <span><span className="text-gray-400">Date:</span> {formatDate(util.date)}</span>
                        )}
                      </div>
                      {util.notes && (
                        <p className="text-xs text-gray-400 mt-2 whitespace-pre-wrap">{util.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setEditing(util)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => utilities.remove(util.id)}
                      aria-label={`Delete ${util.provider}`}
                      title="Delete connection"
                      className="inline-flex items-center justify-center w-7 h-7 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showAdd && (
        <UtilityModal onClose={() => setShowAdd(false)} onSubmit={(data) => utilities.add(data)} />
      )}
      {editing && (
        <UtilityModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={(data) => utilities.update(editing.id, data)}
        />
      )}
    </>
  );
}
