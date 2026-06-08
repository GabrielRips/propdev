import React, { useEffect, useMemo, useState } from 'react';
import { useCollection } from '../data/useCollection';

const TODAY = '2026-06-08';

const DISCIPLINES = ['Arborist', 'Environmental', 'Soil', 'Noise', 'Heritage', 'Other'];

type ReportStatus = 'not_received' | 'draft' | 'final' | 'superseded';

interface ReportRecord {
  id: string;
  reportName: string;
  discipline: string;
  submittedBy?: string;
  submitterEmail?: string;
  submitterPhone?: string;
  dateReceived?: string;
  status: ReportStatus;
  dueDate?: string;
  notes?: string;
}

function formatDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function isOverdue(r: ReportRecord): boolean {
  return r.status === 'not_received' && !!r.dueDate && r.dueDate < TODAY;
}

// ─── Status badge ──────────────────────────────────────────────────────────────

const statusConfig: Record<ReportStatus, { label: string; className: string }> = {
  not_received: { label: 'Not Received', className: 'bg-gray-100 text-gray-500' },
  draft:        { label: 'Draft',        className: 'bg-amber-100 text-amber-700' },
  final:        { label: 'Final',        className: 'bg-emerald-100 text-emerald-700' },
  superseded:   { label: 'Superseded',   className: 'bg-gray-100 text-gray-400' },
};

