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

export const authoritiesData: Record<string, AuthoritiesData> = {};
