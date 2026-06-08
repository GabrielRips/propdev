import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PROJECT_PHASES } from '../data/projects';
import { useProjects, deleteProject } from '../data/projectStore';
import { phaseDetails } from '../data/phase-details';
import { projectCommandData } from '../data/project-insights';
import PhaseCard from './PhaseCard';
import AdvancedView from './AdvancedView';
import NoteModal from './NoteModal';
import VoiceModeModal from './VoiceModeModal';
import SoftPhoneModal from './SoftPhoneModal';
import PhasesEditorModal from './PhasesEditorModal';
import { contactsData } from '../data/contacts-data';
import AppShell from './AppShell';
import { useAuth } from '../auth/AuthContext';
import { canAccessProject } from '../data/roles';

type ViewMode = 'phases' | 'advanced';

const typeIcon: Record<string, string> = {
  'Townhouse Development': '🏘️',
  'Residential Tower': '🏢',
  'Subdivision': '🗺️',
};

function fmtAUD(v: number): string {
  return v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1_000).toFixed(0)}K`;
}

// ─── Project Email Modal ───────────────────────────────────────────────────────

function generateEmailBody(projectName: string): string {
  return `Hi,\n\nI hope this email finds you well.\n\nI am writing to you regarding the ${projectName} project.\n\nCould you please provide an update at your earliest convenience. Please don't hesitate to reach out if you need any further information.\n\nKind regards`;
}

