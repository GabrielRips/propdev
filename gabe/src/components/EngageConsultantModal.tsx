import React, { useState, useEffect, useRef } from 'react';
import { projects } from '../data/projects';

// ─── Types ────────────────────────────────────────────────────────────────────

type RecordingState = 'idle' | 'recording' | 'processing' | 'complete';

interface BriefFields {
  project: string;
  siteAddress: string;
  stage: string;
  consultantType: string;
  scope: string;
  deliverables: string[];
  requiredDates: string;
  budgetEstimate: string;
  constraints: string;
}

interface EngageConsultantModalProps {
  projectId: string;
  onClose: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CONSULTANT_TYPES = [
  'Town Planner',
  'Traffic Engineer',
  'Hydraulic Engineer',
  'Arborist',
  'Environmental Consultant',
  'Acoustic Engineer',
  'Heritage Consultant',
  'Geotechnical Engineer',
  'Structural Engineer',
  'Landscape Architect',
];

const MOCK_TRANSCRIPT =
  "We need a consultant for the project. The site is in a residential zone and we're currently in the permit stage. " +
  "I need pre-application advice before we lodge — specifically around height controls, setback requirements, " +
  "and the neighbourhood character overlay that applies to the site. " +
  "The main deliverables I'm after are a written assessment and attendance at one pre-lodgement meeting with council. " +
  "We need this completed at least two weeks before lodgement, which is scheduled for early March 2026. " +
  "There's an outstanding RFI from council that needs to be addressed before we can proceed. " +
  "Budget should be around fifteen to twenty thousand dollars all up.";

function getStageLabel(phases: Record<string, number>): string {
  const active = Object.entries(phases)
    .filter(([, pct]) => pct > 0 && pct < 100)
    .map(([phase]) => phase);
  if (active.length > 0) return active[active.length - 1];
  const done = Object.entries(phases).filter(([, pct]) => pct === 100).map(([p]) => p);
  return done.length > 0 ? done[done.length - 1] : 'Early Stage';
}

function buildBrief(projectId: string, consultantType: string): BriefFields {
  const project = projects.find((p) => p.id === projectId) || projects[0];
  const stage = getStageLabel(project.phases as Record<string, number>);

  const scopeByType: Record<string, string> = {
    'Town Planner': `Pre-application planning advice for the proposed ${project.totalUnits}-unit development. Review of proposed scheme against local planning controls, identification of key assessment issues, and strategic advice to optimise the application for council approval.`,
    'Traffic Engineer': `Traffic impact assessment for the proposed ${project.totalUnits}-unit development. Includes trip generation analysis, intersection capacity review, car parking compliance assessment, and preparation of a Transport Impact Assessment report for DA submission.`,
    'Hydraulic Engineer': `Stormwater management assessment and design. Includes on-site detention sizing, drainage design, water quality compliance, and preparation of a Stormwater Management Plan and hydraulic calculations for DA submission.`,
    'Arborist': `Arboricultural impact assessment for all trees on and adjacent to the site. Includes tree survey, health and structural assessment, tree protection zones, and recommendations for retention/removal to support DA lodgement.`,
    'Environmental Consultant': `Environmental site assessment (Phase 1 and Phase 2 if required). Includes site contamination review, ecological constraints assessment, and preparation of an Environmental Impact Statement for DA submission.`,
    'Acoustic Engineer': `Acoustic impact assessment addressing traffic noise, mechanical plant noise, and construction noise and vibration. Preparation of an Acoustic Assessment Report and Construction Noise and Vibration Management Plan for DA submission.`,
    'Heritage Consultant': `Heritage impact statement assessing the proposed development's impact on any heritage items, conservation areas, or archaeological potential on and adjacent to the site. Advice on design responses to minimise heritage impacts.`,
    'Geotechnical Engineer': `Geotechnical investigation of the site including borehole program, laboratory testing, and preparation of a Geotechnical Report addressing foundation design, earthworks, and any contamination or stability risks.`,
    'Structural Engineer': `Structural engineering design and documentation for the proposed development including foundation design, structural framing, retaining walls, and certification for DA and construction certificate.`,
    'Landscape Architect': `Landscape design and documentation including concept design, detailed design, and preparation of landscape plans, planting schedules, and specifications for DA submission and construction.`,
  };

  const deliverablesByType: Record<string, string[]> = {
    'Town Planner': [
      'Pre-DA written assessment report',
      'Attendance at one pre-lodgement meeting with council',
      'Written advice on planning scheme compliance',
      'Risk assessment and recommendations',
    ],
    'Traffic Engineer': [
      'Transport Impact Assessment report',
      'Car parking compliance assessment',
      'Trip generation and distribution analysis',
      'Response to any RFI traffic queries',
    ],
    'Hydraulic Engineer': [
      'Stormwater Management Plan',
      'Hydraulic calculations and OSD sizing',
      'Water quality treatment design',
      'DA submission-ready documentation',
    ],
    'Arborist': [
      'Tree survey register with health ratings',
      'Arboricultural Impact Assessment report',
      'Tree protection zone plans',
      'Construction methodology recommendations',
    ],
    'Environmental Consultant': [
      'Phase 1 Environmental Site Assessment',
      'Ecological constraints assessment',
      'Environmental Impact Statement',
      'Recommendations for contamination management',
    ],
    'Acoustic Engineer': [
      'Acoustic Assessment Report',
      'Construction Noise & Vibration Management Plan',
      'Mechanical plant noise compliance assessment',
      'Response to council acoustic RFI items',
    ],
    'Heritage Consultant': [
      'Heritage Impact Statement',
      'Archaeological assessment (if required)',
      'Design recommendations report',
      'Attendance at pre-lodgement meeting',
    ],
    'Geotechnical Engineer': [
      'Geotechnical Investigation Report',
      'Foundation design recommendations',
      'Earthworks specifications',
      'Contamination screening (Phase 1)',
    ],
    'Structural Engineer': [
      'Structural design documentation',
      'Foundation design and specifications',
      'Retaining wall design',
      'Structural certification for DA',
    ],
    'Landscape Architect': [
      'Landscape concept design',
      'Detailed landscape documentation',
      'Planting schedule and specifications',
      'DA submission-ready landscape plans',
    ],
  };

  return {
    project: project.name,
    siteAddress: `${project.address}, ${project.suburb} ${project.state}`,
    stage,
    consultantType: consultantType || 'Town Planner',
    scope: scopeByType[consultantType] || scopeByType['Town Planner'],
    deliverables: deliverablesByType[consultantType] || deliverablesByType['Town Planner'],
    requiredDates: 'At least 2 weeks prior to DA lodgement (target: early March 2026)',
    budgetEstimate: '$15,000 – $22,000 (incl. GST)',
    constraints: 'Outstanding council RFI must be resolved before lodgement. Site access for any inspections to be coordinated with site manager.',
  };
}

// ─── Transcript Typer ────────────────────────────────────────────────────────

function useTranscriptTyper(active: boolean): string {
  const [displayed, setDisplayed] = useState('');
  const wordIndexRef = useRef(0);
  const words = MOCK_TRANSCRIPT.split(' ');

  useEffect(() => {
    if (!active) { setDisplayed(''); wordIndexRef.current = 0; return; }
    const interval = setInterval(() => {
      if (wordIndexRef.current < words.length) {
        const next = words.slice(0, wordIndexRef.current + 1).join(' ');
        setDisplayed(next);
        wordIndexRef.current += 1;
      } else {
        clearInterval(interval);
      }
    }, 80);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return displayed;
}

// ─── Artifact Button ──────────────────────────────────────────────────────────

function ArtifactButton({ icon, label, sublabel }: { icon: React.ReactNode; label: string; sublabel: string }) {
  const [clicked, setClicked] = useState(false);
  return (
    <button
      onClick={() => setClicked(true)}
      className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/40 transition-all text-left w-full group"
    >
      <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-400">{clicked ? '✓ Ready' : sublabel}</p>
      </div>
    </button>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function EngageConsultantModal({ projectId, onClose }: EngageConsultantModalProps) {
  const [consultantType, setConsultantType] = useState('');
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [brief, setBrief] = useState<BriefFields | null>(null);

  const isRecording = recordingState === 'recording';
  const transcript = useTranscriptTyper(isRecording);
  const words = MOCK_TRANSCRIPT.split(' ');
  const transcriptDone = transcript.split(' ').length >= words.length;

  // When transcript finishes, move to processing then complete
  useEffect(() => {
    if (isRecording && transcriptDone) {
      setRecordingState('processing');
      const t = setTimeout(() => {
        setBrief(buildBrief(projectId, consultantType || 'Town Planner'));
        setRecordingState('complete');
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [isRecording, transcriptDone, projectId, consultantType]);

  function handleRecordToggle() {
    if (recordingState === 'idle') {
      setRecordingState('recording');
    } else if (recordingState === 'recording') {
      // Stop early → jump to processing
      setRecordingState('processing');
      setTimeout(() => {
        setBrief(buildBrief(projectId, consultantType || 'Town Planner'));
        setRecordingState('complete');
      }, 1800);
    }
  }

  function handleReset() {
    setRecordingState('idle');
    setBrief(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Engage Consultant</h2>
            <p className="text-xs text-gray-400 mt-0.5">Voice-to-brief — speak your requirements and AI will generate a consultant brief</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Left panel ── */}
          <div className="w-72 flex-shrink-0 border-r border-gray-100 flex flex-col px-5 py-5 gap-5 overflow-y-auto">

            {/* Record button */}
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={handleRecordToggle}
                disabled={recordingState === 'processing' || recordingState === 'complete'}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {/* Pulse rings when recording */}
                {isRecording && (
                  <>
                    <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-40" />
                    <span className="absolute inset-[-6px] rounded-full border-2 border-red-300 opacity-60 animate-pulse" />
                  </>
                )}
                {isRecording ? (
                  <svg className="w-8 h-8 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>
              <p className="text-xs text-gray-500 font-medium">
                {recordingState === 'idle' && 'Press to record'}
                {recordingState === 'recording' && 'Recording… press to stop'}
                {recordingState === 'processing' && 'Generating brief…'}
                {recordingState === 'complete' && 'Brief ready'}
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Upload docs */}
            <button className="w-full flex items-center gap-2.5 px-3 py-2.5 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/40 transition-all">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Upload documents
            </button>

            {/* Divider */}
            <div className="h-px bg-gray-100" />

            {/* Consultant type selector */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">Consultant Type</label>
              <select
                value={consultantType}
                onChange={(e) => setConsultantType(e.target.value)}
                disabled={recordingState !== 'idle'}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 bg-white"
              >
                <option value="">Select type…</option>
                {CONSULTANT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Reset */}
            {recordingState === 'complete' && (
              <button
                onClick={handleReset}
                className="w-full text-xs text-gray-400 hover:text-gray-600 py-1 transition-colors"
              >
                ↺ Start over
              </button>
            )}
          </div>

          {/* ── Right panel ── */}
          <div className="flex-1 overflow-y-auto">

            {/* IDLE state */}
            {recordingState === 'idle' && (
              <div className="flex flex-col items-center justify-center h-full px-8 text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                  <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-700">Ready to record</p>
                <p className="text-sm text-gray-400 max-w-xs">
                  Select a project and consultant type, then press record and describe what you need. AI will extract the brief automatically.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 w-full max-w-sm text-left">
                  {['Project name & address', 'Scope of work', 'Deliverables required', 'Key dates & deadlines', 'Budget guidance', 'Constraints & risks'].map((hint) => (
                    <div key={hint} className="flex items-center gap-1.5 text-xs text-gray-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-300 flex-shrink-0" />
                      {hint}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RECORDING / PROCESSING state */}
            {(recordingState === 'recording' || recordingState === 'processing') && (
              <div className="px-6 py-5 space-y-4">
                {/* Transcript */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {isRecording && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {isRecording ? 'Live Transcript' : 'Transcript'}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 min-h-[120px]">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {transcript}
                      {isRecording && <span className="inline-block w-0.5 h-4 bg-blue-500 ml-0.5 animate-pulse align-middle" />}
                    </p>
                  </div>
                </div>

                {/* Processing indicator */}
                {recordingState === 'processing' && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <svg className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-700">AI is generating your brief…</p>
                      <p className="text-xs text-blue-500">Extracting scope, deliverables, dates and constraints</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* COMPLETE state */}
            {recordingState === 'complete' && brief && (
              <div className="px-6 py-5 space-y-5">

                {/* Transcript (collapsed) */}
                <details className="group">
                  <summary className="flex items-center gap-2 cursor-pointer list-none">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Transcript</span>
                    <svg className="w-3.5 h-3.5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-2 bg-gray-50 rounded-xl border border-gray-200 px-4 py-3">
                    <p className="text-sm text-gray-600 leading-relaxed">{MOCK_TRANSCRIPT}</p>
                  </div>
                </details>

                {/* AI Brief */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">AI Structured Brief</span>
                    <span className="text-[10px] font-medium bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Generated</span>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    {/* Meta fields */}
                    <div className="grid grid-cols-2 gap-px bg-gray-100">
                      {[
                        { label: 'Project', value: brief.project },
                        { label: 'Site Address', value: brief.siteAddress },
                        { label: 'Current Stage', value: brief.stage },
                        { label: 'Consultant Required', value: brief.consultantType },
                        { label: 'Required Dates', value: brief.requiredDates },
                        { label: 'Budget Estimate', value: brief.budgetEstimate },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-white px-4 py-3">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
                          <p className="text-sm text-gray-800 font-medium">{value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Scope */}
                    <div className="border-t border-gray-100 px-4 py-3">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Scope Required</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{brief.scope}</p>
                    </div>

                    {/* Deliverables */}
                    <div className="border-t border-gray-100 px-4 py-3">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Deliverables</p>
                      <ul className="space-y-1">
                        {brief.deliverables.map((d) => (
                          <li key={d} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Constraints */}
                    <div className="border-t border-gray-100 px-4 py-3">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Constraints</p>
                      <p className="text-sm text-gray-700">{brief.constraints}</p>
                    </div>
                  </div>
                </div>

                {/* Generated artifacts */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Generated Outputs</p>
                  <div className="grid grid-cols-2 gap-2">
                    <ArtifactButton
                      label="Consultant Brief"
                      sublabel="PDF ready to send"
                      icon={
                        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      }
                    />
                    <ArtifactButton
                      label="Email Draft"
                      sublabel="Ready to review & send"
                      icon={
                        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                      }
                    />
                    <ArtifactButton
                      label="Scope Checklist"
                      sublabel="Markdown checklist"
                      icon={
                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      }
                    />
                    <ArtifactButton
                      label="Fee Proposal Template"
                      sublabel="Editable Word doc"
                      icon={
                        <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
                        </svg>
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-3 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Close
          </button>
          {recordingState === 'complete' && (
            <button className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Email
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
