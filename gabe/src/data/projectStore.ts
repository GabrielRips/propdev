// Project store backed by the backend API, exposed through the same
// useProjects()/addProject()/updateProject()/deleteProject() interface as before.
import { useSyncExternalStore, useEffect } from 'react';
import { Project, ProjectPhase, ProjectType } from './projects';
import { api } from './api';

let projects: Project[] = [];
let loaded = false;
let loading = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getProjects(): Project[] {
  return projects;
}

export function getProject(id: string | undefined): Project | undefined {
  return projects.find((p) => p.id === id);
}

export async function refreshProjects(): Promise<void> {
  if (loading) return;
  loading = true;
  try {
    projects = await api.get<Project[]>('/projects');
    loaded = true;
    emit();
  } catch {
    /* not authenticated yet, or offline */
  } finally {
    loading = false;
  }
}

export interface NewProjectInput {
  name: string;
  address: string;
  suburb: string;
  state: string;
  type: ProjectType;
  totalUnits: number;
  estimatedValue: number;
  startDate: string;
  estimatedCompletion: string;
  description?: string;
  phases?: Partial<Record<ProjectPhase, number>>;
}

export async function addProject(input: NewProjectInput): Promise<Project> {
  const created = await api.post<Project>('/projects', {
    name: input.name.trim(),
    address: input.address.trim(),
    suburb: input.suburb.trim(),
    state: input.state,
    type: input.type,
    phases: input.phases ?? {},
    totalUnits: input.totalUnits || 0,
    estimatedValue: input.estimatedValue || 0,
    startDate: input.startDate,
    estimatedCompletion: input.estimatedCompletion,
    recentEmails: 0,
    description: input.description?.trim() ?? '',
  });
  projects = [created, ...projects];
  emit();
  return created;
}

export async function updateProject(id: string, patch: Partial<Project>): Promise<void> {
  // optimistic
  projects = projects.map((p) => (p.id === id ? { ...p, ...patch } : p));
  emit();
  try {
    await api.put<Project>(`/projects/${id}`, patch);
  } catch {
    refreshProjects();
  }
}

export async function deleteProject(id: string): Promise<void> {
  projects = projects.filter((p) => p.id !== id);
  emit();
  try {
    await api.del(`/projects/${id}`);
  } catch {
    refreshProjects();
  }
}

export function useProjects(): Project[] {
  const value = useSyncExternalStore(subscribe, getProjects, getProjects);
  useEffect(() => {
    if (!loaded) refreshProjects();
  }, []);
  return value;
}
