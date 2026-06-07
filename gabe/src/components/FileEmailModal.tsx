import React, { useState } from 'react';
import { ProjectFile } from '../data/project-files';

interface FileEmailModalProps {
  file: ProjectFile;
  onClose: () => void;
}

function generateBody(fileName: string): string {
  return `Hi,\n\nI hope this email finds you well.\n\nPlease find attached ${fileName} for your review and records.\n\nCould you please review the document and let us know if you have any questions or require any amendments. We would appreciate your feedback at your earliest convenience.\n\nPlease don't hesitate to reach out if you need any further information.\n\nKind regards`;
}

export default function FileEmailModal({ file, onClose }: FileEmailModalProps) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState(`Please find attached: ${file.name}`);
  const [body, setBody] = useState('');
  const [sent, setSent] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  function handleAiDraft() {
    setAiGenerating(true);
    setTimeout(() => {
      setBody(generateBody(file.name));
      setAiGenerating(false);
    }, 1200);
  }

  function handleSend() {
    if (!to.trim()) return;
    setSent(true);
    setTimeout(onClose, 1400);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">New Email</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {sent ? (
          <div className="px-6 py-12 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-800">Email sent</p>
            <p className="text-xs text-gray-400">{file.name} was attached</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {/* To */}
              <div className="px-6 py-3 flex items-center gap-3">
                <span className="text-xs font-medium text-gray-400 w-14 flex-shrink-0">To</span>
                <input
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="recipient@example.com"
                  className="flex-1 text-sm text-gray-800 placeholder-gray-300 outline-none bg-transparent"
                />
              </div>
              {/* Subject */}
              <div className="px-6 py-3 flex items-center gap-3">
                <span className="text-xs font-medium text-gray-400 w-14 flex-shrink-0">Subject</span>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="flex-1 text-sm text-gray-800 outline-none bg-transparent"
                />
              </div>
              {/* Attachment */}
              <div className="px-6 py-3 flex items-center gap-3">
                <span className="text-xs font-medium text-gray-400 w-14 flex-shrink-0">Attach</span>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                  <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                  </svg>
                  <span className="text-xs text-blue-700 font-medium max-w-[260px] truncate">{file.name}</span>
                  <span className="text-xs text-blue-400">{file.size}</span>
                </div>
              </div>
              {/* Body */}
              <div className="px-6 py-3">
                <div className="flex justify-end mb-1.5">
                  <button
                    onClick={handleAiDraft}
                    disabled={aiGenerating}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {aiGenerating ? (
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                    )}
                    {aiGenerating ? 'Generating…' : 'AI Draft'}
                  </button>
                </div>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                  placeholder="Write your message or use AI Draft…"
                  className="w-full text-sm text-gray-800 outline-none bg-transparent resize-none placeholder-gray-300"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleSend}
                disabled={!to.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
