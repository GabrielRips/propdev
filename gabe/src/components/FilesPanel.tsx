import React, { useRef, useState } from 'react';
import { useFiles, FileMeta } from '../data/fileStore';

const CATEGORIES = ['Architectural', 'Working Drawings', 'Consultant Reports', 'Permits', 'Other'];

function fmtSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  return `${bytes} B`;
}

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fileIcon(type: string): string {
  if (type.includes('pdf')) return '📄';
  if (type.startsWith('image/')) return '🖼️';
  if (type.includes('zip') || type.includes('compressed')) return '🗜️';
  if (type.includes('word') || type.includes('document')) return '📝';
  if (type.includes('sheet') || type.includes('excel') || type.includes('csv')) return '📊';
  return '📁';
}

export default function FilesPanel({ projectId }: { projectId: string }) {
  const { files, loading, upload, remove, open } = useFiles(projectId);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    setBusy(true);
    await upload(list, category);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  const grouped = files.reduce<Record<string, FileMeta[]>>((acc, f) => {
    (acc[f.category] ??= []).push(f);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {/* Uploader */}
      <div className="surface p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Upload files & plans</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className={`rounded-xl border-2 border-dashed px-6 py-8 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="text-3xl mb-2">{busy ? '⏳' : '📤'}</div>
          <p className="text-sm font-medium text-gray-700">
            {busy ? 'Uploading…' : 'Drop building plans or documents here'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            or click to browse · PDF, images, drawings, spreadsheets · stored in your browser
          </p>
        </div>
      </div>

      {/* File list */}
      <div className="surface overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">Files</h3>
          <span className="text-xs font-semibold text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">{files.length}</span>
        </div>

        {loading ? (
          <p className="px-5 py-8 text-sm text-gray-400 text-center">Loading…</p>
        ) : files.length === 0 ? (
          <p className="px-5 py-10 text-sm text-gray-400 text-center">No files yet — upload plans and documents above.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {Object.entries(grouped).map(([cat, list]) => (
              <div key={cat} className="px-5 py-3">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{cat}</p>
                <ul className="space-y-1">
                  {list.map((f) => (
                    <li key={f.id} className="flex items-center gap-3 py-1.5 group">
                      <span className="text-lg flex-shrink-0">{fileIcon(f.type)}</span>
                      <button onClick={() => open(f.id)} className="min-w-0 flex-1 text-left">
                        <p className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-600 transition-colors">{f.name}</p>
                        <p className="text-xs text-gray-400">{fmtSize(f.size)} · {fmtDate(f.uploadedAt)}</p>
                      </button>
                      <button
                        onClick={() => open(f.id)}
                        className="text-xs font-medium text-gray-500 hover:text-blue-600 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => remove(f.id)}
                        className="text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
