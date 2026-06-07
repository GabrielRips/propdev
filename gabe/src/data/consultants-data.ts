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

export const consultantsData: Record<string, ConsultantReport[]> = {
  'proj-001': [
    {
      id: 'cr-001-01',
      reportName: 'Arboricultural Impact Assessment — 42 Lithgow St Abbotsford.pdf',
      discipline: 'Arborist',
      submittedBy: 'Treecology Pty Ltd',
      submitterPhone: '+61 412 882 341',
      submitterEmail: 'reports@treecology.com.au',
      dateReceived: '2024-06-20',
      status: 'final',
      approvalStatus: 'Accepted by Yarra City Council',
    },
    {
      id: 'cr-001-02',
      reportName: 'Environmental Site Assessment — 42 Lithgow St Abbotsford.pdf',
      discipline: 'Environmental',
      submittedBy: 'EcoTech Consulting',
      submitterPhone: '+61 3 9801 4455',
      submitterEmail: 'reports@ecotech.com.au',
      dateReceived: '2024-05-15',
      status: 'final',
      versions: [
        { version: 'v1', date: '2024-04-05', note: 'Initial assessment — revised following additional soil sampling' },
      ],
    },
    {
      id: 'cr-001-03',
      reportName: 'Geotechnical Investigation Report — 42 Lithgow St.pdf',
      discipline: 'Soil',
      submittedBy: 'GeoTech Solutions',
      submitterPhone: '+61 3 9650 7788',
      submitterEmail: 'geotech@geotechsolutions.com.au',
      dateReceived: '2024-05-10',
      status: 'final',
    },
    {
      id: 'cr-001-04',
      reportName: 'Acoustic Assessment Report — 42 Lithgow St Abbotsford.pdf',
      discipline: 'Noise',
      submittedBy: 'Acoustic Logic',
      submitterPhone: '+61 438 291 047',
      submitterEmail: 'admin@acousticlogic.com.au',
      dateReceived: '2024-07-08',
      status: 'final',
      linkedAuthority: 'Council RFI Item 1',
      approvalStatus: 'Accepted',
    },
    {
      id: 'cr-001-05',
      reportName: 'Heritage Impact Statement — 42 Lithgow St Abbotsford.pdf',
      discipline: 'Heritage',
      submittedBy: 'Heritage Collective',
      submitterPhone: '+61 3 9415 8800',
      submitterEmail: 'info@heritagecollective.com.au',
      dateReceived: '2024-08-12',
      status: 'final',
    },
  ],

  'proj-002': [
    {
      id: 'cr-002-01',
      reportName: 'Arboricultural Assessment Report — 18 Memorial Ave Kellyville.pdf',
      discipline: 'Arborist',
      submittedBy: 'Urban Tree Consulting',
      submitterPhone: '+61 421 553 874',
      submitterEmail: 'reports@urbantree.com.au',
      dateReceived: '2026-01-10',
      status: 'draft',
      requiredForMilestone: 'DA Lodgement',
    },
    {
      id: 'cr-002-02',
      reportName: 'Ecological Assessment — 18 Memorial Ave Kellyville.pdf',
      discipline: 'Environmental',
      submittedBy: 'EcoAssess Pty Ltd',
      submitterPhone: '+61 2 9719 3300',
      submitterEmail: 'reports@ecoassess.com.au',
      dateReceived: '2025-12-15',
      status: 'final',
    },
    {
      id: 'cr-002-03',
      reportName: 'Soil & Water Assessment — 18 Memorial Ave Kellyville.pdf',
      discipline: 'Soil',
      submittedBy: 'ENGEO',
      submitterPhone: '+61 2 9221 5544',
      submitterEmail: 'sydney@engeo.com.au',
      dateReceived: '2025-12-20',
      status: 'draft',
    },
    {
      id: 'cr-002-04',
      reportName: 'Acoustic Assessment Report — 18 Memorial Ave Kellyville.pdf',
      discipline: 'Noise',
      status: 'not_received',
      dueDate: '2026-01-15',
      requiredForMilestone: 'DA Lodgement',
    },
    {
      id: 'cr-002-05',
      reportName: 'Statement of Heritage Impact — 18 Memorial Ave Kellyville.pdf',
      discipline: 'Heritage',
      status: 'not_received',
      dueDate: '2026-02-28',
      requiredForMilestone: 'DA Lodgement',
    },
  ],

  'proj-003': [
    {
      id: 'cr-003-01',
      reportName: 'Arboricultural Impact Assessment — 155 Grey St South Brisbane.pdf',
      discipline: 'Arborist',
      submittedBy: 'ArbX Consulting',
      submitterPhone: '+61 7 3229 5511',
      submitterEmail: 'brisbane@arbx.com.au',
      dateReceived: '2025-02-10',
      status: 'final',
    },
    {
      id: 'cr-003-02',
      reportName: 'Environmental Impact Statement — 155 Grey St South Brisbane.pdf',
      discipline: 'Environmental',
      submittedBy: 'GHD Advisory',
      submitterPhone: '+61 7 3316 3500',
      submitterEmail: 'brisbane@ghd.com',
      dateReceived: '2025-01-20',
      status: 'final',
      linkedAuthority: 'Council Condition 4',
      approvalStatus: 'Accepted by BCC',
      versions: [
        { version: 'v1', date: '2024-11-15', note: 'Initial EIS — revised after BCC pre-lodgement feedback' },
      ],
    },
    {
      id: 'cr-003-03',
      reportName: 'Geotechnical Report — Horizon Tower 155 Grey St.pdf',
      discipline: 'Soil',
      submittedBy: 'Douglas Partners',
      submitterPhone: '+61 7 3223 6100',
      submitterEmail: 'brisbane@douglaspartners.com.au',
      dateReceived: '2024-12-15',
      status: 'final',
      approvalStatus: 'Accepted',
    },
    {
      id: 'cr-003-04',
      reportName: 'Construction Noise & Vibration Management Plan — Horizon Tower.pdf',
      discipline: 'Noise',
      submittedBy: 'Acoustic Studio',
      submitterPhone: '+61 403 718 965',
      submitterEmail: 'info@acousticstudio.com.au',
      dateReceived: '2025-03-08',
      status: 'final',
      linkedAuthority: 'Council Condition 12',
    },
    {
      id: 'cr-003-05',
      reportName: 'Heritage & Character Assessment — 155 Grey St South Brisbane.pdf',
      discipline: 'Heritage',
      submittedBy: 'Place Design Group',
      submitterPhone: '+61 7 3009 2200',
      submitterEmail: 'heritage@placedesign.com.au',
      dateReceived: '2025-01-15',
      status: 'final',
    },
  ],

  'proj-004': [
    {
      id: 'cr-004-01',
      reportName: 'Urban Tree Impact Assessment — 90 Grote St Adelaide.pdf',
      discipline: 'Arborist',
      status: 'not_received',
      dueDate: '2026-02-01',
      requiredForMilestone: 'RFI Response',
    },
    {
      id: 'cr-004-02',
      reportName: 'Environmental Assessment Report — 90 Grote St Adelaide.pdf',
      discipline: 'Environmental',
      submittedBy: 'ARUP Australia',
      submitterPhone: '+61 8 8228 1000',
      submitterEmail: 'adelaide@arup.com',
      dateReceived: '2025-11-10',
      status: 'draft',
      linkedAuthority: 'Council RFI Item 2',
    },
    {
      id: 'cr-004-03',
      reportName: 'Geotechnical Investigation — 90 Grote St Adelaide.pdf',
      discipline: 'Soil',
      submittedBy: 'Tonkin Consulting',
      submitterPhone: '+61 8 8111 9999',
      submitterEmail: 'geotechnical@tonkin.com.au',
      dateReceived: '2025-10-20',
      status: 'final',
    },
    {
      id: 'cr-004-04',
      reportName: 'Acoustic Impact Assessment — 90 Grote St Adelaide.pdf',
      discipline: 'Noise',
      submittedBy: 'Marshall Day Acoustics',
      submitterPhone: '+61 8 8193 5800',
      submitterEmail: 'adelaide@marshallday.com.au',
      dateReceived: '2025-12-01',
      status: 'draft',
      linkedAuthority: 'Council RFI Item 3',
      requiredForMilestone: 'RFI Response',
    },
    {
      id: 'cr-004-05',
      reportName: 'Heritage Impact Statement — 90 Grote St Adelaide.pdf',
      discipline: 'Heritage',
      submittedBy: 'GML Heritage',
      submitterPhone: '+61 8 8231 7800',
      submitterEmail: 'adelaide@gmlheritage.com.au',
      dateReceived: '2025-11-25',
      status: 'draft',
      linkedAuthority: 'Council RFI Item 1',
      requiredForMilestone: 'RFI Response',
    },
  ],

  'proj-005': [
    {
      id: 'cr-005-01',
      reportName: 'Arboricultural Survey Report — Lot 500 Baldivis Rd.pdf',
      discipline: 'Arborist',
      status: 'not_received',
      dueDate: '2026-04-01',
      requiredForMilestone: 'DA Lodgement',
    },
    {
      id: 'cr-005-02',
      reportName: 'Preliminary Environmental Assessment — Lot 500 Baldivis Rd.pdf',
      discipline: 'Environmental',
      submittedBy: 'Strategen Environmental',
      submitterPhone: '+61 8 6141 3300',
      submitterEmail: 'perth@strategen.com.au',
      dateReceived: '2025-10-28',
      status: 'draft',
    },
    {
      id: 'cr-005-03',
      reportName: 'Site Investigation & Soil Report — Lot 500 Baldivis Rd.pdf',
      discipline: 'Soil',
      submittedBy: 'Douglas Partners',
      submitterPhone: '+61 8 9429 5533',
      submitterEmail: 'perth@douglaspartners.com.au',
      dateReceived: '2025-11-15',
      status: 'draft',
    },
    {
      id: 'cr-005-04',
      reportName: 'Acoustic Assessment Report — Lot 500 Baldivis Rd.pdf',
      discipline: 'Noise',
      status: 'not_received',
      requiredForMilestone: 'DA Lodgement',
    },
    {
      id: 'cr-005-05',
      reportName: 'Aboriginal Heritage Survey — Lot 500 Baldivis Rd.pdf',
      discipline: 'Heritage',
      status: 'not_received',
      dueDate: '2026-03-15',
      requiredForMilestone: 'DA Lodgement',
    },
  ],
};
