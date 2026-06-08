import React, { useState } from 'react';
import { useProjects } from '../data/projectStore';
import AppShell from './AppShell';
import { useAuth } from '../auth/AuthContext';
import { canAccessProject } from '../data/roles';

// ─── Types ────────────────────────────────────────────────────────────────────

type AgentStatus = 'active' | 'thinking' | 'waiting' | 'alert' | 'idle';

interface Agent {
  id: string;
  name: string;
  role: string;
  icon: string;
  status: AgentStatus;
  currentTask: string;
  lastAction: string;
  progress?: number;
  alertMessage?: string;
  msgCount: number;
  doneCount: number;
}

interface AgentMessage {
  id: string;
  from: string;
  fromIcon: string;
  to: string;
  toIcon: string;
  timestamp: string;
  content: string;
  type: 'info' | 'request' | 'alert' | 'complete' | 'decision';
}

interface Decision {
  id: string;
  agentId: string;
  agentName: string;
  agentIcon: string;
  title: string;
  context: string;
  urgency: 'critical' | 'high' | 'medium';
  options: { label: string; description: string }[];
}

interface ProjectAgentData {
  agents: Agent[];
  messages: AgentMessage[];
  decisions: Decision[];
}

// ─── Visual Config ────────────────────────────────────────────────────────────

const statusConfig: Record<AgentStatus, {
  border: string; glow: string; bg: string; dot: string;
  label: string; labelColor: string; headerBg: string;
}> = {
  active:   { border: 'border-emerald-500/60', glow: 'shadow-emerald-500/20', bg: 'bg-emerald-950/20', dot: 'bg-emerald-400', label: 'Active',   labelColor: 'text-emerald-400', headerBg: 'bg-emerald-950/40' },
  thinking: { border: 'border-violet-500/60',  glow: 'shadow-violet-500/20',  bg: 'bg-violet-950/20',  dot: 'bg-violet-400',  label: 'Thinking', labelColor: 'text-violet-400',  headerBg: 'bg-violet-950/40'  },
  waiting:  { border: 'border-amber-500/60',   glow: 'shadow-amber-500/10',   bg: 'bg-amber-950/15',   dot: 'bg-amber-400',   label: 'Waiting',  labelColor: 'text-amber-400',  headerBg: 'bg-amber-950/30'   },
  alert:    { border: 'border-red-500/70',     glow: 'shadow-red-500/25',     bg: 'bg-red-950/25',     dot: 'bg-red-400',     label: 'Alert',    labelColor: 'text-red-400',    headerBg: 'bg-red-950/50'     },
  idle:     { border: 'border-slate-700/80',   glow: '',                      bg: 'bg-slate-900/40',   dot: 'bg-slate-600',   label: 'Idle',     labelColor: 'text-slate-500',  headerBg: 'bg-slate-800/40'   },
};

const msgTypeConfig: Record<AgentMessage['type'], { icon: string; color: string; bg: string }> = {
  info:     { icon: 'ℹ', color: 'text-sky-400',     bg: 'bg-sky-950/40 border-sky-800/30'        },
  request:  { icon: '→', color: 'text-amber-400',   bg: 'bg-amber-950/30 border-amber-800/30'    },
  alert:    { icon: '⚠', color: 'text-red-400',     bg: 'bg-red-950/40 border-red-800/40'        },
  complete: { icon: '✓', color: 'text-emerald-400', bg: 'bg-emerald-950/25 border-emerald-800/30'},
  decision: { icon: '◆', color: 'text-violet-400',  bg: 'bg-violet-950/35 border-violet-800/40'  },
};

