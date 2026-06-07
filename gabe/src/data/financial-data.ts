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

export const financialData: Record<string, ProjectFinancials> = {
  'proj-001': {
    summary: {
      totalSpend: 6_214_800,
      forecast: 9_820_000,
    },
    pendingInvoices: [
      { id: 'inv-001-p1', provider: 'Buildcorp Pty Ltd', description: 'Construction progress claim #8 — structural frame level 2', amount: 342_500 },
      { id: 'inv-001-p2', provider: 'Peninsula Plumbing Co.', description: 'Rough-in plumbing — Units 7–12', amount: 58_400 },
      { id: 'inv-001-p3', provider: 'Electra Group', description: 'Electrical installation — stage 2 fit-out', amount: 74_200 },
      { id: 'inv-001-p4', provider: 'Archi Studio Melbourne', description: 'Contract administration fee — Q3 2025', amount: 18_700 },
    ],
    paidInvoices: [
      { id: 'inv-001-d1', provider: 'VicSurvey Pty Ltd', description: 'Title re-establishment survey', amount: 4_800, datePaid: '2024-04-10' },
      { id: 'inv-001-d2', provider: 'Geotechnical Solutions', description: 'Soil investigation & report', amount: 12_300, datePaid: '2024-05-22' },
      { id: 'inv-001-d3', provider: 'Archi Studio Melbourne', description: 'Schematic design & DA drawings', amount: 68_000, datePaid: '2024-07-15' },
      { id: 'inv-001-d4', provider: 'Town Planning Partners', description: 'Planning permit application & submission', amount: 22_500, datePaid: '2024-09-03' },
      { id: 'inv-001-d5', provider: 'Buildcorp Pty Ltd', description: 'Construction progress claims #1–7', amount: 4_980_000, datePaid: '2025-01-31' },
      { id: 'inv-001-d6', provider: 'Yarra Valley Landscaping', description: 'Landscaping design documentation', amount: 9_200, datePaid: '2025-02-14' },
    ],
  },

  'proj-002': {
    summary: {
      totalSpend: 1_842_000,
      forecast: 5_380_000,
    },
    pendingInvoices: [
      { id: 'inv-002-p1', provider: 'Clarke & Partners Architecture', description: 'Development application drawings — final set', amount: 31_500 },
      { id: 'inv-002-p2', provider: 'NSW Planning Consultants', description: 'Statement of environmental effects preparation', amount: 14_800 },
    ],
    paidInvoices: [
      { id: 'inv-002-d1', provider: 'SurveyNSW', description: 'Boundary survey & identification report', amount: 5_600, datePaid: '2025-02-05' },
      { id: 'inv-002-d2', provider: 'EcoAssess Pty Ltd', description: 'Ecological assessment report', amount: 8_900, datePaid: '2025-03-18' },
      { id: 'inv-002-d3', provider: 'Clarke & Partners Architecture', description: 'Concept design & feasibility study', amount: 24_000, datePaid: '2025-04-22' },
      { id: 'inv-002-d4', provider: 'Hills Bank', description: 'Construction finance establishment fee', amount: 38_500, datePaid: '2025-05-30' },
      { id: 'inv-002-d5', provider: 'McNamara Legal', description: 'Contract of sale — land acquisition legal fees', amount: 12_200, datePaid: '2025-06-14' },
      { id: 'inv-002-d6', provider: 'Kellyville Traffic Engineers', description: 'Traffic impact assessment', amount: 7_400, datePaid: '2025-07-09' },
    ],
  },

  'proj-003': {
    summary: {
      totalSpend: 87_600_000,
      forecast: 185_400_000,
    },
    pendingInvoices: [
      { id: 'inv-003-p1', provider: 'Multiplex Constructions', description: 'Progress claim #12 — levels 18–22 concrete pour', amount: 4_820_000 },
      { id: 'inv-003-p2', provider: 'AECOM Australia', description: 'Structural engineering — stage 3 review', amount: 186_000 },
      { id: 'inv-003-p3', provider: 'Façade Systems Qld', description: 'Curtain wall installation — levels 10–18', amount: 2_140_000 },
      { id: 'inv-003-p4', provider: 'Brisbane Fire Protection', description: 'Fire services — levels 15–22 rough-in', amount: 312_000 },
    ],
    paidInvoices: [
      { id: 'inv-003-d1', provider: 'Cox Architecture', description: 'Full architectural services — design phases 1–4', amount: 3_200_000, datePaid: '2025-08-31' },
      { id: 'inv-003-d2', provider: 'Multiplex Constructions', description: 'Progress claims #1–11', amount: 62_400_000, datePaid: '2026-01-15' },
      { id: 'inv-003-d3', provider: 'ANZ Project Finance', description: 'Construction loan establishment & fees', amount: 1_850_000, datePaid: '2025-07-01' },
      { id: 'inv-003-d4', provider: 'BCC Development Services', description: 'DA application fees & infrastructure charges', amount: 4_200_000, datePaid: '2025-06-20' },
      { id: 'inv-003-d5', provider: 'Slattery Asset Management', description: 'Quantity surveyor — PC & progress reports', amount: 420_000, datePaid: '2025-12-01' },
    ],
  },

  'proj-004': {
    summary: {
      totalSpend: 11_980_000,
      forecast: 96_500_000,
    },
    pendingInvoices: [
      { id: 'inv-004-p1', provider: 'Woods Bagot Architects', description: 'Schematic design package — tower & podium', amount: 480_000 },
      { id: 'inv-004-p2', provider: 'SMEC Engineering', description: 'Civil & structural design — stage 1', amount: 124_000 },
      { id: 'inv-004-p3', provider: 'Colliers SA', description: 'Market feasibility & presales advice', amount: 28_500 },
    ],
    paidInvoices: [
      { id: 'inv-004-d1', provider: 'Land Services SA', description: 'Title search & dealings — land acquisition', amount: 6_800, datePaid: '2025-03-12' },
      { id: 'inv-004-d2', provider: 'Adelaide Geotechnics', description: 'Site investigation — CBD brownfield assessment', amount: 18_400, datePaid: '2025-04-05' },
      { id: 'inv-004-d3', provider: 'Finlaysons Lawyers', description: 'Land acquisition legal costs', amount: 42_600, datePaid: '2025-05-19' },
      { id: 'inv-004-d4', provider: 'DPA Planning SA', description: 'Pre-lodgement planning advice & heritage assessment', amount: 32_000, datePaid: '2025-07-22' },
      { id: 'inv-004-d5', provider: 'CBA Corporate Finance', description: 'Construction finance — commitment fee', amount: 240_000, datePaid: '2025-09-30' },
    ],
  },

  'proj-005': {
    summary: {
      totalSpend: 648_000,
      forecast: 17_200_000,
    },
    pendingInvoices: [
      { id: 'inv-005-p1', provider: 'Landgate WA', description: 'Deposited plan lodgement & registration fees', amount: 24_800 },
      { id: 'inv-005-p2', provider: 'Cardno Pty Ltd', description: 'Concept civil engineering — roads & drainage', amount: 38_500 },
    ],
    paidInvoices: [
      { id: 'inv-005-d1', provider: 'Baldivis Survey Group', description: 'Cadastral survey — lot 500 Baldivis Road', amount: 8_200, datePaid: '2025-09-15' },
      { id: 'inv-005-d2', provider: 'Strategen Environmental', description: 'Environmental review & bushfire assessment', amount: 14_600, datePaid: '2025-10-28' },
      { id: 'inv-005-d3', provider: 'Corser & Corser Lawyers', description: 'Land acquisition conveyancing', amount: 11_800, datePaid: '2025-11-14' },
      { id: 'inv-005-d4', provider: 'Burgess Design Group', description: 'Subdivision concept plan & masterplan', amount: 22_000, datePaid: '2025-12-09' },
    ],
  },
};
