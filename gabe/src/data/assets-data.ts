// Asset Intelligence data — the owned-property / build-to-rent portfolio portal.
// Modelled on the client's `property manage example.xlsx`:
//   property address | property value | loan amount | LVR | property manager
//   | contact number | date owned | owned under (entity)
// Extended with rent, yield and document linkage for lender/JV pack extraction.

export type OwnershipType = 'Personal' | 'Company' | 'Trust' | 'SMSF';

export interface AssetDocument {
  id: string;
  label: string;
  fileName: string;
  date: string;
  category: 'Rental Statement' | 'Loan' | 'Valuation' | 'Insurance' | 'Title' | 'Tax';
}

export interface OwnedAsset {
  id: string;
  address: string;
  suburb: string;
  state: string;
  propertyValue: number;       // auto-updated (mock realestate.com price guide)
  valuationDate: string;
  valuationSource: string;
  loanAmount: number;          // manually maintained
  lender: string;
  weeklyRent: number;
  managedBy: string;           // property manager / agency
  contactNumber: string;
  dateOwned: string;
  ownedUnder: string;          // entity name
  ownershipType: OwnershipType;
  documents: AssetDocument[];
}

export interface PortfolioSummary {
  totalValue: number;
  totalDebt: number;
  totalEquity: number;
  portfolioLvr: number;        // weighted
  weeklyRent: number;
  annualRent: number;
  grossYield: number;          // %
  assetCount: number;
}

