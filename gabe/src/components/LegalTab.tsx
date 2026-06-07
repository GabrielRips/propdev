import React, { useState, useEffect } from 'react';
import { legalData, LegalDocument, LegalSection } from '../data/legal-data';
import SoftPhoneModal from './SoftPhoneModal';
import { Contact, contactsData } from '../data/contacts-data';

// ─── Constants ────────────────────────────────────────────────────────────────

const SECTIONS: LegalSection[] = ['Acquisition', 'Planning', 'Construction', 'Sales'];

const sectionAccent: Record<LegalSection, string> = {
  Acquisition:  'border-indigo-400',
  Planning:     'border-amber-400',
  Construction: 'border-orange-400',
  Sales:        'border-green-400',
};

const sectionIcon: Record<LegalSection, string> = {
  Acquisition:  '🤝',
  Planning:     '🏛️',
  Construction: '🏗️',
  Sales:        '🏷️',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// ─── PDF Preview Modal ────────────────────────────────────────────────────────

function PdfModal({ fileName, onClose }: { fileName: string; onClose: () => void }) {
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
        <p className="text-sm text-gray-400 mb-6">PDF preview would be shown here</p>
        <button onClick={onClose} className="px-5 py-2 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
          Close
        </button>
      </div>
    </div>
  );
}

// ─── Versions Modal ───────────────────────────────────────────────────────────

