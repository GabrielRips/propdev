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

export const automatedActivities: Record<string, AutomatedActivity[]> = {
  'proj-001': [
    {
      id: 'aa-001-01',
      actionType: 'follow_up_email',
      description: 'Follow up on timber delivery delay for Units 11-12 trusses',
      triggerSummary: 'Phone call from Tom Builder on 12 Feb — 1-week timber delivery delay',
      recipient: 'Tom Builder',
      scheduledDate: '2026-02-22',
      status: 'scheduled',
      phase: 'Construction',
    },
    {
      id: 'aa-001-02',
      actionType: 'email_reminder',
      description: 'Remind Creative Agency that website mockup feedback is due',
      triggerSummary: 'Email from Creative Agency on 10 Feb — feedback requested by Thursday',
      recipient: 'Creative Agency',
      scheduledDate: '2026-02-20',
      status: 'pending_approval',
      phase: 'Marketing',
    },
    {
      id: 'aa-001-03',
      actionType: 'status_request',
      description: 'Request pre-sales progress update toward 60% target from sales agent',
      triggerSummary: 'ANZ finance condition — 60% pre-sale requirement; task due 15 Mar',
      recipient: 'Lisa Morris',
      scheduledDate: '2026-02-25',
      status: 'scheduled',
      phase: 'Pre-sales',
    },
    {
      id: 'aa-001-04',
      actionType: 'follow_up_email',
      description: 'Follow up with David Wong on Unit 4 enquiry — send floor plans and price guide',
      triggerSummary: 'Inbound enquiry email from David Wong on 28 Jan — awaiting response',
      recipient: 'David Wong',
      scheduledDate: '2026-02-21',
      status: 'sent',
      phase: 'Pre-sales',
    },
  ],
  'proj-002': [
    {
      id: 'aa-002-01',
      actionType: 'document_chase',
      description: 'Chase Paul Henderson for signed fixed-price building contract',
      triggerSummary: 'SMS sent to Paul Henderson on 16 Jan — Westpac needs contract for finance',
      recipient: 'Paul Henderson',
      scheduledDate: '2026-02-22',
      status: 'scheduled',
      phase: 'Financing',
    },
    {
      id: 'aa-002-02',
      actionType: 'follow_up_email',
      description: 'Follow up with SJB Architects on amended site plan with 6.5m front setback',
      triggerSummary: 'Phone call to SJB on 10 Feb — council requires 6.5m setback',
      recipient: 'SJB Architects',
      scheduledDate: '2026-02-21',
      status: 'pending_approval',
      phase: 'Architecture',
    },
    {
      id: 'aa-002-03',
      actionType: 'status_request',
      description: 'Check DA package readiness with planning consultant before lodgement',
      triggerSummary: 'Draft DA documents sent for review on 12 Feb — lodgement target next week',
      recipient: 'Planning Consultant',
      scheduledDate: '2026-02-24',
      status: 'scheduled',
      phase: 'Planning Permit',
    },
  ],
  'proj-003': [
    {
      id: 'aa-003-01',
      actionType: 'document_chase',
      description: 'Chase Multiplex for written confirmation of no programme impact from crane reschedule',
      triggerSummary: 'Phone call from Multiplex on 10 Feb — verbal approval given, formal confirmation requested',
      recipient: 'Multiplex',
      scheduledDate: '2026-02-21',
      status: 'pending_approval',
      phase: 'Construction',
    },
    {
      id: 'aa-003-02',
      actionType: 'email_reminder',
      description: 'Remind PR agency to send detailed launch event timeline',
      triggerSummary: 'Phone call to PR Partner on 8 Feb — timeline due by Monday',
      recipient: 'PR Partner',
      scheduledDate: '2026-02-22',
      status: 'scheduled',
      phase: 'Marketing',
    },
    {
      id: 'aa-003-03',
      actionType: 'status_request',
      description: 'Check 3-bed penthouse display suite completion status — VIP preview on 28 Feb',
      triggerSummary: 'Email from Creative Agency on 12 Feb — penthouse display completion next Friday',
      recipient: 'Creative Agency',
      scheduledDate: '2026-02-24',
      status: 'scheduled',
      phase: 'Marketing',
    },
  ],
  'proj-004': [
    {
      id: 'aa-004-01',
      actionType: 'document_chase',
      description: 'Send NAB the updated pre-sales figures and finalised QS report',
      triggerSummary: 'Phone call from NAB on 1 Feb — documents needed for indicative term sheet',
      recipient: 'NAB Dev Finance',
      scheduledDate: '2026-02-22',
      status: 'scheduled',
      phase: 'Financing',
    },
    {
      id: 'aa-004-02',
      actionType: 'follow_up_email',
      description: 'Follow up with Woods Bagot on updated ground floor retail plan (Option B)',
      triggerSummary: 'Retail layout workshop on 15 Feb — updated plan due end of next week',
      recipient: 'Woods Bagot',
      scheduledDate: '2026-02-25',
      status: 'pending_approval',
      phase: 'Architecture',
    },
    {
      id: 'aa-004-03',
      actionType: 'email_reminder',
      description: 'Remind Lipman Karas to finalise contracts by 10 March for pre-sales launch',
      triggerSummary: 'Draft contracts sent on 14 Feb — finalised contracts needed by 10 Mar',
      recipient: 'Lipman Karas',
      scheduledDate: '2026-03-03',
      status: 'scheduled',
      phase: 'Pre-sales',
    },
  ],
  'proj-005': [
    {
      id: 'aa-005-01',
      actionType: 'follow_up_email',
      description: 'Follow up with Western Power on electricity connection cost estimate',
      triggerSummary: 'Email sent to Western Power on 8 Feb — no response received',
      recipient: 'Western Power',
      scheduledDate: '2026-02-22',
      status: 'scheduled',
      phase: 'Feasibility',
    },
    {
      id: 'aa-005-02',
      actionType: 'status_request',
      description: 'Request formal selling agent proposal from Harcourts Baldivis',
      triggerSummary: 'Phone call to Harcourts on 14 Feb — agent to send formal proposal',
      recipient: 'Harcourts Baldivis',
      scheduledDate: '2026-02-24',
      status: 'pending_approval',
      phase: 'Pre-sales',
    },
  ],
};
