export type CouncilStatus = 'not_lodged' | 'lodged' | 'rfi' | 'approved';
export type UtilityStatus = 'not_applied' | 'applied' | 'approved' | 'energised' | 'connected';

export interface AuthDocument {
  label: string;      // document type (always shown)
  fileName?: string;  // actual file name (only when uploaded)
  date?: string;      // date issued / uploaded (only when uploaded)
}

export interface CouncilData {
  approvalStatus: CouncilStatus;
  lodgementDate?: string;
  approvalDate?: string;
  expiryDate?: string;
  totalFees: number;
  reclaimable: number;
  claimedBack: number;
  received: number;
  documents: AuthDocument[];
}

export interface ElectricityData {
  retailer: string;
  portalUrl: string;
  connectionStatus: UtilityStatus;
  applicationNumber?: string;
  estimatedEnergisationDate?: string;
  feesPaid: number;
  meterInstalled: boolean;
  documents: AuthDocument[];
}

export interface WaterData {
  authority: string;
  connectionStatus: UtilityStatus;
  tapInDate?: string;
  feesPaid: number;
  headworksCharges: number;
  documents: AuthDocument[];
}

export interface GasData {
  provider: string;
  connectionStatus: UtilityStatus;
  meterInstallationDate?: string;
  feesPaid: number;
  documents: AuthDocument[];
}

export interface AuthoritiesData {
  council: CouncilData;
  electricity: ElectricityData;
  water: WaterData;
  gas: GasData;
}

