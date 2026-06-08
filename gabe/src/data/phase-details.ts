import { ProjectPhase } from './projects';

export type TaskStatus = 'done' | 'in_progress' | 'not_started';

export interface PhaseTask {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate?: string; // ISO date string e.g. '2026-03-01'
}

export type ActivityType = 'email_in' | 'email_out' | 'phone_in' | 'phone_out' | 'sms_in' | 'sms_out';

export interface Activity {
  id: string;
  type: ActivityType;
  summary: string;
  person: string;
  date: string;
  // Email fields
  subject?: string;
  body?: string;
  // Phone fields
  transcript?: string;
  // SMS fields (uses body)
}

export interface PhaseDetail {
  tasks: PhaseTask[];
  activities: Activity[];
}

// Map of projectId -> phase -> detail
export const phaseDetails: Record<string, Partial<Record<ProjectPhase, PhaseDetail>>> = {};
