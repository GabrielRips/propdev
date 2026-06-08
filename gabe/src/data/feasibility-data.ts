// Feasibility Engine data — financial modelling per project.
// Outputs GRV/GDV, margin, IRR, cashflow and sensitivity, and compares the
// original feasibility assumptions against live (actual) project performance.

export interface FeasibilityLineItem {
  label: string;
  feasibility: number; // original budget assumption
  live: number;        // current actual / committed
}

export interface CashflowPoint {
  period: string;      // e.g. 'Q1 25'
  outflow: number;     // costs spent
  inflow: number;      // sales settlements / drawdowns
  net: number;         // cumulative position
}

export interface SensitivityRow {
  scenario: string;    // e.g. 'Base case', 'Sales -5%', 'Cost +10%'
  margin: number;      // % development margin
  profit: number;      // $ profit
  irr: number;         // %
}

export interface FeasibilityModel {
  gdv: number;                 // Gross Development Value (GRV)
  totalCost: number;           // total development cost (feasibility)
  liveCost: number;            // committed/actual to date trending to completion
  profit: number;              // GDV - cost
  marginOnCost: number;        // %
  marginOnGdv: number;         // %
  irr: number;                 // %
  equity: number;
  debt: number;
  lvr: number;                 // loan-to-value (cost) ratio
  costLines: FeasibilityLineItem[];
  revenueLines: FeasibilityLineItem[];
  cashflow: CashflowPoint[];
  sensitivity: SensitivityRow[];
}

export const feasibilityData: Record<string, FeasibilityModel> = {};
