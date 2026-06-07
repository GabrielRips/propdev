import React, { useState } from 'react';
import { consultantsData, ConsultantReport, ReportStatus } from '../data/consultants-data';
import EngageConsultantModal from './EngageConsultantModal';
import SoftPhoneModal from './SoftPhoneModal';
import { Contact, contactsData } from '../data/contacts-data';

const TODAY = '2026-02-22';

function formatDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function isOverdue(r: ConsultantReport): boolean {
  return r.status === 'not_received' && !!r.dueDate && r.dueDate < TODAY;
}

function isDraftPendingFinal(r: ConsultantReport): boolean {
  return r.status === 'draft' && !!r.requiredForMilestone;
}

// ─── Badges ──────────────────────────────────────────────────────────────────

const statusConfig: Record<ReportStatus, { label: string; className: string }> = {
  not_received: { label: 'Not Received', className: 'bg-red-50 text-red-600 border border-red-200' },
  draft:        { label: 'Draft',        className: 'bg-amber-100 text-amber-700' },
  final:        { label: 'Final',        className: 'bg-green-100 text-green-700' },
  superseded:   { label: 'Superseded',   className: 'bg-gray-100 text-gray-400' },
};

function StatusBadge({ status }: { status: ReportStatus }) {
  const { label, className } = statusConfig[status];
  return <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${className}`}>{label}</span>;
}

// ─── Summary Panel ────────────────────────────────────────────────────────────

function SummaryPanel({ reports }: { reports: ConsultantReport[] }) {
  const expected = reports.length;
  const received = reports.filter((r) => r.status !== 'not_received').length;
  const outstanding = reports.filter((r) => r.status === 'not_received').length;
  const overdue = reports.filter(isOverdue).length;

  const stats = [
    { label: 'Reports Expected', value: expected, color: 'text-gray-900' },
    { label: 'Reports Received', value: received, color: 'text-green-600' },
    { label: 'Outstanding', value: outstanding, color: outstanding > 0 ? 'text-amber-600' : 'text-gray-400' },
    { label: 'Overdue', value: overdue, color: overdue > 0 ? 'text-red-600' : 'text-gray-400' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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

// ─── Overdue Alerts ───────────────────────────────────────────────────────────

function OverdueAlerts({ reports }: { reports: ConsultantReport[] }) {
  const flags: { report: ConsultantReport; reason: string }[] = [];

  for (const r of reports) {
    if (isOverdue(r)) {
      flags.push({ report: r, reason: `Overdue since ${formatDate(r.dueDate!)}` });
    } else if (isDraftPendingFinal(r)) {
      flags.push({ report: r, reason: `Draft — final required for ${r.requiredForMilestone}` });
    } else if (r.status === 'not_received' && r.requiredForMilestone) {
      flags.push({ report: r, reason: `Required for ${r.requiredForMilestone}` });
    }
  }

  if (flags.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <span className="text-xs font-semibold text-amber-700">Action Required</span>
      </div>
      <ul className="space-y-2">
        {flags.map(({ report, reason }) => (
          <li key={report.id} className="flex items-start gap-2">
            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5" />
            <div className="min-w-0">
              <span className="text-sm text-amber-900 font-medium">{report.reportName}</span>
              <span className="text-sm text-amber-700"> — {reason}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── PDF Preview Modal ────────────────────────────────────────────────────────

function PdfModal({ fileName, onClose }: { fileName: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-800 mb-1">{fileName}</p>
        <p className="text-sm text-gray-400 mb-6">PDF preview would be shown here</p>
        <button
          onClick={onClose}
          className="px-5 py-2 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ─── Versions Modal ───────────────────────────────────────────────────────────

function VersionsModal({ report, onClose }: { report: ConsultantReport; onClose: () => void }) {
  const versions = report.versions ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Version History</h2>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{report.reportName}</p>
        </div>

        <div className="px-6 py-5 space-y-0">
          {/* Current version */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-blue-100 flex-shrink-0 mt-0.5" />
              {versions.length > 0 && <div className="w-px flex-1 bg-gray-200 my-1" />}
            </div>
            <div className="pb-5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-900">Current version</span>
                <span className="text-[10px] font-medium bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">Latest</span>
              </div>
              {report.dateReceived && (
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(report.dateReceived)}</p>
              )}
              {report.submittedBy && (
                <p className="text-xs text-gray-500 mt-0.5">Submitted by {report.submittedBy}</p>
              )}
            </div>
          </div>

          {/* Previous versions */}
          {versions.map((v, i) => (
            <div key={v.version} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-gray-300 flex-shrink-0 mt-0.5" />
                {i < versions.length - 1 && <div className="w-px flex-1 bg-gray-200 my-1" />}
              </div>
              <div className="pb-5">
                <span className="text-sm font-medium text-gray-600">{v.version}</span>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(v.date)}</p>
                {v.note && <p className="text-xs text-gray-500 mt-0.5 italic">{v.note}</p>}
              </div>
            </div>
          ))}

          {versions.length === 0 && (
            <p className="text-sm text-gray-400 py-2">No previous versions.</p>
          )}
        </div>

        <div className="px-6 pb-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Email Modal ──────────────────────────────────────────────────────────────

function generateEmailBody(attachmentName: string): string {
  return `Hi,\n\nI hope this email finds you well.\n\nPlease find attached ${attachmentName} for your review.\n\nCould you please review the document and let us know if you have any questions or require any amendments. We would appreciate your feedback at your earliest convenience.\n\nPlease don't hesitate to reach out if you need any further information.\n\nKind regards`;
}

