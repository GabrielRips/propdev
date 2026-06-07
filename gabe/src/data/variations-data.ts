// Financial Control Centre extensions:
//  - email-captured invoices awaiting one-click approval into the budget
//  - variations / "extras" register (a major source of construction blowout)
//  - payment due-date ledger for the Planner

export type CapturedInvoiceStatus = 'captured' | 'approved' | 'paid';
export interface CapturedInvoice {
  id: string;
  provider: string;
  description: string;
  amount: number;
  capturedFrom: string;   // e.g. 'Email — accounts@buildcorp.com.au'
  receivedDate: string;
  dueDate: string;
  budgetLine: string;     // auto-matched feasibility cost line
  status: CapturedInvoiceStatus;
  isExtra?: boolean;      // flagged as a variation/extra, not in original budget
}

export type VariationStatus = 'pending' | 'approved' | 'rejected';
export interface Variation {
  id: string;
  ref: string;            // e.g. 'VO-014'
  description: string;
  contractor: string;
  amount: number;
  raisedDate: string;
  status: VariationStatus;
  reason: string;
}

export interface ProjectVariations {
  capturedInvoices: CapturedInvoice[];
  variations: Variation[];
}

export const variationsData: Record<string, ProjectVariations> = {
  'proj-001': {
    capturedInvoices: [
      { id: 'ci-001-1', provider: 'Buildcorp', description: 'Progress Claim #8 — fit-out commencement', amount: 412000, capturedFrom: 'Email — accounts@buildcorp.com.au', receivedDate: '2026-02-03', dueDate: '2026-02-17', budgetLine: 'Construction', status: 'captured' },
      { id: 'ci-001-2', provider: 'Spark Electrical', description: 'Variation — additional GPOs (6 units)', amount: 7440, capturedFrom: 'Email — admin@sparkelec.com.au', receivedDate: '2026-02-04', dueDate: '2026-02-18', budgetLine: 'Construction', status: 'captured', isExtra: true },
      { id: 'ci-001-3', provider: 'Stone Masters', description: 'Benchtop upgrade deposit (Units 7–12)', amount: 9300, capturedFrom: 'Email — sales@stonemasters.com.au', receivedDate: '2026-02-05', dueDate: '2026-02-19', budgetLine: 'Construction', status: 'captured', isExtra: true },
      { id: 'ci-001-4', provider: 'Cooper Surveying', description: 'As-built survey — Units 1–6', amount: 4180, capturedFrom: 'Email — billing@coopersurvey.com.au', receivedDate: '2026-01-28', dueDate: '2026-02-11', budgetLine: 'Professional fees', status: 'approved' },
    ],
    variations: [
      { id: 'vo-001-1', ref: 'VO-011', description: 'Upgrade to 40mm stone benchtops, Units 7–12', contractor: 'Stone Masters', amount: 18600, raisedDate: '2026-02-03', status: 'pending', reason: 'Buyer-requested upgrade — recoverable via sale price.' },
      { id: 'vo-001-2', ref: 'VO-010', description: 'Additional GPO + data in butler\'s pantry', contractor: 'Spark Electrical', amount: 7440, raisedDate: '2026-01-19', status: 'approved', reason: 'Design coordination miss in original drawings.' },
      { id: 'vo-001-3', ref: 'VO-009', description: 'Rock excavation — Unit 1 garage', contractor: 'Buildcorp', amount: 22800, raisedDate: '2025-11-30', status: 'approved', reason: 'Latent condition — unforeseen rock.' },
      { id: 'vo-001-4', ref: 'VO-012', description: 'Upgrade landscaping to front 3 units', contractor: 'Green Scape', amount: 14500, raisedDate: '2026-02-01', status: 'rejected', reason: 'Outside budget — deferred to defects/handover.' },
    ],
  },
  'proj-003': {
    capturedInvoices: [
      { id: 'ci-003-1', provider: 'Multiplex', description: 'Progress Claim #14', amount: 4820000, capturedFrom: 'Email — claims@multiplex.com.au', receivedDate: '2026-02-02', dueDate: '2026-02-16', budgetLine: 'Construction', status: 'captured' },
      { id: 'ci-003-2', provider: 'Facade Group', description: 'Variation — penthouse marble lobby', amount: 84200, capturedFrom: 'Email — accounts@facadegroup.com.au', receivedDate: '2026-02-04', dueDate: '2026-02-25', budgetLine: 'Construction', status: 'captured', isExtra: true },
    ],
    variations: [
      { id: 'vo-003-1', ref: 'VO-031', description: 'Penthouse marble lobby upgrade', contractor: 'Stone Imports QLD', amount: 84200, raisedDate: '2026-01-30', status: 'pending', reason: 'Penthouse purchaser premium spec — recoverable.' },
      { id: 'vo-003-2', ref: 'VO-028', description: 'Crane #2 extended hire — facade program', contractor: 'Multiplex', amount: 156000, raisedDate: '2026-01-15', status: 'approved', reason: 'Facade install on critical path.' },
    ],
  },
};

export function getVariations(projectId: string): ProjectVariations {
  return variationsData[projectId] ?? { capturedInvoices: [], variations: [] };
}
