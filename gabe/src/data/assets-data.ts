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
export const ownedAssets: OwnedAsset[] = [];

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