function EmailModal({ report, onClose }: { report: ConsultantReport; onClose: () => void }) {
  const [to, setTo] = useState(report.submitterEmail ?? '');
  const [body, setBody] = useState('');
  const [sent, setSent] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  function handleAiDraft() {
    setAiGenerating(true);
    setTimeout(() => { setBody(generateEmailBody(report.reportName)); setAiGenerating(false); }, 1200);
  }

  function handleSend() {
    if (!to.trim()) return;
    setSent(true);
    setTimeout(onClose, 1400);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">New Email</h2>
        </div>

        {sent ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-800">Email sent</p>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 space-y-4">
              {/* To */}
              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1">To</label>
                <input
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="recipient@example.com"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1">Subject</label>
                <input
                  type="text"
                  defaultValue={`Re: ${report.reportName}`}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Attachment chip */}
              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1">Attachment</label>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg">
                  <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <span className="text-xs text-gray-600 max-w-[280px] truncate">{report.reportName}</span>
                </div>
              </div>

              {/* Body */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-gray-400">Message</label>
                  <button onClick={handleAiDraft} disabled={aiGenerating} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors disabled:opacity-50">
                    {aiGenerating ? <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>}
                    {aiGenerating ? 'Generating…' : 'AI Draft'}
                  </button>
                </div>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Write your message or use AI Draft…"
                />
              </div>
            </div>

            <div className="px-6 pb-5 flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleSend} disabled={!to.trim()} className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Reports Table ────────────────────────────────────────────────────────────

interface ReportsTableProps {
  reports: ConsultantReport[];
  onMarkFinal: (id: string) => void;
  onOpenPdf: (fileName: string) => void;
  onOpenVersions: (report: ConsultantReport) => void;
  onOpenEmail: (report: ConsultantReport) => void;
  onCall: (report: ConsultantReport) => void;
}

function ReportsTable({ reports, onMarkFinal, onOpenPdf, onOpenVersions, onOpenEmail, onCall }: ReportsTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Reports</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">File</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide hidden lg:table-cell">Submitted By</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Date</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {reports.map((report) => {
              const overdue = isOverdue(report);
              const hasFile = report.status !== 'not_received';
              return (
                <tr
                  key={report.id}
                  className={`${overdue ? 'bg-red-50/40' : 'hover:bg-gray-50/60'} transition-colors`}
                >
                  {/* File name */}
                  <td className="px-5 py-3">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {hasFile ? (
                          <button
                            onClick={() => onOpenPdf(report.reportName)}
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline text-left"
                          >
                            {report.reportName}
                          </button>
                        ) : (
                          <span className="text-sm text-gray-400 italic">{report.reportName}</span>
                        )}
                        {overdue && (
                          <span className="text-[10px] font-semibold text-red-500 uppercase tracking-wide">Overdue</span>
                        )}
                      </div>
                      {report.approvalStatus && (
                        <span className="text-xs text-gray-400">{report.approvalStatus}</span>
                      )}
                    </div>
                  </td>

                  {/* Submitted by */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm text-gray-600">{report.submittedBy ?? '—'}</span>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    {report.dateReceived ? (
                      <p className="text-sm text-gray-700">{formatDate(report.dateReceived)}</p>
                    ) : report.dueDate ? (
                      <div>
                        <p className="text-xs text-gray-400">Due</p>
                        <p className={`text-sm font-medium ${overdue ? 'text-red-600' : 'text-gray-600'}`}>
                          {formatDate(report.dueDate)}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-300">—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1.5 items-start">
                      <StatusBadge status={report.status} />
                      {report.requiredForMilestone && (
                        <span className="text-[10px] text-gray-400 italic">{report.requiredForMilestone}</span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      {report.status === 'draft' && (
                        <button
                          onClick={() => onMarkFinal(report.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Mark Final
                        </button>
                      )}

                      {/* Versions button — only when versions exist */}
                      {report.versions && report.versions.length > 0 && (
                        <button
                          onClick={() => onOpenVersions(report)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                          title="Version history"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Versions
                        </button>
                      )}

                      {/* Email button — only when submitter email exists */}
                      {report.submitterEmail && (
                        <button
                          onClick={() => onOpenEmail(report)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                          title="Email submitter"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                          </svg>
                          Email
                        </button>
                      )}

                      {/* Call button — only when submitter phone exists */}
                      {report.submitterPhone && (
                        <button
                          onClick={() => onCall(report)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                          title={report.submitterPhone}
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                          </svg>
                          Call
                        </button>
                      )}
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

// ─── Main Tab ─────────────────────────────────────────────────────────────────

interface ConsultantsTabProps {
  projectId: string;
}

export default function ConsultantsTab({ projectId }: ConsultantsTabProps) {
  const initial = consultantsData[projectId] ?? [];
  const [reports, setReports] = useState<ConsultantReport[]>(initial);
  const [openPdf, setOpenPdf] = useState<string | null>(null);
  const [versionsReport, setVersionsReport] = useState<ConsultantReport | null>(null);
  const [emailReport, setEmailReport] = useState<ConsultantReport | null>(null);
  const [showEngageModal, setShowEngageModal] = useState(false);
  const [callContact, setCallContact] = useState<Contact | null>(null);
  const allContacts = contactsData[projectId] ?? [];

  if (initial.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <p className="text-gray-400 text-sm">No consultant reports for this project</p>
      </div>
    );
  }

  function handleMarkFinal(id: string) {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'final' } : r))
    );
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowEngageModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Engage Consultant
        </button>
      </div>

      <SummaryPanel reports={reports} />
      <OverdueAlerts reports={reports} />
      <ReportsTable
        reports={reports}
        onMarkFinal={handleMarkFinal}
        onOpenPdf={setOpenPdf}
        onOpenVersions={setVersionsReport}
        onOpenEmail={setEmailReport}
        onCall={(report) => setCallContact({
          id: `consultant-${report.id}`,
          name: report.submittedBy ?? report.discipline,
          organisation: report.discipline,
          phone: report.submitterPhone ?? '',
          email: report.submitterEmail ?? '',
        })}
      />

      {openPdf && (
        <PdfModal fileName={openPdf} onClose={() => setOpenPdf(null)} />
      )}
      {versionsReport && (
        <VersionsModal report={versionsReport} onClose={() => setVersionsReport(null)} />
      )}
      {emailReport && (
        <EmailModal report={emailReport} onClose={() => setEmailReport(null)} />
      )}
      {showEngageModal && (
        <EngageConsultantModal projectId={projectId} onClose={() => setShowEngageModal(false)} />
      )}
      {callContact && (
        <SoftPhoneModal
          contact={callContact}
          allContacts={allContacts}
          onClose={() => setCallContact(null)}
        />
      )}
    </div>
  );
}
