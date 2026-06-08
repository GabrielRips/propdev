import React, { useEffect, useState } from 'react';
import { useCollection } from '../data/useCollection';

// ─── Record type ────────────────────────────────────────────────────────────────

type PermitStatus = 'not_lodged' | 'lodged' | 'rfi' | 'approved';

interface PermitRecord {
  id: string;
  name: string;
  authority: string;
  status: PermitStatus;
  lodgementDate?: string;
  approvalDate?: string;
  expiryDate?: string;
  fees?: number;
  notes?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAUD(n: number): string {
  if (n === 0) return '—';
  return n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Status pill ────────────────────────────────────────────────────────────────

const statusConfig: Record<PermitStatus, { label: string; className: string }> = {
  not_lodged: { label: 'Not Lodged', className: 'bg-gray-100 text-gray-500' },
  lodged:     { label: 'Lodged',     className: 'bg-blue-100 text-blue-700' },
  rfi:        { label: 'RFI',        className: 'bg-amber-100 text-amber-700' },
  approved:   { label: 'Approved',   className: 'bg-emerald-100 text-emerald-700' },
};

const statusOptions: { value: PermitStatus; label: string }[] = [
  { value: 'not_lodged', label: 'Not Lodged' },
  { value: 'lodged', label: 'Lodged' },
  { value: 'rfi', label: 'RFI Received' },
  { value: 'approved', label: 'Approved' },
];

function StatusPill({ status }: { status: PermitStatus }) {
  const { label, className } = statusConfig[status];
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${className}`}>{label}</span>;
}

// ─── Add / Edit Modal ────────────────────────────────────────────────────────────

const inputClass =
  'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';

function PermitModal({
  initial,
  onClose,
  onSubmit,
}: {
  initial?: PermitRecord;
  onClose: () => void;
  onSubmit: (data: Omit<PermitRecord, 'id'>) => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [authority, setAuthority] = useState(initial?.authority ?? '');
  const [status, setStatus] = useState<PermitStatus>(initial?.status ?? 'not_lodged');
  const [lodgementDate, setLodgementDate] = useState(initial?.lodgementDate ?? '');
  const [approvalDate, setApprovalDate] = useState(initial?.approvalDate ?? '');
  const [expiryDate, setExpiryDate] = useState(initial?.expiryDate ?? '');
  const [fees, setFees] = useState(initial?.fees != null ? String(initial.fees) : '');
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
    if (!name.trim()) return;
    const feesNum = parseFloat(fees);
    onSubmit({
      name: name.trim(),
      authority: authority.trim(),
      status,
      lodgementDate: lodgementDate || undefined,
      approvalDate: approvalDate || undefined,
      expiryDate: expiryDate || undefined,
      fees: isNaN(feesNum) ? undefined : feesNum,
      notes: notes.trim() || undefined,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">{initial ? 'Edit permit/application' : 'Add permit/application'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-400 block mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Planning Permit Application"
                className={inputClass}
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 block mb-1">Authority</label>
              <input
                type="text"
                value={authority}
                onChange={(e) => setAuthority(e.target.value)}
                placeholder="City of Melbourne"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 block mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as PermitStatus)} className={inputClass}>
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1">Lodgement date</label>
                <input type="date" value={lodgementDate} onChange={(e) => setLodgementDate(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1">Approval date</label>
                <input type="date" value={approvalDate} onChange={(e) => setApprovalDate(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1">Expiry date</label>
                <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1">Fees (AUD)</label>
                <input type="number" min="0" value={fees} onChange={(e) => setFees(e.target.value)} placeholder="0" className={inputClass} />
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
              disabled={!name.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {initial ? 'Save changes' : 'Add permit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

interface PermitTabProps {
  projectId: string;
}

export default function PermitTab({ projectId }: PermitTabProps) {
  const permits = useCollection<PermitRecord>(`propdev:${projectId}:permits`);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<PermitRecord | null>(null);

  const addButton = (
    <button
      onClick={() => setShowAdd(true)}
      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      Add permit/application
    </button>
  );

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            Permits &amp; Applications
            {permits.items.length > 0 && (
              <span className="ml-2 text-xs font-normal text-gray-400">{permits.items.length}</span>
            )}
          </h3>
          {addButton}
        </div>

        {permits.items.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-gray-400">No permits or applications yet — add one</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {permits.items.map((permit) => (
              <li key={permit.id} className="group px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900">{permit.name}</p>
                      <StatusPill status={permit.status} />
                    </div>
                    {permit.authority && (
                      <p className="text-xs text-gray-500 mt-0.5">{permit.authority}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
                      {permit.lodgementDate && (
                        <span><span className="text-gray-400">Lodged:</span> {formatDate(permit.lodgementDate)}</span>
                      )}
                      {permit.approvalDate && (
                        <span><span className="text-gray-400">Approved:</span> {formatDate(permit.approvalDate)}</span>
                      )}
                      {permit.expiryDate && (
                        <span><span className="text-gray-400">Expires:</span> {formatDate(permit.expiryDate)}</span>
                      )}
                      {permit.fees != null && permit.fees > 0 && (
                        <span><span className="text-gray-400">Fees:</span> {formatAUD(permit.fees)}</span>
                      )}
                    </div>
                    {permit.notes && (
                      <p className="text-xs text-gray-400 mt-2 whitespace-pre-wrap">{permit.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setEditing(permit)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => permits.remove(permit.id)}
                      aria-label={`Delete ${permit.name}`}
                      title="Delete permit"
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
        <PermitModal onClose={() => setShowAdd(false)} onSubmit={(data) => permits.add(data)} />
      )}
      {editing && (
        <PermitModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={(data) => permits.update(editing.id, data)}
        />
      )}
    </>
  );
}