function ProjectEmailModal({ projectName, onClose }: { projectName: string; onClose: () => void }) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState(`${projectName} — Follow Up`);
  const [body, setBody] = useState('');
  const [sent, setSent] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  function handleAiDraft() {
    setAiGenerating(true);
    setTimeout(() => {
      setBody(generateEmailBody(projectName));
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
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">New Email</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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
                <input
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
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
                  rows={6}
                  placeholder="Write your message or use AI Draft…"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const projects = useProjects();
  const { projectId } = useParams<{ projectId: string }>();
  const project = projects.find((p) => p.id === projectId);

  function handleDelete() {
    if (!project) return;
    if (window.confirm(`Delete "${project.name}" and all its data? This cannot be undone.`)) {
      deleteProject(project.id);
      navigate('/');
    }
  }
  const [viewMode, setViewMode] = useState<ViewMode>('phases');
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [voiceModeOpen, setVoiceModeOpen] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [phasesOpen, setPhasesOpen] = useState(false);
  const projectContacts = contactsData[projectId ?? ''] ?? [];

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project not found</h2>
          <Link to="/" className="text-blue-600 hover:underline text-sm">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!canAccessProject(user, project.id)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">You don't have access to this project</h2>
          <Link to="/" className="text-blue-600 hover:underline text-sm">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const projectPhaseDetails = phaseDetails[project.id] || {};
  const commandData = projectCommandData[project.id];

  // Show all phases that have any progress (> 0%)
  const activePhases = PROJECT_PHASES.filter(
    (phase) => (project.phases[phase] ?? 0) > 0
  );

  return (
    <AppShell>
        {/* Breadcrumb */}
        <nav className="mb-5 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            All projects
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-600 border border-gray-200 hover:border-red-200 rounded-lg px-2.5 py-1.5 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Delete project
          </button>
        </nav>

        {/* Project Header — Two Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {/* Left Panel — Project Identity */}
          <div className="surface p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                {typeIcon[project.type]}
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-gray-900 leading-tight tracking-tight">{project.name}</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {project.address}, {project.suburb} {project.state}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-gray-100">
              <div>
                <p className="text-[11px] text-gray-400">Est. value</p>
                <p className="text-sm font-semibold text-gray-800">{fmtAUD(project.estimatedValue)}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400">{project.type === 'Subdivision' ? 'Lots' : 'Units'}</p>
                <p className="text-sm font-semibold text-gray-800">{project.totalUnits}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400">Completion</p>
                <p className="text-sm font-semibold text-gray-800">
                  {new Date(project.estimatedCompletion).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              {project.name} Pty Ltd{commandData ? ` · ABN ${commandData.abn}` : ''}
            </p>
          </div>

          {/* Right Panel — Command Center */}
          <div className="surface p-6">
            {commandData && (
              <div className="flex flex-col gap-4">
                {/* Status Traffic Light */}
                <div className="flex items-start gap-2">
                  <div className={`w-3 h-3 rounded-full mt-0.5 ${
                    commandData.health.status === 'on_track' ? 'bg-emerald-500' :
                    commandData.health.status === 'at_risk' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className={`text-sm font-semibold ${
                      commandData.health.status === 'on_track' ? 'text-emerald-700' :
                      commandData.health.status === 'at_risk' ? 'text-amber-700' : 'text-red-700'
                    }`}>
                      {commandData.health.label}
                    </p>
                    <p className="text-xs text-gray-400">{commandData.health.reason}</p>
                  </div>
                </div>

                {/* AI Insights */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-xs font-medium text-gray-500">Insights</span>
                    <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">AI</span>
                  </div>
                  <ul className="space-y-1">
                    {commandData.insights.map((insight) => (
                      <li key={insight.id} className="text-xs text-gray-600 leading-relaxed flex items-start gap-1.5">
                        <span className="flex-shrink-0 mt-px">
                          {insight.category === 'risk' ? '\u26A0\uFE0F' : insight.category === 'opportunity' ? '\u2726' : '\u2192'}
                        </span>
                        <span>{insight.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => setNoteModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                    Note
                  </button>
                  <button
                    onClick={() => setEmailModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    Email
                  </button>
                  <button
                    onClick={() => setCallModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    Call
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                    </svg>
                    SMS
                  </button>
                  <button
                    onClick={() => setVoiceModeOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                    </svg>
                    Voice Mode
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            {viewMode === 'phases' ? 'Phase progress' : 'Project workspace'}
          </h2>
          <div className="flex items-center gap-2">
            {viewMode === 'phases' && (
              <button
                onClick={() => setPhasesOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
                Edit phases
              </button>
            )}
            <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('phases')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                viewMode === 'phases'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Phases
            </button>
            <button
              onClick={() => setViewMode('advanced')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                viewMode === 'advanced'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Advanced
            </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'phases' ? (
          activePhases.length === 0 ? (
            <div className="surface p-12 text-center">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="text-base font-semibold text-gray-900">No phases set yet</h3>
              <p className="text-sm text-gray-500 mt-1">Set how far along each phase is to start tracking progress.</p>
              <button
                onClick={() => setPhasesOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-800"
              >
                Edit phases
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {activePhases.map((phase) => (
                <PhaseCard
                  key={phase}
                  projectId={project.id}
                  phase={phase}
                  progress={project.phases[phase] ?? 0}
                  detail={projectPhaseDetails[phase]}
                />
              ))}
            </div>
          )
        ) : (
          <AdvancedView projectId={project.id} project={project} />
        )}

      {phasesOpen && (
        <PhasesEditorModal project={project} onClose={() => setPhasesOpen(false)} />
      )}

      {noteModalOpen && (
        <NoteModal
          projectName={project.name}
          onClose={() => setNoteModalOpen(false)}
        />
      )}

      {emailModalOpen && (
        <ProjectEmailModal
          projectName={project.name}
          onClose={() => setEmailModalOpen(false)}
        />
      )}

      {voiceModeOpen && (
        <VoiceModeModal
          projectName={project.name}
          onClose={() => setVoiceModeOpen(false)}
        />
      )}

      {callModalOpen && projectContacts.length > 0 && (
        <SoftPhoneModal
          contact={projectContacts[0]}
          allContacts={projectContacts}
          onClose={() => setCallModalOpen(false)}
        />
      )}
    </AppShell>
  );
}