export const authoritiesData: Record<string, AuthoritiesData> = {
  'proj-001': {
    council: {
      approvalStatus: 'approved',
      lodgementDate: '2024-09-15',
      approvalDate: '2025-02-20',
      expiryDate: '2027-02-20',
      totalFees: 28450,
      reclaimable: 8200,
      claimedBack: 8200,
      received: 6500,
      documents: [
        { label: 'Planning Application', fileName: 'Planning Application — 42 Lithgow St Abbotsford.pdf', date: '2024-09-15' },
        { label: 'Endorsed Plans', fileName: 'Endorsed Plans — Permit TP-2025-0142.pdf', date: '2025-02-20' },
        { label: 'Planning Permit', fileName: 'Planning Permit TP-2025-0142.pdf', date: '2025-02-20' },
        { label: 'Claim Submissions', fileName: 'Infrastructure Contribution Claim — Mar 2025.pdf', date: '2025-03-10' },
      ],
    },
    electricity: {
      retailer: 'Jemena',
      portalUrl: 'https://www.jemena.com.au',
      connectionStatus: 'applied',
      applicationNumber: 'JEM-2025-44821',
      estimatedEnergisationDate: '2026-08-15',
      feesPaid: 12400,
      meterInstalled: false,
      documents: [
        { label: 'Connection Application', fileName: 'Jemena New Connection Application JEM-2025-44821.pdf', date: '2025-04-15' },
        { label: 'Approval Notice' },
        { label: 'Compliance Certificate' },
      ],
    },
    water: {
      authority: 'Yarra Valley Water',
      connectionStatus: 'approved',
      tapInDate: '2026-06-01',
      feesPaid: 9800,
      headworksCharges: 42000,
      documents: [
        { label: 'Connection Approval', fileName: 'YVW Connection Approval — 42 Lithgow St.pdf', date: '2025-08-20' },
        { label: 'Compliance Certificate' },
      ],
    },
    gas: {
      provider: 'Multinet Gas',
      connectionStatus: 'applied',
      feesPaid: 3200,
      documents: [
        { label: 'Connection Application', fileName: 'Multinet Gas New Connection Application.pdf', date: '2025-05-02' },
        { label: 'Approval Notice' },
        { label: 'Compliance Certificate' },
      ],
    },
  },

  'proj-002': {
    council: {
      approvalStatus: 'lodged',
      lodgementDate: '2026-01-15',
      totalFees: 18200,
      reclaimable: 5500,
      claimedBack: 0,
      received: 0,
      documents: [
        { label: 'Planning Application', fileName: 'DA2026-0124 — 18 Memorial Ave Kellyville.pdf', date: '2026-01-15' },
        { label: 'Endorsed Plans' },
        { label: 'Planning Permit' },
        { label: 'Claim Submissions' },
      ],
    },
    electricity: {
      retailer: 'Ausgrid',
      portalUrl: 'https://www.ausgrid.com.au',
      connectionStatus: 'not_applied',
      feesPaid: 0,
      meterInstalled: false,
      documents: [
        { label: 'Connection Application' },
        { label: 'Approval Notice' },
        { label: 'Compliance Certificate' },
      ],
    },
    water: {
      authority: 'Sydney Water',
      connectionStatus: 'not_applied',
      feesPaid: 0,
      headworksCharges: 0,
      documents: [
        { label: 'Connection Approval' },
        { label: 'Compliance Certificate' },
      ],
    },
    gas: {
      provider: 'Jemena Gas Networks',
      connectionStatus: 'not_applied',
      feesPaid: 0,
      documents: [
        { label: 'Connection Application' },
        { label: 'Approval Notice' },
        { label: 'Compliance Certificate' },
      ],
    },
  },

  'proj-003': {
    council: {
      approvalStatus: 'approved',
      lodgementDate: '2025-01-10',
      approvalDate: '2025-04-28',
      expiryDate: '2028-04-28',
      totalFees: 4200000,
      reclaimable: 0,
      claimedBack: 0,
      received: 0,
      documents: [
        { label: 'Planning Application', fileName: 'Development Application — 155 Grey St South Brisbane.pdf', date: '2025-01-10' },
        { label: 'Endorsed Plans', fileName: 'Endorsed Plans — DA2025-0891.pdf', date: '2025-04-28' },
        { label: 'Development Approval', fileName: 'Development Approval DA2025-0891.pdf', date: '2025-04-28' },
        { label: 'Claim Submissions' },
      ],
    },
    electricity: {
      retailer: 'Energex',
      portalUrl: 'https://www.energex.com.au',
      connectionStatus: 'approved',
      applicationNumber: 'ENX-2025-88301',
      estimatedEnergisationDate: '2028-10-01',
      feesPaid: 186000,
      meterInstalled: false,
      documents: [
        { label: 'Connection Application', fileName: 'Energex Connection Application ENX-2025-88301.pdf', date: '2025-07-15' },
        { label: 'Approval Notice', fileName: 'Energex Approval Notice ENX-2025-88301.pdf', date: '2025-09-30' },
        { label: 'Compliance Certificate' },
      ],
    },
    water: {
      authority: 'Urban Utilities',
      connectionStatus: 'applied',
      feesPaid: 28000,
      headworksCharges: 1240000,
      documents: [
        { label: 'Connection Approval' },
        { label: 'Compliance Certificate' },
      ],
    },
    gas: {
      provider: 'APA Group',
      connectionStatus: 'applied',
      feesPaid: 12000,
      documents: [
        { label: 'Connection Application', fileName: 'APA Group Connection Application — Horizon Tower.pdf', date: '2025-10-12' },
        { label: 'Approval Notice' },
        { label: 'Compliance Certificate' },
      ],
    },
  },

  'proj-004': {
    council: {
      approvalStatus: 'rfi',
      lodgementDate: '2025-11-20',
      totalFees: 312000,
      reclaimable: 0,
      claimedBack: 0,
      received: 0,
      documents: [
        { label: 'Planning Application', fileName: 'Development Application — 90 Grote St Adelaide.pdf', date: '2025-11-20' },
        { label: 'Endorsed Plans' },
        { label: 'Development Approval' },
        { label: 'Claim Submissions' },
      ],
    },
    electricity: {
      retailer: 'SA Power Networks',
      portalUrl: 'https://www.sapowernetworks.com.au',
      connectionStatus: 'not_applied',
      feesPaid: 0,
      meterInstalled: false,
      documents: [
        { label: 'Connection Application' },
        { label: 'Approval Notice' },
        { label: 'Compliance Certificate' },
      ],
    },
    water: {
      authority: 'SA Water',
      connectionStatus: 'not_applied',
      feesPaid: 0,
      headworksCharges: 0,
      documents: [
        { label: 'Connection Approval' },
        { label: 'Compliance Certificate' },
      ],
    },
    gas: {
      provider: 'Australian Gas Networks',
      connectionStatus: 'not_applied',
      feesPaid: 0,
      documents: [
        { label: 'Connection Application' },
        { label: 'Approval Notice' },
        { label: 'Compliance Certificate' },
      ],
    },
  },

  'proj-005': {
    council: {
      approvalStatus: 'not_lodged',
      totalFees: 0,
      reclaimable: 0,
      claimedBack: 0,
      received: 0,
      documents: [
        { label: 'Planning Application' },
        { label: 'Endorsed Plans' },
        { label: 'Subdivision Approval' },
        { label: 'Claim Submissions' },
      ],
    },
    electricity: {
      retailer: 'Western Power',
      portalUrl: 'https://www.westernpower.com.au',
      connectionStatus: 'not_applied',
      feesPaid: 0,
      meterInstalled: false,
      documents: [
        { label: 'Connection Application' },
        { label: 'Approval Notice' },
        { label: 'Compliance Certificate' },
      ],
    },
    water: {
      authority: 'Water Corporation',
      connectionStatus: 'not_applied',
      feesPaid: 0,
      headworksCharges: 0,
      documents: [
        { label: 'Connection Approval' },
        { label: 'Compliance Certificate' },
      ],
    },
    gas: {
      provider: 'ATCO Gas Australia',
      connectionStatus: 'not_applied',
      feesPaid: 0,
      documents: [
        { label: 'Connection Application' },
        { label: 'Approval Notice' },
        { label: 'Compliance Certificate' },
      ],
    },
  },
};
