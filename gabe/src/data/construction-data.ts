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

export const constructionData: Record<string, ConstructionData> = {};

export function getConstructionData(projectId: string): ConstructionData {
  return constructionData[projectId] ?? { completedItems: [], inspections: [], ohs: [], defects: [], rfis: [], photos: [] };
}
