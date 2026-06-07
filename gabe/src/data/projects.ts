export const PROJECT_PHASES = [
  'Site Identification',
  'Feasibility',
  'Financing',
  'Pre-sales',
  'Land Acquisition',
  'Architecture',
  'Planning Permit',
  'Construction',
  'Marketing',
  'Sales',
] as const;

export type ProjectPhase = typeof PROJECT_PHASES[number];

export type ProjectType = 'Townhouse Development' | 'Residential Tower' | 'Subdivision';

export type PhaseProgress = Partial<Record<ProjectPhase, number>>;

export interface Project {
  id: string;
  name: string;
  address: string;
  suburb: string;
  state: string;
  type: ProjectType;
  phases: PhaseProgress;
  totalUnits: number;
  estimatedValue: number;
  startDate: string;
  estimatedCompletion: string;
  recentEmails: number;
  description: string;
}

export function overallCompletion(phases: PhaseProgress): number {
  const entries = Object.entries(phases);
  if (entries.length === 0) return 0;
  const total = entries.reduce((sum, [, pct]) => sum + (pct ?? 0), 0);
  return Math.round(total / PROJECT_PHASES.length);
}

export const projects: Project[] = [
  {
    id: 'proj-001',
    name: 'Riverside Townhouses',
    address: '42 Lithgow Street',
    suburb: 'Abbotsford',
    state: 'VIC',
    type: 'Townhouse Development',
    phases: {
      'Site Identification': 100,
      'Feasibility': 100,
      'Financing': 100,
      'Pre-sales': 80,
      'Land Acquisition': 100,
      'Architecture': 100,
      'Planning Permit': 100,
      'Construction': 65,
      'Marketing': 40,
    },
    totalUnits: 12,
    estimatedValue: 14400000,
    startDate: '2024-03-15',
    estimatedCompletion: '2026-09-30',
    recentEmails: 23,
    description: '12 luxury townhouses along the Yarra River with premium finishes and private courtyards.',
  },
  {
    id: 'proj-002',
    name: 'Wattle Grove Residences',
    address: '18 Memorial Avenue',
    suburb: 'Kellyville',
    state: 'NSW',
    type: 'Townhouse Development',
    phases: {
      'Site Identification': 100,
      'Feasibility': 100,
      'Financing': 75,
      'Pre-sales': 30,
      'Land Acquisition': 100,
      'Architecture': 85,
      'Planning Permit': 50,
    },
    totalUnits: 8,
    estimatedValue: 8800000,
    startDate: '2025-01-10',
    estimatedCompletion: '2027-06-15',
    recentEmails: 14,
    description: '8 contemporary townhouses in a family-friendly estate close to the Metro Northwest line.',
  },
  {
    id: 'proj-003',
    name: 'Horizon Tower',
    address: '155 Grey Street',
    suburb: 'South Brisbane',
    state: 'QLD',
    type: 'Residential Tower',
    phases: {
      'Site Identification': 100,
      'Feasibility': 100,
      'Financing': 100,
      'Pre-sales': 100,
      'Land Acquisition': 100,
      'Architecture': 100,
      'Planning Permit': 100,
      'Construction': 50,
      'Marketing': 20,
    },
    totalUnits: 320,
    estimatedValue: 256000000,
    startDate: '2025-06-01',
    estimatedCompletion: '2029-12-01',
    recentEmails: 8,
    description: '45-storey residential tower with rooftop pool, gym, and panoramic Brisbane River views.',
  },
  {
    id: 'proj-004',
    name: 'Aurora Central',
    address: '90 Grote Street',
    suburb: 'Adelaide',
    state: 'SA',
    type: 'Residential Tower',
    phases: {
      'Site Identification': 100,
      'Feasibility': 100,
      'Financing': 60,
      'Pre-sales': 45,
      'Land Acquisition': 90,
      'Architecture': 70,
      'Planning Permit': 25,
    },
    totalUnits: 210,
    estimatedValue: 147000000,
    startDate: '2025-02-20',
    estimatedCompletion: '2028-11-30',
    recentEmails: 31,
    description: '30-storey mixed-use tower in the Adelaide CBD with ground-floor retail and premium apartments.',
  },
  {
    id: 'proj-005',
    name: 'Banksia Heights Estate',
    address: 'Lot 500 Baldivis Road',
    suburb: 'Baldivis',
    state: 'WA',
    type: 'Subdivision',
    phases: {
      'Site Identification': 100,
      'Feasibility': 65,
      'Financing': 15,
      'Pre-sales': 5,
    },
    totalUnits: 100,
    estimatedValue: 45000000,
    startDate: '2025-09-01',
    estimatedCompletion: '2028-03-31',
    recentEmails: 3,
    description: '100-lot residential subdivision with parks, walking trails, and community amenities.',
  },
];
