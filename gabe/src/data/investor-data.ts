// Investor Intelligence data — lender packs, investor packs and JV reports.
// One-click report generation with controlled visibility (scoped sharing).

export type PackType = 'Lender Pack' | 'Investor Pack' | 'JV Report';
export type PackStatus = 'draft' | 'ready' | 'shared';

export interface PackSection {
  label: string;
  included: boolean;     // toggle which sections a recipient can see (scoped visibility)
  source: string;        // which GABE module the data is pulled from
}

export interface Pack {
  id: string;
  type: PackType;
  title: string;
  projectId: string;
  recipient: string;
  recipientOrg: string;
  status: PackStatus;
  lastGenerated?: string;
  sharedDate?: string;
  sections: PackSection[];
}

export interface CapitalRequest {
  id: string;
  projectId: string;
  purpose: string;       // e.g. 'Senior debt — construction facility'
  amount: number;
  party: string;
  status: 'identified' | 'in_discussion' | 'term_sheet' | 'committed';
  note?: string;
}

const standardSections = (over: Partial<Record<string, boolean>> = {}): PackSection[] => [
  { label: 'Project summary & status', included: over['summary'] ?? true, source: 'Dashboard' },
  { label: 'Feasibility & margin', included: over['feaso'] ?? true, source: 'Feasibility Engine' },
  { label: 'Pre-sales register', included: over['sales'] ?? true, source: 'Sales' },
  { label: 'Live budget vs feasibility', included: over['budget'] ?? true, source: 'Financial Control Centre' },
  { label: 'Construction progress & photos', included: over['construction'] ?? true, source: 'Construction Hub' },
  { label: 'Planning & permits', included: over['permit'] ?? false, source: 'Permits' },
  { label: 'Cashflow forecast', included: over['cashflow'] ?? true, source: 'Feasibility Engine' },
];

export const packs: Pack[] = [
  {
    id: 'pack-001', type: 'Lender Pack', title: 'Westpac — Construction Drawdown Pack',
    projectId: 'proj-001', recipient: 'Sophie Marsh', recipientOrg: 'Westpac Property Finance',
    status: 'shared', lastGenerated: '2026-02-01', sharedDate: '2026-02-02',
    sections: standardSections({ permit: true }),
  },
  {
    id: 'pack-002', type: 'Investor Pack', title: 'Riverside — Quarterly Investor Update Q1',
    projectId: 'proj-001', recipient: 'Equity Partners', recipientOrg: 'Henderson Capital',
    status: 'ready', lastGenerated: '2026-02-04',
    sections: standardSections({ budget: false }),
  },
  {
    id: 'pack-003', type: 'Lender Pack', title: 'NAB — Aurora Central Term Sheet Pack',
    projectId: 'proj-004', recipient: 'James Liddell', recipientOrg: 'NAB Real Estate',
    status: 'draft', lastGenerated: '2026-02-05',
    sections: standardSections({ construction: false, sales: true }),
  },
  {
    id: 'pack-004', type: 'JV Report', title: 'Horizon Tower — JV Partner Report (50/50)',
    projectId: 'proj-003', recipient: 'M. Castellano', recipientOrg: 'Castellano Group',
    status: 'shared', lastGenerated: '2026-01-28', sharedDate: '2026-01-29',
    sections: standardSections({ budget: false, cashflow: true }),
  },
  {
    id: 'pack-005', type: 'Investor Pack', title: 'Banksia Heights — Capital Raise Teaser',
    projectId: 'proj-005', recipient: 'Private syndicate', recipientOrg: 'Various (5 parties)',
    status: 'draft', lastGenerated: '2026-02-06',
    sections: standardSections({ construction: false, budget: false, permit: false }),
  },
];

export const capitalRequests: CapitalRequest[] = [
  { id: 'cap-1', projectId: 'proj-004', purpose: 'Senior debt — construction facility', amount: 83650000, party: 'NAB Real Estate', status: 'term_sheet', note: 'Awaiting updated pre-sales & QS report.' },
  { id: 'cap-2', projectId: 'proj-005', purpose: 'Equity raise — civil & headworks', amount: 8000000, party: 'Private syndicate', status: 'in_discussion', note: 'Western Power connection cost is the key unknown.' },
  { id: 'cap-3', projectId: 'proj-001', purpose: 'Construction facility (drawn)', amount: 7735000, party: 'Westpac', status: 'committed' },
  { id: 'cap-4', projectId: 'proj-003', purpose: 'Senior + mezzanine stack', amount: 148800000, party: 'CBA / Qualitas', status: 'committed' },
];

export function packsForProject(projectId: string): Pack[] {
  return packs.filter((p) => p.projectId === projectId);
}
