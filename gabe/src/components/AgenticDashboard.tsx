import React, { useState } from 'react';
import { projects } from '../data/projects';
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

const ALL_PROJECT_DATA: Record<string, ProjectAgentData> = {

  // ── proj-001: Riverside Townhouses, Abbotsford VIC (Construction phase) ──
  'proj-001': {
    agents: [
      {
        id: 'scout', name: 'Scout', role: 'Site Discovery', icon: '🔍', status: 'idle',
        currentTask: 'Monitoring 11 off-market watchlist properties in inner Melbourne',
        lastAction: 'Delivered site report for 42 Lithgow St — project now in construction phase',
        msgCount: 87, doneCount: 24,
      },
      {
        id: 'analyst', name: 'Analyst', role: 'Market Research', icon: '📊', status: 'thinking',
        currentTask: 'Analysing Abbotsford resale velocity for comparable townhouse stock',
        lastAction: 'Q1 2026 update: Abbotsford 3BR townhouse median $1.64M (+3.8% YoY)',
        progress: 55, msgCount: 112, doneCount: 31,
      },
      {
        id: 'legal', name: 'Legal', role: 'Contracts & Compliance', icon: '⚖️', status: 'idle',
        currentTask: 'Monitoring defects liability period — expires Oct 2026',
        lastAction: 'Owners Corporation registration lodged with Land Titles Office VIC',
        msgCount: 56, doneCount: 19,
      },
      {
        id: 'finance', name: 'Finance', role: 'Feasibility & Funding', icon: '💰', status: 'active',
        currentTask: 'Reconciling construction drawdown #4 with ANZ — $940K submission',
        lastAction: 'Cash flow updated: net profit tracking at $2.1M (14.6% margin)',
        progress: 80, msgCount: 143, doneCount: 38,
      },
      {
        id: 'permit', name: 'Permit', role: 'Planning & Council', icon: '🏛️', status: 'idle',
        currentTask: 'Planning permit obtained — monitoring VCAT appeal window',
        lastAction: 'VCAT appeal period expired without challenge — permit now unconditional',
        msgCount: 67, doneCount: 22,
      },
      {
        id: 'design', name: 'Design', role: 'Architecture Coordination', icon: '📐', status: 'waiting',
        currentTask: 'Awaiting builder RFI response on kitchen joinery specification (RFI #12)',
        lastAction: 'Issued 14 RFIs to construction team — 11 resolved, 3 outstanding',
        msgCount: 94, doneCount: 29,
      },
      {
        id: 'build', name: 'Build', role: 'Construction Management', icon: '🏗️', status: 'active',
        currentTask: 'Monitoring Level 2 fit-out progress — week 18 of 36',
        lastAction: 'Waterproofing inspection passed — tiling commenced on Units 1–6',
        progress: 65, msgCount: 178, doneCount: 45,
      },
      {
        id: 'sales', name: 'Sales', role: 'Pre-sales & Marketing', icon: '🏠', status: 'active',
        currentTask: 'Managing settlement sequencing for 10 contracted buyers',
        lastAction: '10/12 townhouses under contract. Units 1 & 2 re-listed at updated pricing',
        progress: 80, msgCount: 204, doneCount: 56,
      },
      {
        id: 'risk', name: 'Risk', role: 'Risk Monitoring', icon: '⚠️', status: 'alert',
        currentTask: 'Monitoring subcontractor cash flow — tiling trade flagged',
        lastAction: 'Issued risk bulletin: Brillante Tiling showing signs of financial distress',
        alertMessage: 'Brillante Tiling has 2 unpaid supplier invoices ($28K). Risk of work stoppage on Units 7–12. Recommend retention review.',
        msgCount: 231, doneCount: 61,
      },
      {
        id: 'comms', name: 'Comms', role: 'Stakeholder Relations', icon: '📣', status: 'thinking',
        currentTask: 'Drafting settlement preparation guide for all 10 contracted buyers',
        lastAction: 'Month 18 construction update distributed to buyers and 3 investors',
        progress: 40, msgCount: 167, doneCount: 44,
      },
    ],
    messages: [
      { id: 'm1', from: 'Risk', fromIcon: '⚠️', to: 'You', toIcon: '👤', timestamp: '3 min ago', content: 'Brillante Tiling has 2 unpaid supplier invoices ($28K total). Risk of work stoppage on Units 7–12. Recommend reviewing retention strategy with Build agent immediately.', type: 'alert' },
      { id: 'm2', from: 'Finance', fromIcon: '💰', to: 'You', toIcon: '👤', timestamp: '12 min ago', content: 'Drawdown #4 of $940K submitted to ANZ. QS certification attached. Funds expected in 5 business days. Cash position post-drawdown: $340K operating buffer.', type: 'info' },
      { id: 'm3', from: 'Build', fromIcon: '🏗️', to: 'Design', toIcon: '📐', timestamp: '28 min ago', content: 'RFI #12 — kitchen joinery: requesting approval for Blum hinge substitution for Hafele (6-week supply delay). No cost impact. Please advise by COB Thursday.', type: 'request' },
      { id: 'm4', from: 'Sales', fromIcon: '🏠', to: 'You', toIcon: '👤', timestamp: '1 hr ago', content: 'Unit 5 buyer requesting 60-day sunset clause extension due to mortgage valuation delays. Legal agent reviewing options — recommend decision within 48 hours.', type: 'decision' },
      { id: 'm5', from: 'Analyst', fromIcon: '📊', to: 'Sales', toIcon: '🏠', timestamp: '2 hrs ago', content: 'Resale analysis complete: comparable Abbotsford 3BR townhouses now at $1.64M median. Our Units 1 & 2 relisted at $1.72M are well-positioned for the current market.', type: 'complete' },
      { id: 'm6', from: 'Comms', fromIcon: '📣', to: 'You', toIcon: '👤', timestamp: '3 hrs ago', content: 'Month 18 construction update sent to 3 investors. All acknowledged. Positive feedback from Stuart Hanley (Pacific Capital) re: build quality photos.', type: 'complete' },
    ],
    decisions: [
      {
        id: 'd1', agentId: 'risk', agentName: 'Risk', agentIcon: '⚠️',
        title: 'Subcontractor cash flow risk — tiler',
        context: 'Brillante Tiling has 2 outstanding supplier invoices ($28K total). They are mid-way through tiling Units 7–12. A work stoppage would delay practical completion by 3–4 weeks and trigger approximately $85K in liquidated damages.',
        urgency: 'high',
        options: [
          { label: 'Accelerate payment', description: 'Pay next progress claim early (~$22K) to maintain tiler cash flow. Risk: reduced leverage.' },
          { label: 'Hold & monitor 48hrs', description: 'Retain current position and issue formal payment notice. Monitor closely.' },
          { label: 'Source standby tiler', description: 'Instruct Build agent to identify alternate tiler. Estimated 3-day lead time.' },
        ],
      },
      {
        id: 'd2', agentId: 'sales', agentName: 'Sales', agentIcon: '🏠',
        title: 'Buyer sunset clause extension request — Unit 5',
        context: 'Purchaser of Unit 5 (contracted at $1.68M) requests a 60-day sunset clause extension due to mortgage valuation delays. If declined, buyer may rescind. Unit could be re-sold at current market of $1.72M+.',
        urgency: 'medium',
        options: [
          { label: 'Grant 30-day extension', description: 'Compromise position. Maintains buyer relationship. Minimal cash flow impact.' },
          { label: 'Grant full 60 days', description: 'Buyer satisfied. Delays settlement and project cash flow by 2 months.' },
          { label: 'Decline extension', description: 'Hold contract terms. Buyer may rescind — unit re-listed at higher current price.' },
        ],
      },
    ],
  },

  // ── proj-002: Wattle Grove Residences, Kellyville NSW (Planning & Design) ──
  'proj-002': {
    agents: [
      {
        id: 'scout', name: 'Scout', role: 'Site Discovery', icon: '🔍', status: 'idle',
        currentTask: 'Site confirmed — 18 Memorial Avenue, Kellyville NSW',
        lastAction: 'Final site due diligence complete. 8-townhouse development potential confirmed.',
        msgCount: 45, doneCount: 12,
      },
      {
        id: 'analyst', name: 'Analyst', role: 'Market Research', icon: '📊', status: 'active',
        currentTask: 'Monitoring NW Sydney townhouse absorption rates and buyer demand',
        lastAction: 'NW Sydney townhouse median $1.28M. Demand driven by Metro Northwest commuters.',
        progress: 72, msgCount: 78, doneCount: 21,
      },
      {
        id: 'legal', name: 'Legal', role: 'Contracts & Compliance', icon: '⚖️', status: 'active',
        currentTask: 'Reviewing Section 10.7 certificate and drafting contracts for 8 townhouses',
        lastAction: 'Title clear. Planning certificate received — no adverse conditions or overlays.',
        progress: 60, msgCount: 41, doneCount: 11,
      },
      {
        id: 'finance', name: 'Finance', role: 'Feasibility & Funding', icon: '💰', status: 'thinking',
        currentTask: 'Refining construction cost budget following builder tender responses',
        lastAction: 'Initial feasibility: IRR 16.4% at 8 units, $1.1M average sale price.',
        progress: 45, msgCount: 62, doneCount: 17,
      },
      {
        id: 'permit', name: 'Permit', role: 'Planning & Council', icon: '🏛️', status: 'alert',
        currentTask: 'Responding to Council RFI #2 — heritage view corridor assessment required',
        lastAction: 'DA lodged with The Hills Shire Council on 27 Feb 2026',
        alertMessage: 'Council RFI #2: heritage view corridor affects rear setback of Units 7 & 8. Design adjustment required. Response due 14 Mar 2026.',
        msgCount: 53, doneCount: 14,
      },
      {
        id: 'design', name: 'Design', role: 'Architecture Coordination', icon: '📐', status: 'active',
        currentTask: 'Revising rear setback on Units 7–8 in response to heritage view RFI',
        lastAction: 'DA drawings issued to council 27 Feb. 85% of design documentation complete.',
        progress: 85, msgCount: 71, doneCount: 19,
      },
      {
        id: 'build', name: 'Build', role: 'Construction Management', icon: '🏗️', status: 'idle',
        currentTask: 'Awaiting planning approval before engaging construction tender',
        lastAction: 'Reviewed 2 preliminary builder quotes. BBW Construction preferred on value.',
        msgCount: 18, doneCount: 5,
      },
      {
        id: 'sales', name: 'Sales', role: 'Pre-sales & Marketing', icon: '🏠', status: 'thinking',
        currentTask: 'Building buyer prospect database for pre-DA launch campaign',
        lastAction: '30% presales secured (2.4/8 units). EOI list: 22 registered buyers.',
        progress: 30, msgCount: 89, doneCount: 23,
      },
      {
        id: 'risk', name: 'Risk', role: 'Risk Monitoring', icon: '⚠️', status: 'waiting',
        currentTask: 'Monitoring council DA timeline — response window closes 20 Mar 2026',
        lastAction: 'Risk register updated: council delay risk elevated to MEDIUM.',
        msgCount: 67, doneCount: 18,
      },
      {
        id: 'comms', name: 'Comms', role: 'Stakeholder Relations', icon: '📣', status: 'idle',
        currentTask: 'Pending DA milestone before next investor communication',
        lastAction: 'DA lodgement update distributed to 2 investors on 14 Feb.',
        msgCount: 34, doneCount: 9,
      },
    ],
    messages: [
      { id: 'm1', from: 'Permit', fromIcon: '🏛️', to: 'Design', toIcon: '📐', timestamp: '5 min ago', content: 'Council RFI #2 received. Heritage view corridor affects Units 7 & 8 rear setback by 1.2m. Please revise plans and confirm GFA impact. Response due to council by 14 Mar.', type: 'alert' },
      { id: 'm2', from: 'Design', fromIcon: '📐', to: 'Permit', toIcon: '🏛️', timestamp: '20 min ago', content: 'Rear setback revision underway. Preliminary: 0.8m depth reduction to Units 7 & 8, ~12sqm GFA loss total. Revised plans ready in 3 business days.', type: 'info' },
      { id: 'm3', from: 'Finance', fromIcon: '💰', to: 'You', toIcon: '👤', timestamp: '45 min ago', content: 'Builder tender analysis complete. BBW Construction lowest conforming bid at $4.2M — 8% above budget estimate. IRR revised from 16.4% to 15.1%. Your decision needed.', type: 'decision' },
      { id: 'm4', from: 'Analyst', fromIcon: '📊', to: 'Sales', toIcon: '🏠', timestamp: '1 hr ago', content: 'Kellyville buyer demand strong: 3BR townhouses with 2-car garage averaging 4.2 months sell-through. Recommend emphasising garage and storage in marketing collateral.', type: 'complete' },
      { id: 'm5', from: 'Legal', fromIcon: '⚖️', to: 'Finance', toIcon: '💰', timestamp: '2 hrs ago', content: 'Section 10.7 certificate clear — no road widening, heritage or flood overlays. Title confirmed free of encumbrances. Contracts can proceed post-DA determination.', type: 'complete' },
    ],
    decisions: [
      {
        id: 'd1', agentId: 'finance', agentName: 'Finance', agentIcon: '💰',
        title: 'Builder tender 8% over budget — how to proceed?',
        context: "BBW Construction's tender of $4.2M is 8% above the $3.88M budget estimate. It is the lowest conforming bid of 2 received. Accepting as-is reduces IRR from 16.4% to 15.1%. Re-tendering would add 4–6 weeks.",
        urgency: 'high',
        options: [
          { label: 'Accept & negotiate scope', description: 'Accept BBW in principle, negotiate ~$120K in scope reductions. Target $4.08M.' },
          { label: 'Re-tender to 3 builders', description: 'Broaden the tender pool. 4–6 week delay. May not yield materially better pricing.' },
          { label: 'Value-engineer the design', description: 'Instruct Design agent to identify cost savings. 7-day process before re-quoting.' },
        ],
      },
      {
        id: 'd2', agentId: 'permit', agentName: 'Permit', agentIcon: '🏛️',
        title: 'Heritage corridor — redesign or challenge council?',
        context: 'Council RFI #2 requires rear setback adjustment to Units 7–8 to protect a heritage view corridor, resulting in ~12sqm GFA loss. Alternative: formal objection via a heritage planning consultant.',
        urgency: 'medium',
        options: [
          { label: 'Redesign as requested', description: 'Comply with council. 3-day design revision. Fastest path to permit approval.' },
          { label: 'Engage planning consultant', description: 'Challenge the RFI with a heritage expert. 15–20 day process, ~$8K cost.' },
          { label: 'Request informal meeting', description: 'Seek pre-determination meeting with council planner to negotiate outcome first.' },
        ],
      },
    ],
  },

  // ── proj-003: Horizon Tower, South Brisbane QLD (Mid-construction, 320 units) ──
  'proj-003': {
    agents: [
      {
        id: 'scout', name: 'Scout', role: 'Site Discovery', icon: '🔍', status: 'idle',
        currentTask: 'Site acquired — 155 Grey Street, South Brisbane QLD',
        lastAction: 'Site acquisition complete Dec 2024. No further scouting required.',
        msgCount: 34, doneCount: 9,
      },
      {
        id: 'analyst', name: 'Analyst', role: 'Market Research', icon: '📊', status: 'thinking',
        currentTask: 'Monitoring South Brisbane apartment resale market and rental yield trends',
        lastAction: 'South Brisbane 2BR: median $895K, rental yield 4.8% (+0.3% YoY). Strong investor demand.',
        progress: 60, msgCount: 189, doneCount: 52,
      },
      {
        id: 'legal', name: 'Legal', role: 'Contracts & Compliance', icon: '⚖️', status: 'idle',
        currentTask: 'Monitoring body corporate registration and settlement sequencing for 320 lots',
        lastAction: 'All 320 contracts of sale executed. Body corporate establishment in progress.',
        msgCount: 134, doneCount: 37,
      },
      {
        id: 'finance', name: 'Finance', role: 'Feasibility & Funding', icon: '💰', status: 'active',
        currentTask: 'Managing $48M Westpac construction facility — drawdown schedule',
        lastAction: 'Drawdown #6 of $3.8M approved. Total drawn: $28.4M of $48M facility.',
        progress: 62, msgCount: 267, doneCount: 71,
      },
      {
        id: 'permit', name: 'Permit', role: 'Planning & Council', icon: '🏛️', status: 'idle',
        currentTask: 'Planning and building permits current — monitoring compliance conditions',
        lastAction: 'Minor amendment approved — relocated bike storage Level 3. No program impact.',
        msgCount: 98, doneCount: 27,
      },
      {
        id: 'design', name: 'Design', role: 'Architecture Coordination', icon: '📐', status: 'waiting',
        currentTask: 'Awaiting builder RFI response — mechanical plant room relocation (Level 44)',
        lastAction: 'Issued 32 RFIs to construction team. 28 resolved. 4 outstanding on critical path.',
        msgCount: 178, doneCount: 49,
      },
      {
        id: 'build', name: 'Build', role: 'Construction Management', icon: '🏗️', status: 'alert',
        currentTask: 'Level 22 formwork — tracking 3 weeks behind approved program',
        lastAction: 'Concrete pour Level 21 completed. Tower crane breakdown caused 8-day delay.',
        alertMessage: "Tower crane breakdown (repaired) + labour shortage = 3-week program delay. Liquidated damages risk if recovery program not approved.",
        progress: 50, msgCount: 312, doneCount: 84,
      },
      {
        id: 'sales', name: 'Sales', role: 'Pre-sales & Marketing', icon: '🏠', status: 'active',
        currentTask: 'Managing 320-buyer settlement pipeline and monitoring investor resales',
        lastAction: '98% of apartments sold. 7 investor resales launched at 12% avg premium.',
        progress: 98, msgCount: 445, doneCount: 120,
      },
      {
        id: 'risk', name: 'Risk', role: 'Risk Monitoring', icon: '⚠️', status: 'alert',
        currentTask: 'Monitoring program recovery — LD threshold breached in 18 weeks if unresolved',
        lastAction: 'Issued escalation notice: delay may trigger $2.4M in liquidated damages.',
        alertMessage: "At current recovery rate, project will exceed LD threshold in 18 weeks. Builder's recovery program requires your approval to proceed.",
        msgCount: 389, doneCount: 105,
      },
      {
        id: 'comms', name: 'Comms', role: 'Stakeholder Relations', icon: '📣', status: 'active',
        currentTask: 'Preparing buyer communication — revised completion timeline (Q2 2030)',
        lastAction: 'Investor update #14 sent to 8 investors. 6 responded. 2 requesting meetings.',
        progress: 55, msgCount: 334, doneCount: 89,
      },
    ],
    messages: [
      { id: 'm1', from: 'Risk', fromIcon: '⚠️', to: 'You', toIcon: '👤', timestamp: '1 min ago', content: 'Program delay now at 3 weeks. Builder has submitted recovery program — additional crane hire and weekend overtime at $1.1M (within contingency). LD risk of $2.4M in 18 weeks without approval.', type: 'alert' },
      { id: 'm2', from: 'Build', fromIcon: '🏗️', to: 'You', toIcon: '👤', timestamp: '15 min ago', content: 'Tower crane repair complete. Level 22 formwork resuming today. Builder requests urgent meeting to discuss recovery program approval. Proposes 2nd crane + OT to claw back 3 weeks.', type: 'request' },
      { id: 'm3', from: 'Comms', fromIcon: '📣', to: 'You', toIcon: '👤', timestamp: '30 min ago', content: 'Draft buyer communication prepared re: Q2 2030 revised completion (6-month delay). Legal reviewed — no sunset clause exposure for current buyers. Awaiting your approval to send to 320 buyers.', type: 'decision' },
      { id: 'm4', from: 'Finance', fromIcon: '💰', to: 'You', toIcon: '👤', timestamp: '1 hr ago', content: 'Recovery program cost: $1.1M — fundable from remaining contingency ($1.8M). Net benefit vs. LD risk: +$1.3M in favour of approving recovery. Recommend proceeding.', type: 'info' },
      { id: 'm5', from: 'Sales', fromIcon: '🏠', to: 'Comms', toIcon: '📣', timestamp: '2 hrs ago', content: '4 buyers have made direct enquiries about completion timeline. Recommend sending buyer communication before speculation spreads. Proactive is better than reactive here.', type: 'request' },
    ],
    decisions: [
      {
        id: 'd1', agentId: 'build', agentName: 'Build', agentIcon: '🏗️',
        title: 'Approve construction recovery program?',
        context: 'Tower crane breakdown + labour shortage created a 3-week delay. Builder proposes recovery via additional crane hire and weekend overtime at $1.1M (within existing $1.8M contingency). Without approval, liquidated damages of $2.4M become likely in 18 weeks.',
        urgency: 'critical',
        options: [
          { label: 'Approve recovery ($1.1M)', description: 'Net benefit vs. LD risk: +$1.3M. Funded from contingency. Build resumes at pace.' },
          { label: 'Approve overtime only', description: 'Approx. $400K. Recovers ~1.5 weeks. Partial LD risk remains. Lower cost.' },
          { label: 'Negotiate with builder', description: 'Seek builder contribution to recovery cost (their crane failure). 5–7 day delay.' },
        ],
      },
      {
        id: 'd2', agentId: 'comms', agentName: 'Comms', agentIcon: '📣',
        title: 'Approve revised completion timeline communication?',
        context: 'Draft buyer update prepared advising Q2 2030 completion (6-month delay). Legal confirmed no statutory sunset issues. 320 buyers to receive. Comms agent recommends proactive distribution before buyer speculation escalates.',
        urgency: 'high',
        options: [
          { label: 'Approve & send now', description: 'Proactive communication. Builds buyer trust. Comms team ready to deploy.' },
          { label: 'Send after recovery approval', description: 'Wait until recovery program is confirmed before updating buyers. 1–2 day delay.' },
          { label: 'Staged release', description: 'Notify investor buyers first (8), then all owner-occupiers (312) 24 hrs later.' },
        ],
      },
    ],
  },

  // ── proj-004: Aurora Central, Adelaide SA (Design & pre-sales) ──
  'proj-004': {
    agents: [
      {
        id: 'scout', name: 'Scout', role: 'Site Discovery', icon: '🔍', status: 'idle',
        currentTask: 'Site confirmed — 90 Grote Street, Adelaide CBD',
        lastAction: 'Due diligence complete. 2,800sqm CBD corner site. DA-approved mixed-use zoning.',
        msgCount: 29, doneCount: 8,
      },
      {
        id: 'analyst', name: 'Analyst', role: 'Market Research', icon: '📊', status: 'active',
        currentTask: 'Modelling Adelaide CBD apartment demand by product type and investor profile',
        lastAction: 'Adelaide CBD rental vacancy: 2.1% — lowest since 2018. Strong investment demand.',
        progress: 68, msgCount: 95, doneCount: 26,
      },
      {
        id: 'legal', name: 'Legal', role: 'Contracts & Compliance', icon: '⚖️', status: 'thinking',
        currentTask: 'Reviewing development agreement with City of Adelaide — heritage interface terms',
        lastAction: 'Contracts of sale (210 lots) drafted and reviewed. Vendor disclosure prepared.',
        progress: 55, msgCount: 67, doneCount: 18,
      },
      {
        id: 'finance', name: 'Finance', role: 'Feasibility & Funding', icon: '💰', status: 'active',
        currentTask: 'Negotiating construction finance terms with CBA and Bankwest',
        lastAction: 'Feasibility updated: projected IRR 19.2% at current sale prices and costs.',
        progress: 60, msgCount: 118, doneCount: 32,
      },
      {
        id: 'permit', name: 'Permit', role: 'Planning & Council', icon: '🏛️', status: 'active',
        currentTask: 'Preparing supplementary submission for SCAP hearing — 28 Mar 2026',
        lastAction: 'Planning application lodged Nov 2025. Public consultation period closed.',
        progress: 25, msgCount: 74, doneCount: 19,
      },
      {
        id: 'design', name: 'Design', role: 'Architecture Coordination', icon: '📐', status: 'active',
        currentTask: 'Revising podium heritage interface for SCAP panel submission',
        lastAction: 'Heritage streetscape report from Hansen Yuncken submitted to SCAP folder.',
        progress: 70, msgCount: 89, doneCount: 24,
      },
      {
        id: 'build', name: 'Build', role: 'Construction Management', icon: '🏗️', status: 'idle',
        currentTask: 'Awaiting planning approval and construction finance before tender',
        lastAction: 'Preliminary site logistics and tower crane positioning study complete.',
        msgCount: 22, doneCount: 6,
      },
      {
        id: 'sales', name: 'Sales', role: 'Pre-sales & Marketing', icon: '🏠', status: 'active',
        currentTask: 'Running off-the-plan campaign — targeting 60% presales for finance drawdown',
        lastAction: '95 of 210 apartments reserved (45%). Investor mix: 60% local, 40% interstate.',
        progress: 45, msgCount: 167, doneCount: 44,
      },
      {
        id: 'risk', name: 'Risk', role: 'Risk Monitoring', icon: '⚠️', status: 'waiting',
        currentTask: 'Monitoring SCAP planning outcome — key date 28 Mar 2026',
        lastAction: 'Risk register: planning approval elevated to HIGH. Contingency plans prepared.',
        msgCount: 112, doneCount: 30,
      },
      {
        id: 'comms', name: 'Comms', role: 'Stakeholder Relations', icon: '📣', status: 'thinking',
        currentTask: 'Preparing investor briefing for Q1 2026 finance and presales update',
        lastAction: 'Pre-sales milestone update sent to 6 investors. All acknowledged positively.',
        progress: 35, msgCount: 89, doneCount: 23,
      },
    ],
    messages: [
      { id: 'm1', from: 'Permit', fromIcon: '🏛️', to: 'You', toIcon: '👤', timestamp: '10 min ago', content: 'SCAP hearing confirmed 28 Mar 2026. Panel has requested additional heritage streetscape documentation. Design agent is finalising the revised podium treatment for submission.', type: 'info' },
      { id: 'm2', from: 'Finance', fromIcon: '💰', to: 'You', toIcon: '👤', timestamp: '35 min ago', content: 'CBA offering $62M at BBSW+2.8% (50% presales condition). Bankwest at BBSW+3.1% (45% presales, 70% LVR). CBA is cheaper; Bankwest has better LVR. Decision needed within 7 days.', type: 'decision' },
      { id: 'm3', from: 'Sales', fromIcon: '🏠', to: 'You', toIcon: '👤', timestamp: '1 hr ago', content: '3 new reservations this week — all interstate investors from Sydney. Total: 95/210 (45.2%). On track to hit 50% presales required for CBA finance drawdown within 3 weeks.', type: 'info' },
      { id: 'm4', from: 'Design', fromIcon: '📐', to: 'Permit', toIcon: '🏛️', timestamp: '2 hrs ago', content: 'Heritage streetscape report received from Hansen Yuncken. Podium facade revised with sandstone cladding reference. Submitted to SCAP supplementary submission folder for 28 Mar hearing.', type: 'complete' },
      { id: 'm5', from: 'Analyst', fromIcon: '📊', to: 'Sales', toIcon: '🏠', timestamp: '3 hrs ago', content: 'Adelaide investor demand increasing: interstate buyers drove 62% of CBD apartment purchases in Q1 2026. Current pricing at $8,200/sqm is competitive vs Sydney. Recommend highlighting yield story in campaign.', type: 'info' },
    ],
    decisions: [
      {
        id: 'd1', agentId: 'finance', agentName: 'Finance', agentIcon: '💰',
        title: 'Select construction finance — CBA vs Bankwest',
        context: 'CBA: $62M at BBSW+2.8%, 65% LVR, 50% presales condition. Bankwest: $62M at BBSW+3.1%, 70% LVR, 45% presales condition. CBA saves ~$186K annually in interest. Bankwest reduces required equity by $4.2M due to higher LVR.',
        urgency: 'high',
        options: [
          { label: 'Proceed with CBA', description: 'Lower rate, lower LVR. Need 50% presales (95/210 — very close to threshold).' },
          { label: 'Proceed with Bankwest', description: 'Higher LVR saves $4.2M equity contribution. Slightly higher interest cost.' },
          { label: 'Counter-negotiate both', description: 'Use competing term sheets to negotiate. ~5-day delay but potential for better terms.' },
        ],
      },
    ],
  },

  // ── proj-005: Banksia Heights Estate, Baldivis WA (Early feasibility) ──
  'proj-005': {
    agents: [
      {
        id: 'scout', name: 'Scout', role: 'Site Discovery', icon: '🔍', status: 'idle',
        currentTask: 'Site confirmed — Lot 500 Baldivis Road, Baldivis WA',
        lastAction: 'Site acquired. 100-lot subdivision potential confirmed across 84ha.',
        msgCount: 18, doneCount: 5,
      },
      {
        id: 'analyst', name: 'Analyst', role: 'Market Research', icon: '📊', status: 'active',
        currentTask: 'Analysing Baldivis and Rockingham corridor residential land demand',
        lastAction: 'WA residential land market: median lot price up 18% YoY. Baldivis demand strong.',
        progress: 75, msgCount: 34, doneCount: 9,
      },
      {
        id: 'legal', name: 'Legal', role: 'Contracts & Compliance', icon: '⚖️', status: 'thinking',
        currentTask: 'Reviewing Crown land interface and WAPC subdivision conditions',
        lastAction: 'Title review complete. No encumbrances. WAPC pre-application prepared.',
        progress: 30, msgCount: 22, doneCount: 6,
      },
      {
        id: 'finance', name: 'Finance', role: 'Feasibility & Funding', icon: '💰', status: 'active',
        currentTask: 'Building staged 100-lot subdivision feasibility model',
        lastAction: 'Stage 1 (25 lots): IRR 22.4% at $295K/lot. Infrastructure bond est. $1.8M.',
        progress: 65, msgCount: 45, doneCount: 12,
      },
      {
        id: 'permit', name: 'Permit', role: 'Planning & Council', icon: '🏛️', status: 'idle',
        currentTask: 'Preparing WAPC subdivision application — council pre-consultation 15 Mar',
        lastAction: 'Pre-consultation meeting with Rockingham City Council confirmed for 15 Mar 2026.',
        msgCount: 16, doneCount: 4,
      },
      {
        id: 'design', name: 'Design', role: 'Architecture Coordination', icon: '📐', status: 'idle',
        currentTask: 'Preparing subdivision concept plan for WAPC pre-application',
        lastAction: 'Initial layout: 100 lots avg 550sqm. Two public open space reserves included.',
        msgCount: 12, doneCount: 3,
      },
      {
        id: 'build', name: 'Build', role: 'Construction Management', icon: '🏗️', status: 'idle',
        currentTask: 'Monitoring WA civil contractors for Stage 1 subdivision earthworks',
        lastAction: 'Preliminary earthworks estimate: $4.2M for Stage 1 civil works.',
        msgCount: 8, doneCount: 2,
      },
      {
        id: 'sales', name: 'Sales', role: 'Pre-sales & Marketing', icon: '🏠', status: 'thinking',
        currentTask: 'Building Baldivis land buyer database and expressions of interest list',
        lastAction: 'EOI database: 34 registered buyers. 12 pre-qualified for first-home-buyer grants.',
        progress: 15, msgCount: 28, doneCount: 7,
      },
      {
        id: 'risk', name: 'Risk', role: 'Risk Monitoring', icon: '⚠️', status: 'idle',
        currentTask: 'Monitoring WAPC approval timeline risk — typical 6–12 month window',
        lastAction: 'Risk register: planning timeline is key risk. Crown land interface flagged.',
        msgCount: 19, doneCount: 5,
      },
      {
        id: 'comms', name: 'Comms', role: 'Stakeholder Relations', icon: '📣', status: 'idle',
        currentTask: 'Awaiting feasibility finalisation before investor communications',
        lastAction: 'Initial project brief distributed to 2 founding investors — positive reception.',
        msgCount: 11, doneCount: 3,
      },
    ],
    messages: [
      { id: 'm1', from: 'Finance', fromIcon: '💰', to: 'You', toIcon: '👤', timestamp: '20 min ago', content: 'Stage 1 feasibility (25 lots) complete: IRR 22.4% at $295K/lot. Full 100-lot project: IRR 19.8%. Infrastructure bond from Rockingham City est. $1.8M. Recommend staged release strategy.', type: 'info' },
      { id: 'm2', from: 'Analyst', fromIcon: '📊', to: 'Finance', toIcon: '💰', timestamp: '1 hr ago', content: 'WA land market update: Baldivis median lot price $315K in Feb 2026 (+18% YoY). Stage 1 pricing at $295K is conservative — market supports $310–320K. Consider revising feasibility upward.', type: 'info' },
      { id: 'm3', from: 'Legal', fromIcon: '⚖️', to: 'You', toIcon: '👤', timestamp: '2 hrs ago', content: 'WAPC pre-application prepared. Issue flagged: 2.4ha northern boundary interfaces with Crown reserve. May require lot layout modification. Legal review in progress — advise within 3 days.', type: 'request' },
      { id: 'm4', from: 'Permit', fromIcon: '🏛️', to: 'You', toIcon: '👤', timestamp: '3 hrs ago', content: 'Pre-consultation with Rockingham City confirmed 15 Mar 2026. Agenda: POS requirements, road hierarchy, drainage strategy. Design agent preparing concept plan for the meeting.', type: 'info' },
    ],
    decisions: [
      {
        id: 'd1', agentId: 'finance', agentName: 'Finance', agentIcon: '💰',
        title: 'Staged vs. full 100-lot subdivision release',
        context: 'Finance agent recommends staged release: Stage 1 (25 lots, 2026), then 3 further stages. Full release achieves slightly lower IRR but simpler management. Current WA market conditions and infrastructure bond requirements favour staging.',
        urgency: 'medium',
        options: [
          { label: 'Staged release (4 × 25 lots)', description: 'Lower upfront capital. IRR 22.4% on Stage 1. Phased infrastructure costs.' },
          { label: 'Full 100-lot release', description: 'IRR 19.8%. Higher upfront capital. Faster community formation.' },
          { label: 'Defer — await WAPC outcome', description: 'Reduce planning risk before committing to release strategy.' },
        ],
      },
    ],
  },
};

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
  const visibleProjects = projects.filter((p) => canAccessProject(user, p.id));
  const [activeProjectId, setActiveProjectId] = useState(
    visibleProjects[0]?.id ?? projects[0].id
  );
  const [dismissedDecisions, setDismissedDecisions] = useState<Record<string, Set<string>>>({});

  const activeProject = visibleProjects.find((p) => p.id === activeProjectId);
  const data = ALL_PROJECT_DATA[activeProjectId] ?? ALL_PROJECT_DATA['proj-001'];

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
