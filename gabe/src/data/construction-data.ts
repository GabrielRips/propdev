// Construction Hub data — Procore-style construction management.
// Models the VIC supervisor compliance checklist (12 stages), inspections,
// OH&S documents, defects with photo sign-off, RFIs, and progress photos.

export interface ChecklistItem {
  id: string; // e.g. 's1-i1'
  label: string;
}

export interface ChecklistStage {
  id: string; // e.g. 's1'
  number: number;
  name: string;
  items: ChecklistItem[];
}

// The standard VIC Site Supervisor Compliance & Pre-Check Checklist — 12 stages.
export const STANDARD_STAGES: ChecklistStage[] = [
  {
    id: 's1', number: 1, name: 'Pre-Construction / Site Establishment',
    items: [
      'Approved planning permit', 'Approved building permit', 'Stamped drawings on site',
      'Engineering drawings on site', 'Soil report available', 'Dial Before You Dig completed',
      'Site safety signage installed', 'SWMS available', 'Site amenities installed',
      'Temporary fencing secure', 'Erosion controls installed', 'Emergency access maintained',
    ].map((label, i) => ({ id: `s1-i${i + 1}`, label })),
  },
  {
    id: 's2', number: 2, name: 'Set-Out',
    items: [
      'Survey set-out certificate', 'Boundaries confirmed', 'Setbacks compliant',
      'Finished floor levels verified', 'Easements identified', 'Machinery access maintained',
      'Neighbour protection installed',
    ].map((label, i) => ({ id: `s2-i${i + 1}`, label })),
  },
  {
    id: 's3', number: 3, name: 'Bored Piers / Footings',
    items: [
      'Engineering approval', 'Permit conditions met', 'Correct diameter', 'Correct depth achieved',
      'Reinforcement installed', 'Base cleaned', 'Inspection completed',
    ].map((label, i) => ({ id: `s3-i${i + 1}`, label })),
  },
  {
    id: 's4', number: 4, name: 'Sewer & Drainage',
    items: [
      'Council approval', 'Plumbing permit', 'Licensed plumber', 'Invert levels confirmed',
      'Inspection completed', 'Backfill compacted',
    ].map((label, i) => ({ id: `s4-i${i + 1}`, label })),
  },
  {
    id: 's5', number: 5, name: 'Slab / Substructure',
    items: [
      'Formwork installed', 'Vapour barrier installed', 'Termite barrier installed',
      'Reinforcement tied', 'Setdowns correct', 'Slab square and level', 'Pre-pour inspection passed',
    ].map((label, i) => ({ id: `s5-i${i + 1}`, label })),
  },
  {
    id: 's6', number: 6, name: 'Framing',
    items: [
      'Layout matches plans', 'Correct timber grade', 'Bracing installed', 'Tie-down complete',
      'Openings correct', 'Frame plumb and straight', 'Inspection passed',
    ].map((label, i) => ({ id: `s6-i${i + 1}`, label })),
  },
  {
    id: 's7', number: 7, name: 'Roofing',
    items: [
      'Trusses installed correctly', 'Bracing installed', 'Fall protection', 'Sarking installed',
      'Roof covering stored correctly', 'Insulation installed',
    ].map((label, i) => ({ id: `s7-i${i + 1}`, label })),
  },
  {
    id: 's8', number: 8, name: 'Cladding / External Envelope',
    items: [
      'Wall wrap installed', 'Window flashings installed', 'Battens installed', 'Fixings compliant',
      'Weather seals applied',
    ].map((label, i) => ({ id: `s8-i${i + 1}`, label })),
  },
  {
    id: 's9', number: 9, name: 'Internal Works & Fit-Out',
    items: [
      'Rough-in approved', 'Insulation compliant', 'Plaster installed', 'Doors fitted',
      'Cabinetry installed', 'Hardware installed',
    ].map((label, i) => ({ id: `s9-i${i + 1}`, label })),
  },
  {
    id: 's10', number: 10, name: 'Waterproofing, Tiling & Kitchen',
    items: [
      'Waterproofing certificate', 'Falls achieved', 'Tile layout approved', 'Kitchen layout confirmed',
      'Benchtops installed',
    ].map((label, i) => ({ id: `s10-i${i + 1}`, label })),
  },
  {
    id: 's11', number: 11, name: 'Painting',
    items: [
      'Surfaces prepared', 'Masking completed', 'Correct paint system', 'Ventilation adequate',
    ].map((label, i) => ({ id: `s11-i${i + 1}`, label })),
  },
  {
    id: 's12', number: 12, name: 'Final Works & Completion',
    items: [
      'Stormwater approved', 'Gas compliance certificate', 'Driveway completed', 'Landscaping completed',
      'All fixtures operational', 'Smoke alarms tested', 'Defects rectified', 'Occupancy permit ready',
    ].map((label, i) => ({ id: `s12-i${i + 1}`, label })),
  },
];

