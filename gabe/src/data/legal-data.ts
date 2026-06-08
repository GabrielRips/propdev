export type LegalSection = 'Acquisition' | 'Planning' | 'Construction' | 'Sales';

export interface LegalDocVersion {
  version: string;
  date: string;
  note?: string;
}

export interface LegalDocument {
  id: string;
  name: string;
  section: LegalSection;
  dateReceived?: string;
  submittedBy?: string;
  submitterPhone?: string;
  submitterEmail?: string;
  versions?: LegalDocVersion[];
}

export const legalData: Record<string, LegalDocument[]> = {};
