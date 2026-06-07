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

export const feasibilityData: Record<string, FeasibilityModel> = {
  'proj-001': {
    gdv: 14400000,
    totalCost: 11050000,
    liveCost: 11240000,
    profit: 3350000,
    marginOnCost: 30.3,
    marginOnGdv: 23.3,
    irr: 24.6,
    equity: 3315000,
    debt: 7735000,
    lvr: 70,
    costLines: [
      { label: 'Land acquisition', feasibility: 3200000, live: 3200000 },
      { label: 'Construction', feasibility: 6400000, live: 6620000 },
      { label: 'Professional fees', feasibility: 540000, live: 558000 },
      { label: 'Statutory & council', feasibility: 285000, live: 285000 },
      { label: 'Finance costs', feasibility: 410000, live: 432000 },
      { label: 'Sales & marketing', feasibility: 215000, live: 145000 },
    ],
    revenueLines: [
      { label: 'Townhouse sales (12)', feasibility: 14400000, live: 8290000 },
    ],
    cashflow: [
      { period: 'Q1 24', outflow: 3400000, inflow: 0, net: -3400000 },
      { period: 'Q3 24', outflow: 1200000, inflow: 0, net: -4600000 },
      { period: 'Q1 25', outflow: 1900000, inflow: 1180000, net: -5320000 },
      { period: 'Q3 25', outflow: 2300000, inflow: 0, net: -7620000 },
      { period: 'Q1 26', outflow: 1600000, inflow: 565000, net: -8655000 },
      { period: 'Q3 26', outflow: 840000, inflow: 5400000, net: -4095000 },
      { period: 'Q1 27', outflow: 0, inflow: 7245000, net: 3150000 },
    ],
    sensitivity: [
      { scenario: 'Base case', margin: 30.3, profit: 3350000, irr: 24.6 },
      { scenario: 'Sales price −5%', margin: 23.8, profit: 2630000, irr: 19.1 },
      { scenario: 'Construction +10%', margin: 23.6, profit: 2710000, irr: 18.4 },
      { scenario: 'Settlement +6 months', margin: 30.3, profit: 3350000, irr: 19.8 },
      { scenario: 'Best case (sales +4%)', margin: 35.5, profit: 3926000, irr: 28.9 },
    ],
  },
  'proj-002': {
    gdv: 8800000,
    totalCost: 7250000,
    liveCost: 7180000,
    profit: 1550000,
    marginOnCost: 21.4,
    marginOnGdv: 17.6,
    irr: 18.2,
    equity: 2175000,
    debt: 5075000,
    lvr: 70,
    costLines: [
      { label: 'Land acquisition', feasibility: 2650000, live: 2650000 },
      { label: 'Construction', feasibility: 3900000, live: 3850000 },
      { label: 'Professional fees', feasibility: 380000, live: 372000 },
      { label: 'Statutory & council', feasibility: 165000, live: 158000 },
      { label: 'Finance costs', feasibility: 155000, live: 150000 },
    ],
    revenueLines: [
      { label: 'Townhouse sales (8)', feasibility: 8800000, live: 0 },
    ],
    cashflow: [
      { period: 'Q1 25', outflow: 2700000, inflow: 0, net: -2700000 },
      { period: 'Q3 25', outflow: 600000, inflow: 0, net: -3300000 },
      { period: 'Q1 26', outflow: 900000, inflow: 0, net: -4200000 },
      { period: 'Q3 26', outflow: 2100000, inflow: 1800000, net: -4500000 },
      { period: 'Q1 27', outflow: 1200000, inflow: 4500000, net: -1200000 },
      { period: 'Q3 27', outflow: 0, inflow: 2500000, net: 1300000 },
    ],
    sensitivity: [
      { scenario: 'Base case', margin: 21.4, profit: 1550000, irr: 18.2 },
      { scenario: 'Sales price −5%', margin: 15.3, profit: 1110000, irr: 12.9 },
      { scenario: 'Construction +10%', margin: 14.6, profit: 1160000, irr: 12.1 },
      { scenario: 'Best case (sales +4%)', margin: 26.2, profit: 1902000, irr: 22.4 },
    ],
  },
  'proj-003': {
    gdv: 256000000,
    totalCost: 198400000,
    liveCost: 201900000,
    profit: 57600000,
    marginOnCost: 29.0,
    marginOnGdv: 22.5,
    irr: 19.8,
    equity: 49600000,
    debt: 148800000,
    lvr: 75,
    costLines: [
      { label: 'Land acquisition', feasibility: 38000000, live: 38000000 },
      { label: 'Construction', feasibility: 132000000, live: 134800000 },
      { label: 'Professional fees', feasibility: 9800000, live: 10100000 },
      { label: 'Statutory & council', feasibility: 6200000, live: 6200000 },
      { label: 'Finance costs', feasibility: 8900000, live: 9400000 },
      { label: 'Sales & marketing', feasibility: 3500000, live: 3400000 },
    ],
    revenueLines: [
      { label: 'Apartment sales (320)', feasibility: 248000000, live: 178000000 },
      { label: 'Retail / commercial', feasibility: 8000000, live: 0 },
    ],
    cashflow: [
      { period: 'Q3 25', outflow: 42000000, inflow: 0, net: -42000000 },
      { period: 'Q1 26', outflow: 38000000, inflow: 565000, net: -79435000 },
      { period: 'Q3 26', outflow: 44000000, inflow: 0, net: -123435000 },
      { period: 'Q1 27', outflow: 40000000, inflow: 0, net: -163435000 },
      { period: 'Q3 28', outflow: 36000000, inflow: 0, net: -199435000 },
      { period: 'Q1 30', outflow: 0, inflow: 256000000, net: 56565000 },
    ],
    sensitivity: [
      { scenario: 'Base case', margin: 29.0, profit: 57600000, irr: 19.8 },
      { scenario: 'Sales price −5%', margin: 22.6, profit: 44800000, irr: 15.7 },
      { scenario: 'Construction +10%', margin: 22.6, profit: 44120000, irr: 15.2 },
      { scenario: 'Interest +1.5%', margin: 27.9, profit: 55400000, irr: 17.1 },
      { scenario: 'Best case (sales +3%)', margin: 33.4, profit: 66240000, irr: 22.6 },
    ],
  },
  'proj-004': {
    gdv: 147000000,
    totalCost: 119500000,
    liveCost: 119500000,
    profit: 27500000,
    marginOnCost: 23.0,
    marginOnGdv: 18.7,
    irr: 16.4,
    equity: 35850000,
    debt: 83650000,
    lvr: 70,
    costLines: [
      { label: 'Land acquisition', feasibility: 28000000, live: 28000000 },
      { label: 'Construction', feasibility: 78000000, live: 78000000 },
      { label: 'Professional fees', feasibility: 6800000, live: 6800000 },
      { label: 'Statutory & council', feasibility: 3200000, live: 3200000 },
      { label: 'Finance costs', feasibility: 3500000, live: 3500000 },
    ],
    revenueLines: [
      { label: 'Apartment sales (210)', feasibility: 147000000, live: 0 },
    ],
    cashflow: [
      { period: 'Q1 25', outflow: 28000000, inflow: 0, net: -28000000 },
      { period: 'Q3 25', outflow: 12000000, inflow: 0, net: -40000000 },
      { period: 'Q1 26', outflow: 18000000, inflow: 0, net: -58000000 },
      { period: 'Q1 27', outflow: 34000000, inflow: 0, net: -92000000 },
      { period: 'Q3 28', outflow: 27500000, inflow: 147000000, net: 27500000 },
    ],
    sensitivity: [
      { scenario: 'Base case', margin: 23.0, profit: 27500000, irr: 16.4 },
      { scenario: 'Sales price −5%', margin: 16.8, profit: 20150000, irr: 12.2 },
      { scenario: 'Construction +10%', margin: 16.5, profit: 19700000, irr: 11.8 },
      { scenario: 'Best case (sales +4%)', margin: 28.2, profit: 33380000, irr: 19.9 },
    ],
  },
  'proj-005': {
    gdv: 45000000,
    totalCost: 36800000,
    liveCost: 37400000,
    profit: 8200000,
    marginOnCost: 22.3,
    marginOnGdv: 18.2,
    irr: 17.1,
    equity: 14720000,
    debt: 22080000,
    lvr: 60,
    costLines: [
      { label: 'Land acquisition', feasibility: 12000000, live: 12000000 },
      { label: 'Civil & infrastructure', feasibility: 18500000, live: 19100000 },
      { label: 'Professional fees', feasibility: 2400000, live: 2400000 },
      { label: 'Headworks (Water/Power)', feasibility: 2200000, live: 2200000 },
      { label: 'Finance costs', feasibility: 1700000, live: 1700000 },
    ],
    revenueLines: [
      { label: 'Lot sales (100)', feasibility: 45000000, live: 0 },
    ],
    cashflow: [
      { period: 'Q3 25', outflow: 12000000, inflow: 0, net: -12000000 },
      { period: 'Q1 26', outflow: 3500000, inflow: 0, net: -15500000 },
      { period: 'Q3 26', outflow: 9000000, inflow: 0, net: -24500000 },
      { period: 'Q1 27', outflow: 10500000, inflow: 18000000, net: -17000000 },
      { period: 'Q1 28', outflow: 1800000, inflow: 27000000, net: 8200000 },
    ],
    sensitivity: [
      { scenario: 'Base case', margin: 22.3, profit: 8200000, irr: 17.1 },
      { scenario: 'Lot price −5%', margin: 16.2, profit: 5950000, irr: 12.4 },
      { scenario: 'Civil cost +10% (Western Power risk)', margin: 17.2, profit: 6290000, irr: 12.9 },
      { scenario: 'Best case (lot price +5%)', margin: 28.4, profit: 10450000, irr: 21.6 },
    ],
  },
};