export type InspectionStatus = 'passed' | 'failed' | 'pending';
export interface Inspection {
  id: string;
  type: string; // e.g. 'Pre-pour slab', 'Frame', 'Pest', 'Surveyor set-out'
  inspector: string;
  organisation: string;
  date: string;
  status: InspectionStatus;
  certificate?: string; // filename if a cert was issued
  notes?: string;
}

export type OHSType = 'SWMS' | 'MSDS' | 'WorkCover' | 'Induction' | 'White Card' | 'Insurance';
export interface OHSDocument {
  id: string;
  type: OHSType;
  name: string;
  party: string; // contractor / worker the doc belongs to
  date: string;
  expiry?: string;
}

export type DefectStatus = 'open' | 'sent' | 'signed_off';
export interface Defect {
  id: string;
  location: string;
  description: string;
  contractor: string;
  contractorEmail?: string;
  raisedDate: string;
  status: DefectStatus;
  signedOffDate?: string;
  hasPhoto: boolean; // placeholder for before/after photo proof
}

export type RFIStatus = 'awaiting' | 'responded';
export interface RFI {
  id: string;
  subject: string;
  contractor: string;
  contractorPhone: string;
  sentDate: string;
  status: RFIStatus;
  responseDate?: string;
  quotedAmount?: number;
  note?: string;
}

export interface ProgressPhoto {
  id: string;
  stage: string; // which construction stage
  caption: string;
  uploadedBy: string;
  date: string;
  tone: string; // tailwind gradient classes used as a placeholder swatch
}

export interface ConstructionData {
  completedItems: string[]; // checklist item ids that are ticked
  inspections: Inspection[];
  ohs: OHSDocument[];
  defects: Defect[];
  rfis: RFI[];
  photos: ProgressPhoto[];
}

const PHOTO_TONES = [
  'from-amber-200 to-amber-400', 'from-sky-200 to-sky-400', 'from-emerald-200 to-emerald-400',
  'from-stone-200 to-stone-400', 'from-orange-200 to-orange-400', 'from-slate-200 to-slate-400',
];

