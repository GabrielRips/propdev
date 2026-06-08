// Browser-persisted file storage (no backend) using IndexedDB, which can hold
// real files (building plans, PDFs, images) far beyond localStorage's ~5MB.
import { useCallback, useEffect, useState } from 'react';

export interface StoredFile {
  id: string;
  projectId: string;
  category: string;        // 'Architectural' | 'Working Drawings' | 'Consultant Reports' | ...
  name: string;
  type: string;            // mime
  size: number;
  uploadedAt: number;
  uploadedBy: string;
  blob: Blob;
}

export type FileMeta = Omit<StoredFile, 'blob'>;

const DB_NAME = 'propdev-files';
const STORE = 'files';
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const os = db.createObjectStore(STORE, { keyPath: 'id' });
        os.createIndex('projectId', 'projectId', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function newId(): string {
  return `f-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function addFile(
  projectId: string,
  file: File,
  category: string,
  uploadedBy: string
): Promise<FileMeta> {
  const db = await openDB();
  const record: StoredFile = {
    id: newId(),
    projectId,
    category,
    name: file.name,
    type: file.type || 'application/octet-stream',
    size: file.size,
    uploadedAt: Date.now(),
    uploadedBy,
    blob: file,
  };
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  emit();
  const { blob, ...meta } = record;
  return meta;
}

export async function listFiles(projectId: string): Promise<FileMeta[]> {
  const db = await openDB();
  const metas = await new Promise<FileMeta[]>((resolve, reject) => {
    const out: FileMeta[] = [];
    const tx = db.transaction(STORE, 'readonly');
    const idx = tx.objectStore(STORE).index('projectId');
    const req = idx.openCursor(IDBKeyRange.only(projectId));
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        const { blob, ...meta } = cursor.value as StoredFile;
        out.push(meta);
        cursor.continue();
      } else {
        resolve(out.sort((a, b) => b.uploadedAt - a.uploadedAt));
      }
    };
    req.onerror = () => reject(req.error);
  });
  db.close();
  return metas;
}

export async function getFileBlob(id: string): Promise<Blob | null> {
  const db = await openDB();
  const blob = await new Promise<Blob | null>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result ? (req.result as StoredFile).blob : null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return blob;
}

export async function deleteFile(id: string): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  emit();
}

/** Open a stored file in a new tab (preview/download). */
export async function openStoredFile(id: string): Promise<void> {
  const blob = await getFileBlob(id);
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function useFiles(projectId: string) {
  const [files, setFiles] = useState<FileMeta[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    if (!projectId) return;
    listFiles(projectId).then((f) => {
      setFiles(f);
      setLoading(false);
    });
  }, [projectId]);

  useEffect(() => {
    setLoading(true);
    reload();
    const l = () => reload();
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, [reload]);

  const uploadedBy = 'You';

  const upload = useCallback(
    async (fileList: FileList | File[], category: string) => {
      const arr = Array.from(fileList);
      for (const f of arr) {
        await addFile(projectId, f, category, uploadedBy);
      }
    },
    [projectId]
  );

  const remove = useCallback((id: string) => deleteFile(id), []);

  return { files, loading, upload, remove, open: openStoredFile };
}