// Build-to-rent / retained portfolio for the GABE owner (Lachlan Henderson group),
// seeded from the example spreadsheet and expanded into a realistic portfolio.
export const ownedAssets: OwnedAsset[] = [
  {
    id: 'asset-01', address: '24 Smith St', suburb: 'Collingwood', state: 'VIC',
    propertyValue: 1000000, valuationDate: '2026-05-01', valuationSource: 'realestate.com price guide',
    loanAmount: 500000, lender: 'CBA', weeklyRent: 720, managedBy: 'Elite Property',
    contactNumber: '0428 979 348', dateOwned: '2012-01-15', ownedUnder: 'Lachlan Henderson',
    ownershipType: 'Personal',
    documents: [
      { id: 'ad-01-1', label: 'Rental statement — Apr 2026', fileName: 'rent-24smith-apr26.pdf', date: '2026-05-02', category: 'Rental Statement' },
      { id: 'ad-01-2', label: 'Loan statement — CBA', fileName: 'loan-24smith.pdf', date: '2026-04-30', category: 'Loan' },
      { id: 'ad-01-3', label: 'Title search', fileName: 'title-24smith.pdf', date: '2012-01-15', category: 'Title' },
    ],
  },
  {
    id: 'asset-02', address: '40 Frank St', suburb: 'Glenroy', state: 'VIC',
    propertyValue: 500000, valuationDate: '2026-05-01', valuationSource: 'realestate.com price guide',
    loanAmount: 200000, lender: 'NAB', weeklyRent: 430, managedBy: 'Ray White',
    contactNumber: '0409 874 235', dateOwned: '2020-07-10', ownedUnder: 'LH Cladding',
    ownershipType: 'Company',
    documents: [
      { id: 'ad-02-1', label: 'Rental statement — Apr 2026', fileName: 'rent-40frank-apr26.pdf', date: '2026-05-02', category: 'Rental Statement' },
      { id: 'ad-02-2', label: 'Loan statement — NAB', fileName: 'loan-40frank.pdf', date: '2026-04-30', category: 'Loan' },
      { id: 'ad-02-3', label: 'Building insurance COC', fileName: 'insurance-40frank.pdf', date: '2026-02-01', category: 'Insurance' },
      { id: 'ad-02-4', label: 'Depreciation schedule', fileName: 'depreciation-40frank.pdf', date: '2020-09-01', category: 'Tax' },
    ],
  },
  {
    id: 'asset-03', address: '52 Billie Ct', suburb: 'Brighton', state: 'VIC',
    propertyValue: 3000000, valuationDate: '2026-05-01', valuationSource: 'realestate.com price guide',
    loanAmount: 1200000, lender: 'Westpac', weeklyRent: 1650, managedBy: 'Barry Plant',
    contactNumber: '0409 832 470', dateOwned: '2018-09-05', ownedUnder: 'LH and Co Family Trust',
    ownershipType: 'Trust',
    documents: [
      { id: 'ad-03-1', label: 'Rental statement — Apr 2026', fileName: 'rent-52billie-apr26.pdf', date: '2026-05-02', category: 'Rental Statement' },
      { id: 'ad-03-2', label: 'Loan statement — Westpac', fileName: 'loan-52billie.pdf', date: '2026-04-30', category: 'Loan' },
      { id: 'ad-03-3', label: 'Independent valuation', fileName: 'valuation-52billie.pdf', date: '2025-11-12', category: 'Valuation' },
      { id: 'ad-03-4', label: 'Title search', fileName: 'title-52billie.pdf', date: '2018-09-05', category: 'Title' },
    ],
  },
  {
    id: 'asset-04', address: '8 Lithgow St (Unit 1, ex-Riverside)', suburb: 'Abbotsford', state: 'VIC',
    propertyValue: 1180000, valuationDate: '2026-05-01', valuationSource: 'realestate.com price guide',
    loanAmount: 770000, lender: 'CBA', weeklyRent: 780, managedBy: 'Nelson Alexander',
    contactNumber: '0431 220 905', dateOwned: '2025-04-30', ownedUnder: 'LH and Co Family Trust',
    ownershipType: 'Trust',
    documents: [
      { id: 'ad-04-1', label: 'Rental statement — Apr 2026', fileName: 'rent-8lithgow-apr26.pdf', date: '2026-05-02', category: 'Rental Statement' },
      { id: 'ad-04-2', label: 'Loan statement — CBA', fileName: 'loan-8lithgow.pdf', date: '2026-04-30', category: 'Loan' },
    ],
  },
  {
    id: 'asset-05', address: '15 Baldivis Rd (Display home)', suburb: 'Baldivis', state: 'WA',
    propertyValue: 620000, valuationDate: '2026-05-01', valuationSource: 'realestate.com price guide',
    loanAmount: 0, lender: '—', weeklyRent: 0, managedBy: 'Self-managed',
    contactNumber: '0400 112 884', dateOwned: '2025-12-01', ownedUnder: 'Banksia Heights Pty Ltd',
    ownershipType: 'Company',
    documents: [
      { id: 'ad-05-1', label: 'Title search', fileName: 'title-15baldivis.pdf', date: '2025-12-01', category: 'Title' },
    ],
  },
  {
    id: 'asset-06', address: '210/155 Grey St (ex-Horizon stock)', suburb: 'South Brisbane', state: 'QLD',
    propertyValue: 845000, valuationDate: '2026-05-01', valuationSource: 'realestate.com price guide',
    loanAmount: 560000, lender: 'ANZ', weeklyRent: 690, managedBy: 'CBRE Residential',
    contactNumber: '0455 309 771', dateOwned: '2025-12-01', ownedUnder: 'LH Property SMSF',
    ownershipType: 'SMSF',
    documents: [
      { id: 'ad-06-1', label: 'Rental statement — Apr 2026', fileName: 'rent-210grey-apr26.pdf', date: '2026-05-02', category: 'Rental Statement' },
      { id: 'ad-06-2', label: 'Loan statement — ANZ', fileName: 'loan-210grey.pdf', date: '2026-04-30', category: 'Loan' },
      { id: 'ad-06-3', label: 'SMSF compliance letter', fileName: 'smsf-210grey.pdf', date: '2026-01-15', category: 'Tax' },
    ],
  },
];

export function getPortfolioSummary(assets: OwnedAsset[]): PortfolioSummary {
  const totalValue = assets.reduce((t, a) => t + a.propertyValue, 0);
  const totalDebt = assets.reduce((t, a) => t + a.loanAmount, 0);
  const weeklyRent = assets.reduce((t, a) => t + a.weeklyRent, 0);
  const annualRent = weeklyRent * 52;
  return {
    totalValue,
    totalDebt,
    totalEquity: totalValue - totalDebt,
    portfolioLvr: totalValue ? Math.round((totalDebt / totalValue) * 100) : 0,
    weeklyRent,
    annualRent,
    grossYield: totalValue ? +((annualRent / totalValue) * 100).toFixed(1) : 0,
    assetCount: assets.length,
  };
}

export function assetLvr(a: OwnedAsset): number {
  return a.propertyValue ? Math.round((a.loanAmount / a.propertyValue) * 100) : 0;
}
