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

export const salesData: Record<string, ProjectSales> = {};

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
