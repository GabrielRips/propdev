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

export const variationsData: Record<string, ProjectVariations> = {};

export function getVariations(projectId: string): ProjectVariations {
  return variationsData[projectId] ?? { capturedInvoices: [], variations: [] };
}
