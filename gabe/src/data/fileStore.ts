// File store backed by the backend API (server-side storage on disk + DB).
// Keeps the same useFiles() interface the UI already uses.
import { useCallback, useEffect, useState } from 'react';
import { api, uploadFileRequest, fileDownloadUrl } from './api';

export interface FileMeta {
  id: string;
  projectId: string;
  category: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: number;
  uploadedBy: string;
}

export function useFiles(projectId: string) {
  const [files, setFiles] = useState<FileMeta[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!projectId) return;
    try {
      const list = await api.get<FileMeta[]>(`/projects/${projectId}/files`);
      setFiles(list);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    setLoading(true);
    reload();
  }, [reload]);

  const upload = useCallback(
    async (fileList: FileList | File[], category: string) => {
      const arr = Array.from(fileList);
      for (const f of arr) {
        await uploadFileRequest(projectId, f, category);
      }
      await reload();
    },
    [projectId, reload]
  );

  const remove = useCallback(
    async (id: string) => {
      await api.del(`/files/${id}`);
      await reload();
    },
    [reload]
  );

  const open = useCallback((id: string) => {
    window.open(fileDownloadUrl(id), '_blank', 'noopener');
  }, []);

  return { files, loading, upload, remove, open };
}
