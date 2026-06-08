// Browser-persisted project store (no backend).
// Projects created in-app are saved to localStorage and shared across the UI
// via a React external store so every screen updates when one is added/removed.
import { useSyncExternalStore } from 'react';
import { Project, ProjectPhase, ProjectType } from './projects';

const STORAGE_KEY = 'propdev:projects';

let projects: Project[] = load();
const listeners = new Set<() => void>();

function load(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Project[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

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

export function addProject(input: NewProjectInput): Project {
  const project: Project = {
    id: `proj-${Date.now().toString(36)}`,
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
  };
  projects = [project, ...projects];
  persist();
  emit();
  return project;
}

export function deleteProject(id: string) {
  projects = projects.filter((p) => p.id !== id);
  persist();
  emit();
}

export function useProjects(): Project[] {
  return useSyncExternalStore(subscribe, getProjects, getProjects);
}