const urgencyConfig: Record<Decision['urgency'], { label: string; color: string; bg: string; border: string }> = {
  critical: { label: 'CRITICAL', color: 'text-red-400',   bg: 'bg-red-950/60',   border: 'border-red-700/60'   },
  high:     { label: 'HIGH',     color: 'text-amber-400', bg: 'bg-amber-950/50', border: 'border-amber-700/60' },
  medium:   { label: 'MEDIUM',   color: 'text-sky-400',   bg: 'bg-sky-950/40',   border: 'border-sky-700/60'   },
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const ALL_PROJECT_DATA: Record<string, ProjectAgentData> = {};

// ─── Agent Card ───────────────────────────────────────────────────────────────

function AgentCard({ agent }: { agent: Agent }) {
  const sc = statusConfig[agent.status];

  return (
    <div className={`rounded-xl border ${sc.border} ${sc.bg} shadow-lg ${sc.glow} flex flex-col overflow-hidden`}>
      {/* Header */}
      <div className={`${sc.headerBg} px-3 pt-3 pb-2`}>
        <div className="flex items-start justify-between gap-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg leading-none flex-shrink-0">{agent.icon}</span>
            <div className="min-w-0">
              <p className="text-white text-[13px] font-semibold leading-tight">{agent.name}</p>
              <p className="text-slate-400 text-[10px] leading-tight truncate">{agent.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
            {agent.status === 'alert' ? (
              <span className="relative flex w-2 h-2 flex-shrink-0">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${sc.dot} opacity-75`} />
                <span className={`relative inline-flex rounded-full w-2 h-2 ${sc.dot}`} />
              </span>
            ) : (
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sc.dot} ${agent.status === 'active' ? 'animate-pulse' : ''}`} />
            )}
            <span className={`text-[10px] font-medium ${sc.labelColor}`}>{sc.label}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-3 py-2 flex-1 flex flex-col gap-2">
        {/* Current task */}
        <div>
          <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5">Now</p>
          <p className="text-slate-300 text-[11px] leading-snug line-clamp-3">
            {agent.currentTask}
            {agent.status === 'thinking' && (
              <span className="inline-flex gap-0.5 ml-1 align-middle">
                <span className="w-1 h-1 bg-violet-400 rounded-full animate-bounce inline-block" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-1 bg-violet-400 rounded-full animate-bounce inline-block" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-1 bg-violet-400 rounded-full animate-bounce inline-block" style={{ animationDelay: '300ms' }} />
              </span>
            )}
          </p>
        </div>

        {/* Progress */}
        {agent.progress !== undefined && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">Progress</span>
              <span className={`text-[10px] font-semibold ${sc.labelColor}`}>{agent.progress}%</span>
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  agent.status === 'active' ? 'bg-emerald-500' :
                  agent.status === 'thinking' ? 'bg-violet-500' :
                  'bg-slate-500'
                }`}
                style={{ width: `${agent.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Alert message */}
        {agent.alertMessage && (
          <div className="bg-red-950/50 border border-red-800/40 rounded-lg px-2 py-1.5">
            <p className="text-red-300 text-[10px] leading-relaxed">{agent.alertMessage}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 pb-2.5 pt-2 border-t border-slate-800/50 flex items-center gap-3">
        <span className="text-slate-600 text-[10px]">{agent.msgCount} msgs</span>
        <span className="text-slate-600 text-[10px]">{agent.doneCount} done</span>
      </div>
    </div>
  );
}

// ─── Message Item ─────────────────────────────────────────────────────────────

function MessageItem({ msg }: { msg: AgentMessage }) {
  const tc = msgTypeConfig[msg.type];

  return (
    <div className={`rounded-lg px-3 py-2.5 border ${tc.bg}`}>
      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
        <span className={`text-xs font-bold ${tc.color} flex-shrink-0`}>{tc.icon}</span>
        <span className="text-slate-300 text-[11px] font-medium">{msg.fromIcon} {msg.from}</span>
        <span className="text-slate-600 text-[10px]">→</span>
        <span className="text-slate-400 text-[11px]">{msg.toIcon} {msg.to}</span>
        <span className="text-slate-600 text-[10px] ml-auto">{msg.timestamp}</span>
      </div>
      <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2">{msg.content}</p>
    </div>
  );
}

// ─── Decision Card ────────────────────────────────────────────────────────────

function DecisionCard({ decision, onDismiss }: { decision: Decision; onDismiss: (id: string) => void }) {
  const uc = urgencyConfig[decision.urgency];

  return (
    <div className={`rounded-xl border ${uc.border} ${uc.bg} overflow-hidden flex flex-col`}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-800/50">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-full border ${uc.color} ${uc.border}`}>
            {uc.label}
          </span>
          <span className="text-slate-400 text-xs">{decision.agentIcon} {decision.agentName} Agent</span>
        </div>
        <h3 className="text-white font-semibold text-sm leading-snug">{decision.title}</h3>
        <p className="text-slate-400 text-[11px] mt-1.5 leading-relaxed">{decision.context}</p>
      </div>

      {/* Options */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        {decision.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => onDismiss(decision.id)}
            className="w-full text-left bg-slate-800/50 hover:bg-slate-700/60 border border-slate-700/50 hover:border-slate-500/70 rounded-lg px-3 py-2.5 transition-all group cursor-pointer"
          >
            <p className="text-white text-xs font-medium group-hover:text-blue-300 transition-colors">{opt.label}</p>
            <p className="text-slate-500 text-[11px] mt-0.5 leading-snug">{opt.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AgenticDashboard() {
  const { user } = useAuth();
  const projects = useProjects();
  const visibleProjects = projects.filter((p) => canAccessProject(user, p.id));
  const [activeProjectId, setActiveProjectId] = useState(
    visibleProjects[0]?.id ?? ''
  );
  const [dismissedDecisions, setDismissedDecisions] = useState<Record<string, Set<string>>>({});

  const activeProject = visibleProjects.find((p) => p.id === activeProjectId);
  const data: ProjectAgentData = ALL_PROJECT_DATA[activeProjectId] ?? { agents: [], messages: [], decisions: [] };

  const projectDismissed = dismissedDecisions[activeProjectId] ?? new Set<string>();
  const activeDecisions = data.decisions.filter((d) => !projectDismissed.has(d.id));

  const dismissDecision = (decisionId: string) => {
    setDismissedDecisions((prev) => {
      const existing = prev[activeProjectId];
      const next = new Set<string>(existing ? Array.from(existing) : []);
      next.add(decisionId);
      return { ...prev, [activeProjectId]: next };
    });
  };

  const countByStatus = (s: AgentStatus) => data.agents.filter((a) => a.status === s).length;
  const totalMsgsToday = data.agents.reduce((sum, a) => sum + a.msgCount, 0);

  const alertBadgeProjects = visibleProjects.filter((p) => {
    const d = ALL_PROJECT_DATA[p.id];
    return d && d.agents.some((a) => a.status === 'alert');
  }).map((p) => p.id);

  return (
    <AppShell title="Agentic Network" subtitle="AI agents working across your portfolio">
      <div className="bg-slate-950 rounded-2xl border border-slate-800 px-4 sm:px-6 py-6">

        {/* Page title */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-white">Agentic Dashboard</h2>
              <span className="text-[9px] font-bold tracking-widest text-violet-400 border border-violet-700/50 bg-violet-950/50 px-2.5 py-1 rounded-full uppercase">
                Concept · 2028
              </span>
            </div>
            <p className="text-sm text-slate-400">
              AI agent network orchestrating your full property development portfolio
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 mt-1">
            <span className="relative flex w-2 h-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-400" />
            </span>
            <span className="text-emerald-400 text-xs font-medium">AI Network Online</span>
            <span className="text-slate-600 text-xs mx-1">·</span>
            <span className="text-slate-400 text-xs">{totalMsgsToday.toLocaleString()} tasks processed</span>
          </div>
        </div>

        {/* Project tabs */}
        <div className="border-b border-slate-800 mb-5">
          <nav className="flex gap-1 overflow-x-auto">
            {visibleProjects.map((p) => {
              const isActive = p.id === activeProjectId;
              const hasAlert = alertBadgeProjects.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveProjectId(p.id)}
                  className={`flex-shrink-0 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px relative ${
                    isActive
                      ? 'text-white border-blue-500 bg-slate-900/60'
                      : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/40'
                  }`}
                >
                  <span>{p.name}</span>
                  <span className={`block text-[10px] font-normal ${isActive ? 'text-slate-400' : 'text-slate-600'}`}>
                    {p.suburb}, {p.state}
                  </span>
                  {hasAlert && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Active',    value: countByStatus('active'),   color: 'text-emerald-400', bg: 'bg-emerald-950/30 border-emerald-800/40' },
            { label: 'Thinking',  value: countByStatus('thinking'), color: 'text-violet-400',  bg: 'bg-violet-950/30 border-violet-800/40'  },
            { label: 'Alerts',    value: countByStatus('alert'),    color: 'text-red-400',     bg: 'bg-red-950/30 border-red-800/40'        },
            { label: 'Waiting',   value: countByStatus('waiting'),  color: 'text-amber-400',   bg: 'bg-amber-950/20 border-amber-800/40'    },
            { label: 'Decisions', value: activeDecisions.length,    color: 'text-sky-400',     bg: 'bg-sky-950/30 border-sky-800/40'        },
          ].map((stat) => (
            <div key={stat.label} className={`border rounded-xl px-4 py-3 ${stat.bg}`}>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Main layout: agent grid + comms feed */}
        <div className="flex flex-col xl:flex-row gap-4">

          {/* Agent Network */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-slate-200 text-sm font-semibold">Agent Network</h3>
              <span className="text-slate-600 text-xs">— {data.agents.length} agents deployed for {activeProject?.name ?? 'your portfolio'}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {data.agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </div>

          {/* Comms Feed */}
          <div className="xl:w-80 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-slate-200 text-sm font-semibold">Agent Comms</h3>
              <span className="text-slate-600 text-xs">— live feed</span>
            </div>
            <div className="flex flex-col gap-2">
              {data.messages.map((msg) => (
                <MessageItem key={msg.id} msg={msg} />
              ))}
            </div>
          </div>
        </div>

        {/* Decision Queue */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-slate-200 text-sm font-semibold">Manager Decision Queue</h3>
            {activeDecisions.length > 0 ? (
              <span className="text-slate-600 text-xs">— {activeDecisions.length} pending</span>
            ) : (
              <span className="text-emerald-500 text-xs">— clear</span>
            )}
          </div>

          {activeDecisions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeDecisions.map((decision) => (
                <DecisionCard key={decision.id} decision={decision} onDismiss={dismissDecision} />
              ))}
            </div>
          ) : (
            <div className="border border-slate-800/60 rounded-xl px-6 py-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <p className="text-emerald-400 text-sm font-medium">No decisions pending</p>
              </div>
              <p className="text-slate-600 text-xs">
                All agents are operating autonomously. You will be notified when input is required.
              </p>
            </div>
          )}
        </div>

      </div>
    </AppShell>
  );
}
