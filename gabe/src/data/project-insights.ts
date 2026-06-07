export type ProjectHealthStatus = 'on_track' | 'at_risk' | 'critical';

export interface ProjectHealth {
  status: ProjectHealthStatus;
  label: string;
  reason: string;
}

export interface ProjectInsight {
  id: string;
  text: string;
  category: 'risk' | 'opportunity' | 'action';
}

export interface ProjectCommandData {
  abn: string;
  health: ProjectHealth;
  insights: ProjectInsight[];
}

export const projectCommandData: Record<string, ProjectCommandData> = {
  'proj-001': {
    abn: '14 632 058 491',
    health: {
      status: 'on_track',
      label: 'On Track',
      reason: 'Construction 65% complete, pre-sales exceeding target',
    },
    insights: [
      { id: 'i-001-1', text: 'Timber delivery delay for Units 11-12 — monitor for programme impact', category: 'risk' },
      { id: 'i-001-2', text: 'Display suite opening can drive remaining 20% pre-sales', category: 'opportunity' },
      { id: 'i-001-3', text: 'Review website mockup v2 — feedback due Thursday', category: 'action' },
    ],
  },
  'proj-002': {
    abn: '27 481 936 275',
    health: {
      status: 'at_risk',
      label: 'At Risk',
      reason: 'Finance blocked on missing builder fixed-price contract',
    },
    insights: [
      { id: 'i-002-1', text: 'Westpac needs signed builder contract before credit approval can proceed', category: 'risk' },
      { id: 'i-002-2', text: 'Council planner supportive — DA expected to be straightforward', category: 'opportunity' },
      { id: 'i-002-3', text: 'Chase Paul Henderson for fixed-price building contract', category: 'action' },
    ],
  },
  'proj-003': {
    abn: '53 719 204 863',
    health: {
      status: 'on_track',
      label: 'On Track',
      reason: 'Structure on programme at Level 22, 70% pre-sales achieved',
    },
    insights: [
      { id: 'i-003-1', text: 'Crane #2 dedicated to facade for 6 weeks — material deliveries on crane #1 only', category: 'risk' },
      { id: 'i-003-2', text: 'Premium apartments 92% sold — consider releasing held stock at higher prices', category: 'opportunity' },
      { id: 'i-003-3', text: 'VIP preview event on 28 Feb — confirm display suite readiness', category: 'action' },
    ],
  },
  'proj-004': {
    abn: '91 358 642 107',
    health: {
      status: 'at_risk',
      label: 'At Risk',
      reason: 'Land settlement and finance interdependent, both pending',
    },
    insights: [
      { id: 'i-004-1', text: 'Finance drawdown needed by 10 Mar — 5 days before settlement', category: 'risk' },
      { id: 'i-004-2', text: '38 EOIs received with strong downsizer interest — convert to contracts', category: 'opportunity' },
      { id: 'i-004-3', text: 'Send updated pre-sales and QS report to NAB for term sheet', category: 'action' },
    ],
  },
  'proj-005': {
    abn: '68 205 473 918',
    health: {
      status: 'critical',
      label: 'Critical',
      reason: 'Feasibility incomplete, key infrastructure costs unknown',
    },
    insights: [
      { id: 'i-005-1', text: 'Western Power connection costs not yet received — major cost unknown', category: 'risk' },
      { id: 'i-005-2', text: 'Geotech confirms Class A site — lower foundation costs than budgeted', category: 'opportunity' },
      { id: 'i-005-3', text: 'Follow up Western Power on electricity connection estimate', category: 'action' },
    ],
  },
};
