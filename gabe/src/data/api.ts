// Thin client for the PropDev backend API (same origin).
const TOKEN_KEY = 'propdev-token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const opts: RequestInit = { method, headers };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch('/api' + url, opts);
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status} ${msg}`);
  }
  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(url: string) => request<T>('GET', url),
  post: <T>(url: string, body?: unknown) => request<T>('POST', url, body),
  put: <T>(url: string, body?: unknown) => request<T>('PUT', url, body),
  del: <T>(url: string) => request<T>('DELETE', url),
};

export interface LoginResult {
  token: string;
  user: any;
}
export async function loginRequest(username: string, password: string): Promise<LoginResult | null> {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) return null;
  return res.json();
}

// File helpers
export function fileDownloadUrl(id: string): string {
  return `/api/files/${id}?token=${encodeURIComponent(getToken() || '')}`;
}

export async function uploadFileRequest(projectId: string, file: File, category: string) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('category', category);
  const res = await fetch(`/api/projects/${projectId}/files`, {
    method: 'POST',
    headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
    body: fd,
  });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}
