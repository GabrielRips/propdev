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

export const packs: Pack[] = [];

export const capitalRequests: CapitalRequest[] = [];

export function packsForProject(projectId: string): Pack[] {
  return packs.filter((p) => p.projectId === projectId);
}
