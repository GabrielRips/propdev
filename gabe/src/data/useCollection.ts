// Generic, backend-persisted collection store.
// Keyed by `propdev:<projectId>:<name>`, backed by the REST collections API,
// with an in-memory cache + optimistic updates so the UI stays snappy.
import { useSyncExternalStore, useEffect, useMemo } from 'react';
import { api } from './api';

export interface HasId {
  id: string;
}

const cache: Record<string, HasId[]> = {};
const loaded: Record<string, boolean> = {};
const listeners: Record<string, Set<() => void>> = {};

function parseKey(key: string): { projectId: string; name: string } | null {
  const parts = key.split(':'); // ['propdev', projectId, name...]
  if (parts.length < 3) return null;
  return { projectId: parts[1], name: parts.slice(2).join(':') };
}

function endpoint(key: string): string | null {
  const p = parseKey(key);
  if (!p || !p.projectId) return null;
  return `/projects/${p.projectId}/collections/${p.name}`;
}

function snapshot<T extends HasId>(key: string): T[] {
  return (cache[key] ?? []) as T[];
}

function emit(key: string) {
  listeners[key]?.forEach((l) => l());
}

function subscribeKey(key: string, listener: () => void) {
  (listeners[key] ??= new Set()).add(listener);
  return () => listeners[key]?.delete(listener);
}

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

async function fetchKey(key: string) {
  const url = endpoint(key);
  if (!url) return;
  try {
    cache[key] = await api.get<HasId[]>(url);
    loaded[key] = true;
    emit(key);
  } catch {
    /* ignore */
  }
}

export interface Collection<T extends HasId> {
  items: T[];
  add: (item: Omit<T, 'id'> & { id?: string }) => T;
  update: (id: string, patch: Partial<T>) => void;
  remove: (id: string) => void;
  set: (items: T[]) => void;
}

export function useCollection<T extends HasId>(key: string): Collection<T> {
  const items = useSyncExternalStore(
    (l) => subscribeKey(key, l),
    () => snapshot<T>(key),
    () => snapshot<T>(key)
  );

  useEffect(() => {
    if (!loaded[key]) fetchKey(key);
  }, [key]);

  return useMemo(() => {
    const url = endpoint(key);
    return {
      items,
      add: (item) => {
        const record = { id: item.id ?? newId(), ...item } as T;
        cache[key] = [record, ...snapshot<T>(key)];
        emit(key);
        if (url) api.post(url, record).catch(() => fetchKey(key));
        return record;
      },
      update: (id, patch) => {
        cache[key] = snapshot<T>(key).map((r) => (r.id === id ? { ...r, ...patch } : r));
        emit(key);
        if (url) api.put(`${url}/${id}`, patch).catch(() => fetchKey(key));
      },
      remove: (id) => {
        cache[key] = snapshot<T>(key).filter((r) => r.id !== id);
        emit(key);
        if (url) api.del(`${url}/${id}`).catch(() => fetchKey(key));
      },
      set: (next) => {
        cache[key] = next;
        emit(key);
      },
    };
  }, [key, items]);
}
