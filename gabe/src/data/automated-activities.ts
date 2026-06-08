import { ProjectPhase } from './projects';

export type AutomatedActionType =
  | 'email_reminder'
  | 'follow_up_email'
  | 'status_request'
  | 'document_chase'
  | 'meeting_request';

export type AutomatedActivityStatus = 'scheduled' | 'pending_approval' | 'sent';

export interface AutomatedActivity {
  id: string;
  actionType: AutomatedActionType;
  description: string;
  triggerSummary: string;
  recipient: string;
  scheduledDate: string;
  status: AutomatedActivityStatus;
  phase: ProjectPhase;
}

export const automatedActivities: Record<string, AutomatedActivity[]> = {};
