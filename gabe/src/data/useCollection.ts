// Generic, browser-persisted collection store (no backend).
// Every module gets a consistent way to add / edit / remove records that
// persist to localStorage and sync across components via an external store.
import { useSyncExternalStore, useMemo } from 'react';

export interface HasId {
  id: string;
}

const memory: Record<string, HasId[]> = {};
const listeners: Record<string, Set<() => void>> = {};

function load<T extends HasId>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function snapshot<T extends HasId>(key: string): T[] {
  if (!(key in memory)) memory[key] = load<T>(key);
  return memory[key] as T[];
}

function persist(key: string) {
  try {
    localStorage.setItem(key, JSON.stringify(memory[key]));
  } catch {
    /* ignore quota errors */
  }
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

export interface Collection<T extends HasId> {
  items: T[];
  add: (item: Omit<T, 'id'> & { id?: string }) => T;
  update: (id: string, patch: Partial<T>) => void;
  remove: (id: string) => void;
  set: (items: T[]) => void;
}

/** Imperative access (for non-component code). */
export function getCollection<T extends HasId>(key: string): T[] {
  return snapshot<T>(key);
}

export function addToCollection<T extends HasId>(key: string, item: Omit<T, 'id'> & { id?: string }): T {
  const record = { id: item.id ?? newId(), ...item } as T;
  memory[key] = [record, ...snapshot<T>(key)];
  persist(key);
  emit(key);
  return record;
}

/** React hook — reactive, persisted collection keyed by string. */
export function useCollection<T extends HasId>(key: string): Collection<T> {
  const items = useSyncExternalStore(
    (l) => subscribeKey(key, l),
    () => snapshot<T>(key),
    () => snapshot<T>(key)
  );

  return useMemo(
    () => ({
      items,
      add: (item) => addToCollection<T>(key, item),
      update: (id, patch) => {
        memory[key] = snapshot<T>(key).map((r) => (r.id === id ? { ...r, ...patch } : r));
        persist(key);
        emit(key);
      },
      remove: (id) => {
        memory[key] = snapshot<T>(key).filter((r) => r.id !== id);
        persist(key);
        emit(key);
      },
      set: (next) => {
        memory[key] = next;
        persist(key);
        emit(key);
      },
    }),
    [key, items]
  );
}
