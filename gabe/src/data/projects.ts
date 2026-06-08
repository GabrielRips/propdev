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

export const projects: Project[] = [];
