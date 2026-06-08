export type FileCategory = 'Architectural' | 'Working Drawings' | 'Consultant Reports';

export interface FileVersion {
  version: string;
  date: string;
  uploadedBy: string;
  note?: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  category: FileCategory;
  date: string;
  size: string;
  uploadedBy: string;
  versions?: FileVersion[];
}

export const projectFiles: Record<string, ProjectFile[]> = {};