function StatusBadge({ status }: { status: ReportStatus }) {
  const { label, className } = statusConfig[status];
  return <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${className}`}>{label}</span>;
}

// ─── Summary strip ──────────────────────────────────────────────────────────────

function SummaryPanel({ reports }: { reports: ReportRecord[] }) {
  const expected = reports.length;
  const received = reports.filter((r) => r.status !== 'not_received').length;
  const outstanding = reports.filter((r) => r.status === 'not_received').length;
  const overdue = reports.filter(isOverdue).length;

  const stats = [
    { label: 'Reports Expected', value: expected, color: 'text-gray-900' },
    { label: 'Reports Received', value: received, color: 'text-emerald-600' },
    { label: 'Outstanding', value: outstanding, color: outstanding > 0 ? 'text-amber-600' : 'text-gray-400' },
    { label: 'Overdue', value: overdue, color: overdue > 0 ? 'text-red-600' : 'text-gray-400' },
  ];

  return (
    <div className="surface bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="grid grid-cols-4 divide-x divide-gray-100">
        {stats.map((s) => (
          <div key={s.label} className="px-5 py-4">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Report modal (add / edit) ──────────────────────────────────────────────────

interface ReportModalProps {
  initial?: ReportRecord;
  onClose: () => void;
  onSave: (data: Omit<ReportRecord, 'id'>) => void;
}

const emptyForm: Omit<ReportRecord, 'id'> = {
  reportName: '',
  discipline: 'Arborist',
  submittedBy: '',
  submitterEmail: '',
  submitterPhone: '',
  dateReceived: '',
  status: 'not_received',
  dueDate: '',
  notes: '',
};

function ReportModal({ initial, onClose, onSave }: ReportModalProps) {
  const [form, setForm] = useState<Omit<ReportRecord, 'id'>>(
    initial ? { ...emptyForm, ...initial } : emptyForm
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    if (!form.reportName.trim()) return;
    onSave({
      ...form,
      reportName: form.reportName.trim(),
      discipline: form.discipline.trim() || 'Other',
    });
    onClose();
  }

  const inputClass = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelClass = 'text-xs font-medium text-gray-400 block mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{initial ? 'Edit report' : 'Add report'}</h2>
        </div>

        <div className="px-6 py-4 space-y-4 overflow-y-auto">
          <div>
            <label className={labelClass}>Report name *</label>
            <input className={inputClass} value={form.reportName} onChange={(e) => set('reportName', e.target.value)} placeholder="e.g. Arborist Report" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Discipline</label>
              <input className={inputClass} list="discipline-options" value={form.discipline} onChange={(e) => set('discipline', e.target.value)} placeholder="Discipline" />
              <datalist id="discipline-options">
                {DISCIPLINES.map((d) => <option key={d} value={d} />)}
              </datalist>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select className={inputClass} value={form.status} onChange={(e) => set('status', e.target.value as ReportStatus)}>
                <option value="not_received">Not Received</option>
                <option value="draft">Draft</option>
                <option value="final">Final</option>
                <option value="superseded">Superseded</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Submitted by</label>
            <input className={inputClass} value={form.submittedBy} onChange={(e) => set('submittedBy', e.target.value)} placeholder="Consultant / firm" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Submitter email</label>
              <input className={inputClass} type="email" value={form.submitterEmail} onChange={(e) => set('submitterEmail', e.target.value)} placeholder="name@example.com" />
            </div>
            <div>
              <label className={labelClass}>Submitter phone</label>
              <input className={inputClass} value={form.submitterPhone} onChange={(e) => set('submitterPhone', e.target.value)} placeholder="04xx xxx xxx" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Date received</label>
              <input className={inputClass} type="date" value={form.dateReceived} onChange={(e) => set('dateReceived', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Due date</label>
              <input className={inputClass} type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea className={`${inputClass} resize-none`} rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Optional notes" />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={!form.reportName.trim()} className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {initial ? 'Save changes' : 'Add report'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Reports table ──────────────────────────────────────────────────────────────

interface ReportsTableProps {
  reports: ReportRecord[];
  onMarkFinal: (id: string) => void;
  onEdit: (report: ReportRecord) => void;
  onDelete: (id: string) => void;
}

function ReportsTable({ reports, onMarkFinal, onEdit, onDelete }: ReportsTableProps) {
  return (
    <div className="surface bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Reports</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Report</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide hidden lg:table-cell">Submitted By</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Date</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {reports.map((report) => {
              const overdue = isOverdue(report);
              return (
                <tr key={report.id} className={`${overdue ? 'bg-red-50/40' : 'hover:bg-gray-50/60'} transition-colors`}>
                  <td className="px-5 py-3">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-900">{report.reportName}</span>
                        {overdue && <span className="text-[10px] font-semibold text-red-500 uppercase tracking-wide">Overdue</span>}
                      </div>
                      <span className="text-xs text-gray-400">{report.discipline}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm text-gray-600">{report.submittedBy || '—'}</span>
                  </td>

                  <td className="px-4 py-3 hidden md:table-cell">
                    {report.dateReceived ? (
                      <p className="text-sm text-gray-700">{formatDate(report.dateReceived)}</p>
                    ) : report.dueDate ? (
                      <div>
                        <p className="text-xs text-gray-400">Due</p>
                        <p className={`text-sm font-medium ${overdue ? 'text-red-600' : 'text-gray-600'}`}>{formatDate(report.dueDate)}</p>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-300">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge status={report.status} />
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      {report.status !== 'final' && (
                        <button
                          onClick={() => onMarkFinal(report.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Mark Final
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(report)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(report.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main tab ───────────────────────────────────────────────────────────────────

interface ConsultantsTabProps {
  projectId: string;
}

export default function ConsultantsTab({ projectId }: ConsultantsTabProps) {
  const reports = useCollection<ReportRecord>(`propdev:${projectId}:consultants`);
  const [showAdd, setShowAdd] = useState(false);
  const [editReport, setEditReport] = useState<ReportRecord | null>(null);

  const items = useMemo(() => reports.items, [reports.items]);

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add report
        </button>
      </div>

      <SummaryPanel reports={items} />

      {items.length === 0 ? (
        <div className="surface bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <p className="text-gray-400 text-sm">No consultant reports yet — add one</p>
        </div>
      ) : (
        <ReportsTable
          reports={items}
          onMarkFinal={(id) => reports.update(id, { status: 'final' })}
          onEdit={(r) => setEditReport(r)}
          onDelete={(id) => reports.remove(id)}
        />
      )}

      {showAdd && (
        <ReportModal
          onClose={() => setShowAdd(false)}
          onSave={(data) => reports.add(data)}
        />
      )}
      {editReport && (
        <ReportModal
          initial={editReport}
          onClose={() => setEditReport(null)}
          onSave={(data) => reports.update(editReport.id, data)}
        />
      )}
    </div>
  );
}
