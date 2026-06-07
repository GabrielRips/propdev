import React from 'react';
import { ProjectFile } from '../data/project-files';

interface FileVersionsModalProps {
  file: ProjectFile;
  onClose: () => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function FileVersionsModal({ file, onClose }: FileVersionsModalProps) {
  const versions = file.versions ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Version History</h2>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{file.name}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Version list */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {/* Current version */}
          <div className="flex items-start gap-4 py-3">
            <div className="flex flex-col items-center gap-1 flex-shrink-0 w-10">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-50" />
              {versions.length > 0 && <div className="w-px flex-1 min-h-[24px] bg-gray-200" />}
            </div>
            <div className="flex-1 min-w-0 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-900">Current version</span>
                <span className="text-[10px] font-medium bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">Latest</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{formatDate(file.date)} · Uploaded by {file.uploadedBy}</p>
            </div>
          </div>

          {/* Previous versions */}
          {versions.map((v, i) => (
            <div key={v.version} className="flex items-start gap-4 py-3">
              <div className="flex flex-col items-center gap-1 flex-shrink-0 w-10">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                {i < versions.length - 1 && <div className="w-px flex-1 min-h-[24px] bg-gray-200" />}
              </div>
              <div className="flex-1 min-w-0 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-700">{v.version}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{formatDate(v.date)} · Uploaded by {v.uploadedBy}</p>
                {v.note && (
                  <p className="text-xs text-gray-400 mt-1 italic">{v.note}</p>
                )}
              </div>
            </div>
          ))}

          {versions.length === 0 && (
            <p className="text-sm text-gray-400 italic py-4">No previous versions</p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