export const constructionData: Record<string, ConstructionData> = {
  // Riverside Townhouses — construction 65%, lock-up stage. Stages 1–7 done, 8 in progress.
  'proj-001': {
    completedItems: [
      ...STANDARD_STAGES.slice(0, 7).flatMap((s) => s.items.map((i) => i.id)),
      's8-i1', 's8-i2', 's8-i3',
    ],
    inspections: [
      { id: 'ins-001-1', type: 'Surveyor set-out', inspector: 'Daniel Cooper', organisation: 'Cooper Surveying', date: '2025-04-02', status: 'passed', certificate: 'set-out-certificate.pdf', notes: 'Boundaries and FFL confirmed against endorsed plans.' },
      { id: 'ins-001-2', type: 'Pre-pour slab', inspector: 'Mark Reilly', organisation: 'VBA Building Surveyor', date: '2025-05-18', status: 'passed', certificate: 'slab-inspection.pdf' },
      { id: 'ins-001-3', type: 'Frame', inspector: 'Mark Reilly', organisation: 'VBA Building Surveyor', date: '2025-08-09', status: 'passed', certificate: 'frame-inspection.pdf' },
      { id: 'ins-001-4', type: 'Pest / termite barrier', inspector: 'Sue Tran', organisation: 'Jim\'s Termite & Pest', date: '2025-05-15', status: 'passed' },
      { id: 'ins-001-5', type: 'Waterproofing', inspector: 'Mark Reilly', organisation: 'VBA Building Surveyor', date: '2026-01-22', status: 'pending', notes: 'Booked for wet areas Units 1–6.' },
    ],
    ohs: [
      { id: 'ohs-001-1', type: 'SWMS', name: 'SWMS — Concrete Pour & Pumping', party: 'Buildcorp', date: '2025-05-10' },
      { id: 'ohs-001-2', type: 'SWMS', name: 'SWMS — Roof Carpentry / Working at Heights', party: 'Apex Carpentry', date: '2025-07-28' },
      { id: 'ohs-001-3', type: 'WorkCover', name: 'WorkCover Certificate of Currency', party: 'Buildcorp', date: '2025-01-15', expiry: '2026-01-15' },
      { id: 'ohs-001-4', type: 'Insurance', name: 'Public Liability $20m', party: 'Buildcorp', date: '2025-01-15', expiry: '2026-01-15' },
      { id: 'ohs-001-5', type: 'White Card', name: 'Construction Induction Card — T. Wallace', party: 'Tom Wallace (Site Supervisor)', date: '2021-03-01' },
      { id: 'ohs-001-6', type: 'Induction', name: 'Site Induction Register (42 workers)', party: 'Riverside Site', date: '2025-04-01' },
      { id: 'ohs-001-7', type: 'MSDS', name: 'MSDS — Sika Waterproofing Membrane', party: 'Waterproofing Co', date: '2026-01-10' },
    ],
    defects: [
      { id: 'def-001-1', location: 'Unit 3 — Ensuite', description: 'Waterproofing membrane not turned up at hob, re-do required before tiling.', contractor: 'Waterproofing Co', contractorEmail: 'jobs@waterproofingco.com.au', raisedDate: '2026-01-20', status: 'sent', hasPhoto: true },
      { id: 'def-001-2', location: 'Unit 1 — Garage', description: 'Slab edge honeycombing, patch and seal.', contractor: 'Buildcorp', contractorEmail: 'site@buildcorp.com.au', raisedDate: '2025-12-05', status: 'signed_off', signedOffDate: '2025-12-18', hasPhoto: true },
      { id: 'def-001-3', location: 'Unit 5 — Living', description: 'Window reveal not square, packer required.', contractor: 'Apex Carpentry', contractorEmail: 'admin@apexcarpentry.com.au', raisedDate: '2026-02-01', status: 'open', hasPhoto: false },
    ],
    rfis: [
      { id: 'rfi-001-1', subject: 'Quote — upgrade to 40mm stone benchtops (Units 7–12)', contractor: 'Stone Masters', contractorPhone: '+61 3 9412 8841', sentDate: '2026-01-28', status: 'responded', responseDate: '2026-02-03', quotedAmount: 18600, note: 'Caesarstone Calacatta, supply & install.' },
      { id: 'rfi-001-2', subject: 'Confirm timber delivery date — Units 11-12 framing', contractor: 'Timber Yard Co', contractorPhone: '+61 3 9388 2210', sentDate: '2026-02-04', status: 'awaiting' },
      { id: 'rfi-001-3', subject: 'Variation cost — additional GPO in butler\'s pantry', contractor: 'Spark Electrical', contractorPhone: '+61 412 776 305', sentDate: '2026-01-15', status: 'responded', responseDate: '2026-01-19', quotedAmount: 1240 },
    ],
    photos: [
      { id: 'ph-001-1', stage: 'Slab / Substructure', caption: 'Units 1–6 slab poured', uploadedBy: 'Tom Wallace', date: '2025-05-19', tone: PHOTO_TONES[0] },
      { id: 'ph-001-2', stage: 'Framing', caption: 'Ground floor framing complete', uploadedBy: 'Tom Wallace', date: '2025-08-08', tone: PHOTO_TONES[3] },
      { id: 'ph-001-3', stage: 'Roofing', caption: 'Trusses craned in, Units 1–6', uploadedBy: 'Apex Carpentry', date: '2025-09-30', tone: PHOTO_TONES[1] },
      { id: 'ph-001-4', stage: 'Cladding / External Envelope', caption: 'Wall wrap & window install', uploadedBy: 'Tom Wallace', date: '2025-11-22', tone: PHOTO_TONES[4] },
      { id: 'ph-001-5', stage: 'Cladding / External Envelope', caption: 'Brickwork to street elevation', uploadedBy: 'Tom Wallace', date: '2026-01-12', tone: PHOTO_TONES[5] },
      { id: 'ph-001-6', stage: 'Internal Works & Fit-Out', caption: 'Plaster commenced Units 1–3', uploadedBy: 'Tom Wallace', date: '2026-02-02', tone: PHOTO_TONES[2] },
    ],
  },
  // Horizon Tower — construction 50%, structure to L22.
  'proj-003': {
    completedItems: [
      ...STANDARD_STAGES.slice(0, 5).flatMap((s) => s.items.map((i) => i.id)),
      's6-i1', 's6-i2', 's6-i3',
    ],
    inspections: [
      { id: 'ins-003-1', type: 'Piling', inspector: 'Geoff Lim', organisation: 'Certis Building Certifiers', date: '2025-08-12', status: 'passed', certificate: 'piling-inspection.pdf' },
      { id: 'ins-003-2', type: 'Core wall pour L1–L10', inspector: 'Geoff Lim', organisation: 'Certis Building Certifiers', date: '2025-11-03', status: 'passed' },
      { id: 'ins-003-3', type: 'Post-tension slab L18', inspector: 'Geoff Lim', organisation: 'Certis Building Certifiers', date: '2026-01-29', status: 'passed' },
      { id: 'ins-003-4', type: 'Facade pull-test L1–L8', inspector: 'Helena Marsh', organisation: 'Facade Assurance', date: '2026-02-10', status: 'pending' },
    ],
    ohs: [
      { id: 'ohs-003-1', type: 'SWMS', name: 'SWMS — Tower Crane Operations', party: 'Multiplex', date: '2025-07-01' },
      { id: 'ohs-003-2', type: 'SWMS', name: 'SWMS — Post-Tensioning', party: 'Structural Systems', date: '2025-10-15' },
      { id: 'ohs-003-3', type: 'WorkCover', name: 'WorkCover Certificate of Currency', party: 'Multiplex', date: '2025-06-01', expiry: '2026-06-01' },
      { id: 'ohs-003-4', type: 'Induction', name: 'Site Induction Register (310 workers)', party: 'Horizon Tower Site', date: '2025-06-15' },
      { id: 'ohs-003-5', type: 'Insurance', name: 'Contract Works Insurance $185m', party: 'Multiplex', date: '2025-06-01', expiry: '2030-06-01' },
    ],
    defects: [
      { id: 'def-003-1', location: 'L12 — Apt 1204 balcony', description: 'Balustrade fixing torque below spec.', contractor: 'Facade Group', contractorEmail: 'site@facadegroup.com.au', raisedDate: '2026-01-30', status: 'sent', hasPhoto: true },
      { id: 'def-003-2', location: 'L7 — Lift lobby', description: 'Set-down level incorrect for tiling.', contractor: 'Multiplex', contractorEmail: 'qa@multiplex.com.au', raisedDate: '2026-01-18', status: 'open', hasPhoto: true },
    ],
    rfis: [
      { id: 'rfi-003-1', subject: 'Crane #2 reschedule confirmation — facade vs material lifts', contractor: 'Multiplex', contractorPhone: '+61 7 3023 4400', sentDate: '2026-02-01', status: 'awaiting' },
      { id: 'rfi-003-2', subject: 'Quote — penthouse marble lobby upgrade', contractor: 'Stone Imports QLD', contractorPhone: '+61 7 3399 1180', sentDate: '2026-01-22', status: 'responded', responseDate: '2026-01-30', quotedAmount: 84200 },
    ],
    photos: [
      { id: 'ph-003-1', stage: 'Bored Piers / Footings', caption: 'Piling rig — basement', uploadedBy: 'Site Manager', date: '2025-08-10', tone: PHOTO_TONES[3] },
      { id: 'ph-003-2', stage: 'Slab / Substructure', caption: 'Core wall climbing form L10', uploadedBy: 'Site Manager', date: '2025-11-02', tone: PHOTO_TONES[5] },
      { id: 'ph-003-3', stage: 'Framing', caption: 'Structure topped to L18', uploadedBy: 'Site Manager', date: '2026-01-28', tone: PHOTO_TONES[1] },
      { id: 'ph-003-4', stage: 'Cladding / External Envelope', caption: 'Facade unitised panels L1–L8', uploadedBy: 'Facade Group', date: '2026-02-08', tone: PHOTO_TONES[4] },
    ],
  },
};

export function getConstructionData(projectId: string): ConstructionData {
  return constructionData[projectId] ?? { completedItems: [], inspections: [], ohs: [], defects: [], rfis: [], photos: [] };
}
