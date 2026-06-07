import React, { useState } from 'react';
import { authoritiesData, CouncilStatus, CouncilData, AuthDocument } from '../data/authorities-data';
import { phaseDetails, Activity, ActivityType } from '../data/phase-details';
import ActivityModal from './ActivityModal';
import SoftPhoneModal from './SoftPhoneModal';
import { Contact, contactsData } from '../data/contacts-data';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAUD(n: number): string {
  if (n === 0) return '—';
  return n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateLong(d: string): string {
  return new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const councilStatusConfig: Record<CouncilStatus, { label: string; className: string }> = {
  not_lodged: { label: 'Not Lodged', className: 'bg-gray-100 text-gray-500' },
  lodged:     { label: 'Lodged',     className: 'bg-amber-100 text-amber-700' },
  rfi:        { label: 'RFI Received', className: 'bg-red-100 text-red-600' },
  approved:   { label: 'Approved',   className: 'bg-green-100 text-green-700' },
};

function CouncilBadge({ status }: { status: CouncilStatus }) {
  const { label, className } = councilStatusConfig[status];
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${className}`}>{label}</span>;
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

function FinancialStat({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div>
      <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-sm font-semibold ${muted ? 'text-gray-400' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

function LayerDivider({ label }: { label: string }) {
  return (
    <div className="px-5 py-2 bg-gray-50 border-t border-b border-gray-100 flex items-center gap-2">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function DocumentList({ docs }: { docs: AuthDocument[] }) {
  const [openFile, setOpenFile] = useState<string | null>(null);
  const uploaded = docs.filter((d) => d.fileName);
  const pending = docs.filter((d) => !d.fileName);

  return (
    <>
      <div className="space-y-4">
        {uploaded.length > 0 && (
          <ul className="space-y-2">
            {uploaded.map((doc) => (
              <li key={doc.label} className="flex items-start gap-3">
                <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">{doc.label}</p>
                  <button
                    onClick={() => setOpenFile(doc.fileName!)}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline text-left truncate max-w-full"
                  >
                    {doc.fileName}
                  </button>
                  {doc.date && (
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(doc.date)}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {pending.length > 0 && (
          <div>
            {uploaded.length > 0 && (
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Pending</p>
            )}
            <ul className="space-y-1.5">
              {pending.map((doc) => (
                <li key={doc.label} className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                  <span className="text-sm text-gray-400">{doc.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {openFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpenFile(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-gray-900">Document Preview</h2>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{openFile}</p>
              </div>
              <button
                onClick={() => setOpenFile(null)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-12 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">PDF of the document will be shown here</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Council Section ──────────────────────────────────────────────────────────

function CouncilSection({ data }: { data: CouncilData }) {
  const netExposure = data.totalFees - data.received;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-base">🏛️</span>
          <h3 className="text-sm font-semibold text-gray-900">Council / Authority</h3>
        </div>
        <CouncilBadge status={data.approvalStatus} />
      </div>

      <div className="px-5 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
          {data.lodgementDate && (
            <InfoField label="Lodgement Date" value={formatDate(data.lodgementDate)} />
          )}
          {data.approvalDate && (
            <InfoField label="Approval Date" value={formatDate(data.approvalDate)} />
          )}
          {data.expiryDate && (
            <InfoField label="Permit Expiry" value={formatDate(data.expiryDate)} />
          )}
          {!data.lodgementDate && (
            <InfoField label="Lodgement Date" value="Not yet lodged" />
          )}
        </div>
      </div>

      <LayerDivider label="Financials" />
      <div className="px-5 py-4 bg-gray-50/60">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4">
          <FinancialStat label="Total Council Fees" value={formatAUD(data.totalFees)} muted={data.totalFees === 0} />
          <FinancialStat label="Reclaimable" value={formatAUD(data.reclaimable)} muted={data.reclaimable === 0} />
          <FinancialStat label="Claimed Back" value={formatAUD(data.claimedBack)} muted={data.claimedBack === 0} />
          <FinancialStat label="Amount Received" value={formatAUD(data.received)} muted={data.received === 0} />
        </div>
        {data.totalFees > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              Net exposure:{' '}
              <span className="font-semibold text-gray-700">{formatAUD(netExposure)}</span>
            </p>
          </div>
        )}
      </div>

      <LayerDivider label="Documents" />
      <div className="px-5 py-4">
        <DocumentList docs={data.documents} />
      </div>
    </div>
  );
}

// ─── Email Compose Modal ──────────────────────────────────────────────────────

function generateEmailBody(toName: string, subject?: string): string {
  const re = subject ? ` regarding "${subject}"` : '';
  return `Hi ${toName},\n\nI hope this email finds you well.\n\nI am following up${re}.\n\nCould you please provide an update at your earliest convenience. Please don't hesitate to reach out if you need any further information.\n\nKind regards`;
}

function EmailComposeModal({ toName, subject, onClose }: { toName: string; subject?: string; onClose: () => void }) {
  const [to, setTo] = useState(toName);
  const [subjectVal, setSubjectVal] = useState(subject ? `RE: ${subject}` : '');
  const [body, setBody] = useState('');
  const [sent, setSent] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  function handleAiDraft() {
    setAiGenerating(true);
    setTimeout(() => {
      setBody(generateEmailBody(toName, subject));
      setAiGenerating(false);
    }, 1200);
  }

  function handleSend() {
    if (!to.trim()) return;
    setSent(true);
    setTimeout(onClose, 1400);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
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
              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1">To</label>
                <input
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1">Subject</label>
                <input
                  type="text"
                  value={subjectVal}
                  onChange={(e) => setSubjectVal(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-gray-400">Message</label>
                  <button
                    onClick={handleAiDraft}
                    disabled={aiGenerating}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {aiGenerating ? (
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                    )}
                    {aiGenerating ? 'Generating…' : 'AI Draft'}
                  </button>
                </div>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={5}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Write your message or use AI Draft…"
                />
              </div>
            </div>
            <div className="px-6 pb-5 flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!to.trim()}
                className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Communications Section ───────────────────────────────────────────────────

const activityMeta: Record<ActivityType, { icon: string; label: string; direction: 'in' | 'out' }> = {
  email_in:  { icon: '📩', label: 'Email',       direction: 'in' },
  email_out: { icon: '📤', label: 'Email',       direction: 'out' },
  phone_in:  { icon: '📞', label: 'Phone call',  direction: 'in' },
  phone_out: { icon: '📱', label: 'Phone call',  direction: 'out' },
  sms_in:    { icon: '💬', label: 'SMS',         direction: 'in' },
  sms_out:   { icon: '💬', label: 'SMS',         direction: 'out' },
};

interface CommsEmailTarget {
  toName: string;
  subject?: string;
}

function CommunicationsSection({ activities, projectId }: { activities: Activity[]; projectId: string }) {
  const [detailActivity, setDetailActivity] = useState<Activity | null>(null);
  const [emailTarget, setEmailTarget] = useState<CommsEmailTarget | null>(null);
  const [callContact, setCallContact] = useState<Contact | null>(null);
  const allContacts = contactsData[projectId] ?? [];

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Communications</h3>
        </div>
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-gray-400 italic">No permit-related communications yet</p>
        </div>
      </div>
    );
  }

  const sorted = [...activities].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">
            Communications
            <span className="ml-2 text-xs font-normal text-gray-400">{sorted.length} items</span>
          </h3>
        </div>

        <ul className="divide-y divide-gray-50">
          {sorted.map((activity) => {
            const meta = activityMeta[activity.type];
            const isIncoming = meta.direction === 'in';
            const isEmail = activity.type === 'email_in' || activity.type === 'email_out';
            const isPhone = activity.type === 'phone_in' || activity.type === 'phone_out';
            const isSms = activity.type === 'sms_in' || activity.type === 'sms_out';

            // Show Email button for incoming emails, SMS; also for outgoing (to follow up)
            const showEmail = isEmail || isSms;
            // Show Call button for phone activities
            const showCall = isPhone;

            return (
              <li key={activity.id} className="px-5 py-3 hover:bg-gray-50/60 transition-colors">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <span className="flex-shrink-0 text-lg mt-0.5">{meta.icon}</span>

                  {/* Content — clickable to open detail */}
                  <button
                    onClick={() => setDetailActivity(activity)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-400">
                        {meta.label} {isIncoming ? 'from' : 'to'}
                      </span>
                      <span className="text-sm font-medium text-gray-800">{activity.person}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-0.5">{activity.summary}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDateLong(activity.date)}</p>
                  </button>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                    {showEmail && (
                      <button
                        onClick={() => setEmailTarget({ toName: activity.person, subject: activity.subject })}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                        title={`Email ${activity.person}`}
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        Email
                      </button>
                    )}
                    {showCall && (
                      <button
                        onClick={() => {
                          const found = allContacts.find(c => c.name === activity.person);
                          setCallContact(found ?? { id: `permit-${activity.id}`, name: activity.person, organisation: '', phone: '', email: '' });
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                        title={`Call ${activity.person}`}
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                        Call
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {detailActivity && (
        <ActivityModal activity={detailActivity} onClose={() => setDetailActivity(null)} />
      )}
      {emailTarget && (
        <EmailComposeModal
          toName={emailTarget.toName}
          subject={emailTarget.subject}
          onClose={() => setEmailTarget(null)}
        />
      )}
      {callContact && (
        <SoftPhoneModal
          contact={callContact}
          allContacts={allContacts}
          onClose={() => setCallContact(null)}
        />
      )}
    </>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

interface PermitTabProps {
  projectId: string;
}

export default function PermitTab({ projectId }: PermitTabProps) {
  const data = authoritiesData[projectId];
  const permitActivities = phaseDetails[projectId]?.['Planning Permit']?.activities ?? [];

  if (!data) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <p className="text-gray-400 text-sm">No permit data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <CouncilSection data={data.council} />
      <CommunicationsSection activities={permitActivities} projectId={projectId} />
    </div>
  );
}
