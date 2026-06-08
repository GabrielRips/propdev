export type ReportStatus = 'not_received' | 'draft' | 'final' | 'superseded';

export interface ReportVersion {
  version: string;
  date: string;
  note?: string;
}

export interface ConsultantReport {
  id: string;
  reportName: string;
  discipline: 'Arborist' | 'Environmental' | 'Soil' | 'Noise' | 'Heritage';
  submittedBy?: string;
  submitterPhone?: string;
  submitterEmail?: string;
  dateReceived?: string;
  status: ReportStatus;
  linkedAuthority?: string;
  approvalStatus?: string;
  dueDate?: string;
  requiredForMilestone?: string;
  versions?: ReportVersion[];
}

export const consultantsData: Record<string, ConsultantReport[]> = {};
