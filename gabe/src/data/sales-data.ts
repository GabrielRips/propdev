// Sales module data — lot/unit sales register, buyers, contracts, deposits, settlement.

export type LotStatus = 'available' | 'reserved' | 'under_contract' | 'settled';

export interface SalesLot {
  id: string;
  lotNumber: string; // e.g. 'Unit 4', 'Lot 12'
  beds: number;
  baths: number;
  cars: number;
  internalArea: number; // sqm
  listPrice: number;
  status: LotStatus;
  buyer?: string;
  agent?: string;
  reservedDate?: string;
  contractDate?: string;
  depositPaid?: number;        // 10% off-the-plan typical
  settlementDue?: string;
  salePrice?: number;          // contracted price (may differ from list)
  notes?: string;
}

export interface SalesSummary {
  totalLots: number;
  available: number;
  reserved: number;
  underContract: number;
  settled: number;
  grossSalesValue: number;     // sum of sale/list prices
  contractedValue: number;     // sum of under_contract + settled
  depositsHeld: number;        // total deposits in trust
  presalePct: number;          // % of lots sold (under_contract + settled)
}

export interface ProjectSales {
  agency: string;
  agentLead: string;
  lots: SalesLot[];
}

export const salesData: Record<string, ProjectSales> = {
  'proj-001': {
    agency: 'Nelson Alexander',
    agentLead: 'Priya Nair',
    lots: [
      { id: 'lot-001-01', lotNumber: 'Unit 1', beds: 3, baths: 2, cars: 2, internalArea: 142, listPrice: 1180000, status: 'settled', buyer: 'David & Anna Wong', agent: 'Priya Nair', contractDate: '2025-03-18', depositPaid: 118000, settlementDue: '2025-04-30', salePrice: 1180000 },
      { id: 'lot-001-02', lotNumber: 'Unit 2', beds: 3, baths: 2, cars: 2, internalArea: 138, listPrice: 1150000, status: 'under_contract', buyer: 'Michelle Lee', agent: 'Priya Nair', contractDate: '2025-04-02', depositPaid: 115000, settlementDue: '2026-10-15', salePrice: 1150000 },
      { id: 'lot-001-03', lotNumber: 'Unit 3', beds: 4, baths: 3, cars: 2, internalArea: 168, listPrice: 1390000, status: 'under_contract', buyer: 'R. Patel', agent: 'Priya Nair', contractDate: '2025-05-11', depositPaid: 139000, settlementDue: '2026-10-15', salePrice: 1375000, notes: 'Negotiated $15k below list.' },
      { id: 'lot-001-04', lotNumber: 'Unit 4', beds: 3, baths: 2, cars: 1, internalArea: 128, listPrice: 1050000, status: 'reserved', buyer: 'Enquiry — D. Wong (referral)', agent: 'Priya Nair', reservedDate: '2026-02-01' },
      { id: 'lot-001-05', lotNumber: 'Unit 5', beds: 4, baths: 3, cars: 2, internalArea: 172, listPrice: 1420000, status: 'under_contract', buyer: 'The Nguyen Family', agent: 'Priya Nair', contractDate: '2025-06-20', depositPaid: 142000, settlementDue: '2026-11-30', salePrice: 1420000 },
      { id: 'lot-001-06', lotNumber: 'Unit 6', beds: 3, baths: 2, cars: 2, internalArea: 140, listPrice: 1175000, status: 'under_contract', buyer: 'K. Schmidt', agent: 'Priya Nair', contractDate: '2025-07-05', depositPaid: 117500, settlementDue: '2026-11-30', salePrice: 1175000 },
      { id: 'lot-001-07', lotNumber: 'Unit 7', beds: 4, baths: 3, cars: 2, internalArea: 170, listPrice: 1410000, status: 'available', agent: 'Priya Nair' },
      { id: 'lot-001-08', lotNumber: 'Unit 8', beds: 3, baths: 2, cars: 2, internalArea: 138, listPrice: 1160000, status: 'available', agent: 'Priya Nair' },
      { id: 'lot-001-09', lotNumber: 'Unit 9', beds: 3, baths: 2, cars: 1, internalArea: 126, listPrice: 1040000, status: 'reserved', buyer: 'J. Romano', agent: 'Priya Nair', reservedDate: '2026-01-28' },
      { id: 'lot-001-10', lotNumber: 'Unit 10', beds: 4, baths: 3, cars: 2, internalArea: 175, listPrice: 1450000, status: 'available', agent: 'Priya Nair' },
      { id: 'lot-001-11', lotNumber: 'Unit 11', beds: 3, baths: 2, cars: 2, internalArea: 142, listPrice: 1185000, status: 'available', agent: 'Priya Nair' },
      { id: 'lot-001-12', lotNumber: 'Unit 12', beds: 4, baths: 3, cars: 2, internalArea: 178, listPrice: 1470000, status: 'available', agent: 'Priya Nair' },
    ],
  },
  'proj-003': {
    agency: 'CBRE Residential',
    agentLead: 'Marcus Webb',
    lots: [
      { id: 'lot-003-01', lotNumber: 'Apt 1201 (Penthouse)', beds: 4, baths: 3, cars: 3, internalArea: 310, listPrice: 4850000, status: 'under_contract', buyer: 'Private (offshore)', agent: 'Marcus Webb', contractDate: '2025-09-14', depositPaid: 485000, settlementDue: '2030-01-31', salePrice: 4850000 },
      { id: 'lot-003-02', lotNumber: 'Apt 1105', beds: 3, baths: 2, cars: 2, internalArea: 142, listPrice: 1620000, status: 'under_contract', buyer: 'SMSF — Tan', agent: 'Marcus Webb', contractDate: '2025-08-01', depositPaid: 162000, settlementDue: '2030-01-31', salePrice: 1620000 },
      { id: 'lot-003-03', lotNumber: 'Apt 0803', beds: 2, baths: 2, cars: 1, internalArea: 88, listPrice: 845000, status: 'under_contract', buyer: 'A. Kowalski', agent: 'Marcus Webb', contractDate: '2025-07-22', depositPaid: 84500, settlementDue: '2030-01-31', salePrice: 845000 },
      { id: 'lot-003-04', lotNumber: 'Apt 0510', beds: 1, baths: 1, cars: 1, internalArea: 56, listPrice: 565000, status: 'settled', buyer: 'First Home — L. Park', agent: 'Marcus Webb', contractDate: '2025-06-30', depositPaid: 56500, settlementDue: '2025-12-01', salePrice: 565000 },
      { id: 'lot-003-05', lotNumber: 'Apt 1508', beds: 3, baths: 2, cars: 2, internalArea: 150, listPrice: 1780000, status: 'reserved', buyer: 'EOI — Henderson', agent: 'Marcus Webb', reservedDate: '2026-02-03' },
      { id: 'lot-003-06', lotNumber: 'Apt 0602', beds: 2, baths: 1, cars: 1, internalArea: 74, listPrice: 720000, status: 'available', agent: 'Marcus Webb' },
    ],
  },
};

export function getSalesSummary(sales: ProjectSales | undefined): SalesSummary {
  const lots = sales?.lots ?? [];
  const sum = (pred: (l: SalesLot) => boolean) => lots.filter(pred).length;
  const underContract = sum((l) => l.status === 'under_contract');
  const settled = sum((l) => l.status === 'settled');
  const grossSalesValue = lots.reduce((t, l) => t + (l.salePrice ?? l.listPrice), 0);
  const contractedValue = lots
    .filter((l) => l.status === 'under_contract' || l.status === 'settled')
    .reduce((t, l) => t + (l.salePrice ?? l.listPrice), 0);
  const depositsHeld = lots.reduce((t, l) => t + (l.depositPaid ?? 0), 0);
  return {
    totalLots: lots.length,
    available: sum((l) => l.status === 'available'),
    reserved: sum((l) => l.status === 'reserved'),
    underContract,
    settled,
    grossSalesValue,
    contractedValue,
    depositsHeld,
    presalePct: lots.length ? Math.round(((underContract + settled) / lots.length) * 100) : 0,
  };
}