function VersionsModal({ doc, onClose }: { doc: LegalDocument; onClose: () => void }) {
  const versions = doc.versions ?? [];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Version History</h2>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{doc.name}</p>
        </div>
        <div className="px-6 py-5">
          {/* Current version */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-blue-100 flex-shrink-0 mt-0.5" />
              {versions.length > 0 && <div className="w-px flex-1 bg-gray-200 my-1" />}
            </div>
            <div className="pb-5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">Current version</span>
                <span className="text-[10px] font-medium bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">Latest</span>
              </div>
              {doc.dateReceived && <p className="text-xs text-gray-400 mt-0.5">{formatDate(doc.dateReceived)}</p>}
              {doc.submittedBy && <p className="text-xs text-gray-500 mt-0.5">Submitted by {doc.submittedBy}</p>}
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
          {versions.length === 0 && <p className="text-sm text-gray-400">No previous versions.</p>}
        </div>
        <div className="px-6 pb-5 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Email Modal ──────────────────────────────────────────────────────────────

function generateEmailBody(docName: string): string {
  return `Hi,\n\nI hope this email finds you well.\n\nI am writing regarding the document referenced above: ${docName}.\n\nCould you please review the document and confirm your availability to discuss any outstanding matters at your earliest convenience.\n\nPlease don't hesitate to reach out if you require any further information.\n\nKind regards`;
}

function EmailModal({ doc, onClose }: { doc: LegalDocument; onClose: () => void }) {
  const [to, setTo] = useState(doc.submitterEmail ?? '');
  const [body, setBody] = useState('');
  const [sent, setSent] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  function handleAiDraft() {
    setAiGenerating(true);
    setTimeout(() => {
      setBody(generateEmailBody(doc.name));
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
          <div className="flex flex-col items-center justify-center py-12">
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
                <input type="email" value={to} onChange={(e) => setTo(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="recipient@example.com" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1">Subject</label>
                <input type="text" defaultValue={`Re: ${doc.name}`} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1">Attachment</label>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg">
                  <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <span className="text-xs text-gray-600 max-w-xs truncate">{doc.name}</span>
                </div>
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
                <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Write your message or use AI Draft…" />
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

// ─── AI Analyse Modal ─────────────────────────────────────────────────────────

interface AnalysisResult {
  summary: string;
  keyTerms: string[];
  risks: string[];
  importantDates: string[];
  actionItems: string[];
}

function getMockAnalysis(doc: LegalDocument): AnalysisResult {
  const analyses: Record<LegalSection, AnalysisResult> = {
    Acquisition: {
      summary: 'Standard contract of sale for the site. Law Institute form with special conditions governing finance, due diligence, and settlement. Deposit held in solicitors\' trust account pending unconditional exchange.',
      keyTerms: [
        'Sunset clause — 90 days from execution',
        'Deposit: 10% held in solicitors\' trust',
        'Subject-to-finance condition: 21 days',
        'Vacant possession on settlement',
      ],
      risks: [
        'Finance condition must be satisfied — confirm approval status with broker',
        'Council rate adjustments required on settlement — obtain latest arrears figure',
      ],
      importantDates: [
        'Finance condition expiry: 21 days from execution',
        'Settlement date: 60 days from execution',
        'Sunset clause trigger: 90 days from execution',
      ],
      actionItems: [
        'Confirm finance approval with broker before condition deadline',
        'Order title search and plan of subdivision',
        'Arrange building and pest inspection if not completed',
      ],
    },
    Planning: {
      summary: 'Development permit issued by council subject to conditions. Document contains 12 permit conditions, several of which are precedent conditions requiring satisfaction before works commence. Appeal period provisions apply.',
      keyTerms: [
        'Permit expiry: 2 years from issue date',
        'Conditions precedent to commencement of works',
        'Section 173 agreement required before permit use',
        'Right of appeal to VCAT within 60 days of issue',
      ],
      risks: [
        'Condition 4 (drainage) requires engineering sign-off before any works commence',
        'Third-party appeal period still open — monitor for objections',
      ],
      importantDates: [
        'Permit expiry date: 2 years from issue',
        'Section 173 agreement execution: within 30 days',
        'VCAT appeal deadline: 60 days from permit issue',
      ],
      actionItems: [
        'Execute Section 173 agreement within required timeframe',
        'Obtain engineering sign-off to satisfy Condition 4',
        'Advise architect and builder of all permit conditions',
      ],
    },
    Construction: {
      summary: 'Lump sum head contract for construction of the development. Contract sum and construction programme attached as schedules. Superintendent appointed. Security held as retention and performance bond.',
      keyTerms: [
        'Contract sum: as per executed schedule',
        'Defects liability period: 12 months from practical completion',
        'Security: 5% retention plus performance bond',
        'Delay liquidated damages: $2,500 per day',
      ],
      risks: [
        'Programme float of only 3 weeks — extension of time claims likely if any delays occur',
        'Provisional sums for hydraulic connections remain unresolved — cost exposure',
      ],
      importantDates: [
        'Commencement date: as per programme schedule',
        'Practical completion: as per programme schedule',
        'Defects liability end: 12 months post practical completion',
      ],
      actionItems: [
        'Issue formal superintendent appointment letter to builder',
        'Confirm all insurance certificates received and current',
        'Resolve outstanding provisional sums schedule with QS',
      ],
    },
    Sales: {
      summary: 'Standard off-the-plan contract of sale. Purchaser deposit held in solicitors\' trust. Sunset clause provisions apply. Disclosure statement and statement of information attached as required by legislation.',
      keyTerms: [
        'Sunset clause: 24 months from contract date',
        'Deposit: 10% held in solicitors\' trust account',
        'Statutory disclosure statement attached',
        'Cooling-off period: 3 business days applies',
      ],
      risks: [
        'Sunset clause may be triggered if construction is delayed beyond 24 months',
        'Cooling-off period — purchaser may rescind within 3 business days without penalty',
      ],
      importantDates: [
        'Contract date: as executed',
        'Cooling-off expiry: 3 business days from contract date',
        'Sunset clause trigger: 24 months from contract date',
      ],
      actionItems: [
        'Confirm deposit received and held in trust account',
        'Issue disclosure statement to purchaser\'s solicitor',
        'Monitor sunset clause trigger dates across all contracts',
      ],
    },
  };

  return analyses[doc.section];
}

function AnalyseModal({ doc, onClose }: { doc: LegalDocument; onClose: () => void }) {
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setScanning(false), 1800);
    return () => clearTimeout(t);
  }, []);

  const analysis = getMockAnalysis(doc);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-0.5">
            <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <h2 className="text-base font-semibold text-gray-900">AI Analysis</h2>
          </div>
          <p className="text-xs text-gray-400 truncate">{doc.name}</p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {scanning ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 gap-4">
              <svg className="w-8 h-8 text-purple-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">Scanning document…</p>
                <p className="text-xs text-gray-400 mt-0.5">Extracting key terms, risks and action items</p>
              </div>
            </div>
          ) : (
            <div className="px-6 py-5 space-y-5">
              {/* Summary */}
              <div className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Summary</p>
                <p className="text-sm text-gray-700 leading-relaxed">{analysis.summary}</p>
              </div>

              {/* Key Terms */}
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Key Terms</p>
                <ul className="space-y-1.5">
                  {analysis.keyTerms.map((t) => (
                    <li key={t} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risks */}
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Risks</p>
                <ul className="space-y-1.5">
                  {analysis.risks.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Important Dates */}
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Important Dates</p>
                <ul className="space-y-1.5">
                  {analysis.importantDates.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Items */}
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Action Items</p>
                <ul className="space-y-1.5">
                  {analysis.actionItems.map((a) => (
                    <li key={a} className="flex items-start gap-2 text-sm text-gray-700 font-medium">
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Document Row ─────────────────────────────────────────────────────────────

interface DocRowProps {
  doc: LegalDocument;
  onOpenPdf: (name: string) => void;
  onOpenVersions: (doc: LegalDocument) => void;
  onOpenEmail: (doc: LegalDocument) => void;
  onOpenAnalyse: (doc: LegalDocument) => void;
  onCall: (doc: LegalDocument) => void;
}

function DocRow({ doc, onOpenPdf, onOpenVersions, onOpenEmail, onOpenAnalyse, onCall }: DocRowProps) {
  const hasFile = !!doc.dateReceived;

  return (
    <tr className="hover:bg-gray-50/60 transition-colors">
      {/* File name */}
      <td className="px-5 py-3">
        {hasFile ? (
          <button onClick={() => onOpenPdf(doc.name)} className="text-sm text-blue-600 hover:text-blue-800 hover:underline text-left">
            {doc.name}
          </button>
        ) : (
          <span className="text-sm text-gray-400 italic">{doc.name}</span>
        )}
      </td>

      {/* Submitted by */}
      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="text-sm text-gray-600">{doc.submittedBy ?? '—'}</span>
      </td>

      {/* Date received */}
      <td className="px-4 py-3 hidden md:table-cell">
        {doc.dateReceived ? (
          <span className="text-sm text-gray-700">{formatDate(doc.dateReceived)}</span>
        ) : (
          <span className="text-xs text-gray-400 italic">Not received</span>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1.5 flex-wrap">
          {/* Analyse — always shown */}
          <button
            onClick={() => onOpenAnalyse(doc)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
            title="AI analysis"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            Analyse
          </button>

          {/* Versions */}
          {doc.versions && doc.versions.length > 0 && (
            <button
              onClick={() => onOpenVersions(doc)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
              title="Version history"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Versions
            </button>
          )}

          {/* Email */}
          {doc.submitterEmail && (
            <button
              onClick={() => onOpenEmail(doc)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
              title="Email submitter"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Email
            </button>
          )}

          {/* Call */}
          {doc.submitterPhone && (
            <button
              onClick={() => onCall(doc)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
              title={doc.submitterPhone}
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
}

// ─── Section Card ─────────────────────────────────────────────────────────────

interface SectionCardProps {
  section: LegalSection;
  docs: LegalDocument[];
  onOpenPdf: (name: string) => void;
  onOpenVersions: (doc: LegalDocument) => void;
  onOpenEmail: (doc: LegalDocument) => void;
  onOpenAnalyse: (doc: LegalDocument) => void;
  onCall: (doc: LegalDocument) => void;
}

function SectionCard({ section, docs, onOpenPdf, onOpenVersions, onOpenEmail, onOpenAnalyse, onCall }: SectionCardProps) {
  const received = docs.filter((d) => d.dateReceived).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className={`px-5 py-3 border-b border-gray-100 border-l-4 ${sectionAccent[section]}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">{sectionIcon[section]}</span>
            <h3 className="text-sm font-semibold text-gray-900">{section}</h3>
          </div>
          {docs.length > 0 && (
            <span className="text-xs text-gray-400">{received} of {docs.length} received</span>
          )}
        </div>
      </div>

      {docs.length === 0 ? (
        <p className="px-5 py-8 text-sm text-gray-400 italic text-center">No documents for this phase yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">File</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide hidden lg:table-cell">Submitted By</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Date Received</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {docs.map((doc) => (
                <DocRow
                  key={doc.id}
                  doc={doc}
                  onOpenPdf={onOpenPdf}
                  onOpenVersions={onOpenVersions}
                  onOpenEmail={onOpenEmail}
                  onOpenAnalyse={onOpenAnalyse}
                  onCall={onCall}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

interface LegalTabProps {
  projectId: string;
}

export default function LegalTab({ projectId }: LegalTabProps) {
  const allDocs = legalData[projectId] ?? [];
  const [openPdf, setOpenPdf] = useState<string | null>(null);
  const [versionsDoc, setVersionsDoc] = useState<LegalDocument | null>(null);
  const [emailDoc, setEmailDoc] = useState<LegalDocument | null>(null);
  const [analyseDoc, setAnalyseDoc] = useState<LegalDocument | null>(null);
  const [callContact, setCallContact] = useState<Contact | null>(null);
  const allContacts = contactsData[projectId] ?? [];

  if (allDocs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <p className="text-gray-400 text-sm">No legal documents for this project</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {SECTIONS.map((section) => (
        <SectionCard
          key={section}
          section={section}
          docs={allDocs.filter((d) => d.section === section)}
          onOpenPdf={setOpenPdf}
          onOpenVersions={setVersionsDoc}
          onOpenEmail={setEmailDoc}
          onOpenAnalyse={setAnalyseDoc}
          onCall={(doc) => setCallContact({
            id: `legal-${doc.id}`,
            name: doc.submittedBy ?? 'Unknown',
            organisation: doc.submittedBy ?? '',
            phone: doc.submitterPhone ?? '',
            email: doc.submitterEmail ?? '',
          })}
        />
      ))}

      {openPdf && <PdfModal fileName={openPdf} onClose={() => setOpenPdf(null)} />}
      {versionsDoc && <VersionsModal doc={versionsDoc} onClose={() => setVersionsDoc(null)} />}
      {emailDoc && <EmailModal doc={emailDoc} onClose={() => setEmailDoc(null)} />}
      {analyseDoc && <AnalyseModal doc={analyseDoc} onClose={() => setAnalyseDoc(null)} />}
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
