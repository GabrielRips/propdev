import React, { useState, useEffect, useMemo } from 'react';
import {
  getConstructionData,
  STANDARD_STAGES,
  ChecklistStage,
  Inspection,
  OHSDocument,
  Defect,
  RFI,
  ProgressPhoto,
} from '../data/construction-data';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatAUD(n: number): string {
  return '$' + n.toLocaleString('en-AU');
}

const TODAY = new Date('2026-06-07T00:00:00');

function daysUntil(d: string): number {
  const target = new Date(d + 'T00:00:00').getTime();
  return Math.round((target - TODAY.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── Generic Modal Shell (Escape-to-close) ──────────────────────────────────────

function ModalShell({
  title, subtitle, onClose, children, footer, maxWidth = 'max-w-lg',
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[88vh] flex flex-col`} onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5 truncate">{subtitle}</p>}
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

// ─── PDF / Certificate Preview Modal ────────────────────────────────────────────

function PdfModal({ fileName, onClose }: { fileName: string; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-800 mb-1 break-all">{fileName}</p>
        <p className="text-sm text-gray-400 mb-6">Certificate preview would be shown here</p>
        <button onClick={onClose} className="px-5 py-2 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
          Close
        </button>
      </div>
    </div>
  );
}

// ─── Shared status pill ─────────────────────────────────────────────────────────

function Pill({ tone, children }: { tone: 'green' | 'amber' | 'red' | 'gray' | 'blue'; children: React.ReactNode }) {
  const map: Record<string, string> = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    gray: 'bg-gray-100 text-gray-600 border-gray-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full border ${map[tone]}`}>
      {children}
    </span>
  );
}

// ─── KPI card ───────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accent}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Section header ─────────────────────────────────────────────────────────────

function SectionHeader({ icon, title, count, action }: { icon: string; title: string; count?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {count && <span className="text-xs text-gray-400">{count}</span>}
      </div>
      {action}
    </div>
  );
}

// ─── Supervisor Checklist ────────────────────────────────────────────────────────

function StageCard({
  stage, checked, onToggle,
}: {
  stage: ChecklistStage;
  checked: Set<string>;
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const done = stage.items.filter((i) => checked.has(i.id)).length;
  const total = stage.items.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const complete = done === total && total > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-5 py-3.5 flex items-center gap-3 text-left hover:bg-gray-50/60 transition-colors"
      >
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${complete ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
          {complete ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : stage.number}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900 truncate">{stage.name}</span>
            {complete && <Pill tone="green">Complete</Pill>}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-xs">
              <div className={`h-full rounded-full transition-all ${complete ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">{done}/{total}</span>
          </div>
        </div>
        <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-4 border-t border-gray-100 pt-2">
          <ul className="space-y-0.5">
            {stage.items.map((item) => {
              const isOn = checked.has(item.id);
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onToggle(item.id)}
                    className="w-full flex items-center gap-3 py-1.5 px-1 rounded-lg hover:bg-gray-50 text-left transition-colors"
                  >
                    <span className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isOn ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white'}`}>
                      {isOn && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <span className={`text-sm ${isOn ? 'text-gray-500 line-through' : 'text-gray-700'}`}>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Inspections ─────────────────────────────────────────────────────────────────

const inspectionPill: Record<Inspection['status'], { tone: 'green' | 'amber' | 'red'; label: string }> = {
  passed: { tone: 'green', label: 'Passed' },
  pending: { tone: 'amber', label: 'Pending' },
  failed: { tone: 'red', label: 'Failed' },
};

function InspectionsCard({ inspections, onOpenCert }: { inspections: Inspection[]; onOpenCert: (f: string) => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {inspections.length === 0 ? (
        <p className="px-5 py-8 text-sm text-gray-400 italic text-center">No inspections logged yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Type</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Inspector</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Date</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {inspections.map((ins) => {
                const p = inspectionPill[ins.status];
                return (
                  <tr key={ins.id} className="hover:bg-gray-50/60 transition-colors align-top">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-gray-900">{ins.type}</p>
                      {ins.notes && <p className="text-xs text-gray-400 mt-0.5 max-w-xs">{ins.notes}</p>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-sm text-gray-700">{ins.inspector}</p>
                      <p className="text-xs text-gray-400">{ins.organisation}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-sm text-gray-600">{formatDate(ins.date)}</span>
                    </td>
                    <td className="px-4 py-3"><Pill tone={p.tone}>{p.label}</Pill></td>
                    <td className="px-4 py-3 text-right">
                      {ins.certificate ? (
                        <button onClick={() => onOpenCert(ins.certificate!)} className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline">
                          <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                          Certificate
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── OH&S Documents ──────────────────────────────────────────────────────────────

const ohsBadge: Record<OHSDocument['type'], string> = {
  SWMS: 'bg-orange-50 text-orange-700 border-orange-200',
  MSDS: 'bg-purple-50 text-purple-700 border-purple-200',
  WorkCover: 'bg-blue-50 text-blue-700 border-blue-200',
  Induction: 'bg-teal-50 text-teal-700 border-teal-200',
  'White Card': 'bg-slate-100 text-slate-700 border-slate-200',
  Insurance: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

function OhsCard({ ohs }: { ohs: OHSDocument[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {ohs.length === 0 ? (
        <p className="px-5 py-8 text-sm text-gray-400 italic text-center">No safety documents on file yet</p>
      ) : (
        <ul className="divide-y divide-gray-50">
          {ohs.map((doc) => {
            const days = doc.expiry ? daysUntil(doc.expiry) : null;
            const expiringSoon = days !== null && days <= 60;
            const expired = days !== null && days < 0;
            return (
              <li key={doc.id} className="px-5 py-3 flex items-start gap-3 hover:bg-gray-50/60 transition-colors">
                <span className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-md border ${ohsBadge[doc.type]}`}>
                  {doc.type}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{doc.party} · {formatDate(doc.date)}</p>
                </div>
                {doc.expiry && (
                  <span className={`flex-shrink-0 text-xs font-medium ${expired ? 'text-red-600' : expiringSoon ? 'text-amber-600' : 'text-gray-400'}`}>
                    {expired ? 'Expired ' : 'Expires '}{formatDate(doc.expiry)}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ─── Defects ─────────────────────────────────────────────────────────────────────

const defectPill: Record<Defect['status'], { tone: 'gray' | 'amber' | 'green'; label: string }> = {
  open: { tone: 'gray', label: 'Open' },
  sent: { tone: 'amber', label: 'Sent to contractor' },
  signed_off: { tone: 'green', label: 'Signed off' },
};

function LogDefectModal({ onClose, onAdd }: { onClose: () => void; onAdd: (d: { location: string; description: string; contractor: string }) => void }) {
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [contractor, setContractor] = useState('');
  const valid = location.trim() && description.trim() && contractor.trim();

  function submit() {
    if (!valid) return;
    onAdd({ location: location.trim(), description: description.trim(), contractor: contractor.trim() });
    onClose();
  }

  return (
    <ModalShell
      title="Log Defect"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={submit} disabled={!valid} className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Log defect</button>
        </>
      }
    >
      <div className="px-6 py-5 space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-400 block mb-1">Location</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Unit 4 — Bathroom" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-400 block mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Describe the defect…" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-400 block mb-1">Contractor</label>
          <input value={contractor} onChange={(e) => setContractor(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Responsible contractor" />
        </div>
      </div>
    </ModalShell>
  );
}

function DefectsCard({
  defects, onSend, onSignOff, onOpenLog,
}: {
  defects: Defect[];
  onSend: (id: string) => void;
  onSignOff: (id: string) => void;
  onOpenLog: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {defects.length === 0 ? (
        <p className="px-5 py-8 text-sm text-gray-400 italic text-center">No defects logged yet</p>
      ) : (
        <ul className="divide-y divide-gray-50">
          {defects.map((d) => {
            const p = defectPill[d.status];
            return (
              <li key={d.id} className="px-5 py-4 hover:bg-gray-50/60 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-900">{d.location}</span>
                      {d.hasPhoto && <span title="Photo attached">📷</span>}
                      <Pill tone={p.tone}>{p.label}</Pill>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{d.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {d.contractor} · Raised {formatDate(d.raisedDate)}
                      {d.signedOffDate && <span className="text-emerald-600"> · Signed off {formatDate(d.signedOffDate)}</span>}
                    </p>
                  </div>
                </div>
                {d.status !== 'signed_off' && (
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {d.status !== 'sent' && (
                      <button onClick={() => onSend(d.id)} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                        Send to contractor
                      </button>
                    )}
                    <button onClick={() => onSignOff(d.id)} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors">
                      📷 Photo sign-off
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ─── RFIs ────────────────────────────────────────────────────────────────────────

function NewRfiModal({ onClose, onAdd }: { onClose: () => void; onAdd: (r: { subject: string; contractor: string; contractorPhone: string }) => void }) {
  const [subject, setSubject] = useState('');
  const [contractor, setContractor] = useState('');
  const [contractorPhone, setContractorPhone] = useState('');
  const valid = subject.trim() && contractor.trim();

  function submit() {
    if (!valid) return;
    onAdd({ subject: subject.trim(), contractor: contractor.trim(), contractorPhone: contractorPhone.trim() });
    onClose();
  }

  return (
    <ModalShell
      title="New RFI"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={submit} disabled={!valid} className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Send RFI</button>
        </>
      }
    >
      <div className="px-6 py-5 space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-400 block mb-1">Subject</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="What do you need to confirm?" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-400 block mb-1">Contractor</label>
          <input value={contractor} onChange={(e) => setContractor(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Who is this for?" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-400 block mb-1">Phone</label>
          <input value={contractorPhone} onChange={(e) => setContractorPhone(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+61 …" />
        </div>
      </div>
    </ModalShell>
  );
}

function RfisCard({ rfis }: { rfis: RFI[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {rfis.length === 0 ? (
        <p className="px-5 py-8 text-sm text-gray-400 italic text-center">No RFIs raised yet</p>
      ) : (
        <ul className="divide-y divide-gray-50">
          {rfis.map((r) => {
            const responded = r.status === 'responded';
            return (
              <li key={r.id} className="px-5 py-4 hover:bg-gray-50/60 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-900">{r.subject}</span>
                      <Pill tone={responded ? 'green' : 'amber'}>{responded ? 'Responded' : 'Awaiting'}</Pill>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {r.contractor} · {r.contractorPhone} · Sent {formatDate(r.sentDate)}
                      {responded && r.responseDate && <span> · Responded {formatDate(r.responseDate)}</span>}
                    </p>
                    {responded && r.note && <p className="text-sm text-gray-600 mt-1.5 italic">{r.note}</p>}
                  </div>
                  {responded && r.quotedAmount !== undefined && (
                    <div className="flex-shrink-0 text-right">
                      <p className="text-[11px] text-gray-400 uppercase tracking-wide">Quoted</p>
                      <p className="text-sm font-semibold text-gray-900">{formatAUD(r.quotedAmount)}</p>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ─── Progress Photos ─────────────────────────────────────────────────────────────

function PhotosGrid({ photos }: { photos: ProgressPhoto[] }) {
  if (photos.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-8 text-center">
        <p className="text-sm text-gray-400 italic">No progress photos uploaded yet</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((ph) => (
        <div key={ph.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className={`aspect-video bg-gradient-to-br ${ph.tone} relative`}>
            <span className="absolute top-2 left-2 inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full bg-white/80 text-gray-700 backdrop-blur-sm">
              {ph.stage}
            </span>
          </div>
          <div className="px-3 py-2.5">
            <p className="text-sm font-medium text-gray-900 leading-snug">{ph.caption}</p>
            <p className="text-xs text-gray-400 mt-1">{ph.uploadedBy} · {formatDate(ph.date)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────────

export default function ConstructionTab({ projectId }: { projectId: string }) {
  const data = useMemo(() => getConstructionData(projectId), [projectId]);

  // Checklist state (seeded from completedItems)
  const [checked, setChecked] = useState<Set<string>>(() => new Set(data.completedItems));
  // Defects + RFIs are interactive
  const [defects, setDefects] = useState<Defect[]>(data.defects);
  const [rfis, setRfis] = useState<RFI[]>(data.rfis);
  // Modals
  const [openCert, setOpenCert] = useState<string | null>(null);
  const [logDefectOpen, setLogDefectOpen] = useState(false);
  const [newRfiOpen, setNewRfiOpen] = useState(false);

  // Reset interactive state when project changes
  useEffect(() => {
    setChecked(new Set(data.completedItems));
    setDefects(data.defects);
    setRfis(data.rfis);
  }, [data]);

  function toggleItem(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function sendDefect(id: string) {
    setDefects((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'sent' } : d)));
  }

  function signOffDefect(id: string) {
    const today = TODAY.toISOString().slice(0, 10);
    setDefects((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'signed_off', signedOffDate: today, hasPhoto: true } : d)));
  }

  function addDefect(input: { location: string; description: string; contractor: string }) {
    const today = TODAY.toISOString().slice(0, 10);
    const newDefect: Defect = {
      id: `def-new-${Date.now()}`,
      location: input.location,
      description: input.description,
      contractor: input.contractor,
      raisedDate: today,
      status: 'open',
      hasPhoto: false,
    };
    setDefects((prev) => [newDefect, ...prev]);
  }

  function addRfi(input: { subject: string; contractor: string; contractorPhone: string }) {
    const today = TODAY.toISOString().slice(0, 10);
    const newRfi: RFI = {
      id: `rfi-new-${Date.now()}`,
      subject: input.subject,
      contractor: input.contractor,
      contractorPhone: input.contractorPhone,
      sentDate: today,
      status: 'awaiting',
    };
    setRfis((prev) => [newRfi, ...prev]);
  }

  // Derived summary
  const totalItems = STANDARD_STAGES.reduce((sum, s) => sum + s.items.length, 0);
  const completedCount = STANDARD_STAGES.reduce(
    (sum, s) => sum + s.items.filter((i) => checked.has(i.id)).length, 0,
  );
  const checklistPct = totalItems === 0 ? 0 : Math.round((completedCount / totalItems) * 100);

  const passedInspections = data.inspections.filter((i) => i.status === 'passed').length;
  const pendingInspections = data.inspections.filter((i) => i.status === 'pending').length;
  const openDefects = defects.filter((d) => d.status !== 'signed_off').length;
  const openRfis = rfis.filter((r) => r.status === 'awaiting').length;

  return (
    <div className="space-y-6">
      {/* ── Header summary strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Checklist" value={`${checklistPct}%`} sub={`${completedCount} of ${totalItems} items`} accent="text-blue-600" />
        <KpiCard label="Inspections" value={`${passedInspections}`} sub={`${pendingInspections} pending`} accent="text-emerald-600" />
        <KpiCard label="Open Defects" value={`${openDefects}`} sub={`${defects.length} total`} accent={openDefects > 0 ? 'text-amber-600' : 'text-gray-900'} />
        <KpiCard label="Open RFIs" value={`${openRfis}`} sub={`${rfis.length} total`} accent={openRfis > 0 ? 'text-amber-600' : 'text-gray-900'} />
      </div>

      {/* ── Supervisor Checklist ── */}
      <section>
        <SectionHeader icon="✅" title="Supervisor Checklist" count={`${completedCount}/${totalItems} complete`} />
        <div className="space-y-3">
          {STANDARD_STAGES.map((stage) => (
            <StageCard key={stage.id} stage={stage} checked={checked} onToggle={toggleItem} />
          ))}
        </div>
      </section>

      {/* ── Inspections ── */}
      <section>
        <SectionHeader icon="🔎" title="Inspections & Certificates" count={`${data.inspections.length} logged`} />
        <InspectionsCard inspections={data.inspections} onOpenCert={setOpenCert} />
      </section>

      {/* ── OH&S ── */}
      <section>
        <SectionHeader icon="🦺" title="OH&S / Safety Documents" count={`${data.ohs.length} on file`} />
        <OhsCard ohs={data.ohs} />
      </section>

      {/* ── Defects ── */}
      <section>
        <SectionHeader
          icon="🔧"
          title="Defect List"
          count={`${openDefects} open`}
          action={
            <button onClick={() => setLogDefectOpen(true)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              + Log defect
            </button>
          }
        />
        <DefectsCard defects={defects} onSend={sendDefect} onSignOff={signOffDefect} onOpenLog={() => setLogDefectOpen(true)} />
      </section>

      {/* ── RFIs ── */}
      <section>
        <SectionHeader
          icon="📨"
          title="RFIs"
          count={`${openRfis} awaiting`}
          action={
            <button onClick={() => setNewRfiOpen(true)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              + New RFI
            </button>
          }
        />
        <RfisCard rfis={rfis} />
      </section>

      {/* ── Progress Photos ── */}
      <section>
        <SectionHeader icon="📸" title="Progress Photos" count={`${data.photos.length} photos`} />
        <PhotosGrid photos={data.photos} />
      </section>

      {/* ── Modals ── */}
      {openCert && <PdfModal fileName={openCert} onClose={() => setOpenCert(null)} />}
      {logDefectOpen && <LogDefectModal onClose={() => setLogDefectOpen(false)} onAdd={addDefect} />}
      {newRfiOpen && <NewRfiModal onClose={() => setNewRfiOpen(false)} onAdd={addRfi} />}
    </div>
  );
}
