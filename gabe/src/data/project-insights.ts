export type ProjectHealthStatus = 'on_track' | 'at_risk' | 'critical';

export interface ProjectHealth {
  status: ProjectHealthStatus;
  label: string;
  reason: string;
}

export interface ProjectInsight {
  id: string;
  text: string;
  category: 'risk' | 'opportunity' | 'action';
}

export interface ProjectCommandData {
  abn: string;
  health: ProjectHealth;
  insights: ProjectInsight[];
}

export const projectCommandData: Record<string, ProjectCommandData> = {};
