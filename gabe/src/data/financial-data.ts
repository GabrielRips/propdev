export interface Invoice {
  id: string;
  provider: string;
  description: string;
  amount: number;
}

export interface PendingInvoice extends Invoice {}

export interface PaidInvoice extends Invoice {
  datePaid: string;
}

export interface FinancialSummary {
  totalSpend: number;
  forecast: number;
}

export interface ProjectFinancials {
  summary: FinancialSummary;
  pendingInvoices: PendingInvoice[];
  paidInvoices: PaidInvoice[];
}

export const financialData: Record<string, ProjectFinancials> = {};
