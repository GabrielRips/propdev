import React, { useState, useEffect } from 'react';

interface VoiceModeModalProps {
  projectName: string;
  onClose: () => void;
}

export default function VoiceModeModal({ projectName, onClose }: VoiceModeModalProps) {
  const [transcript, setTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(true);
  const [showDetectedTask, setShowDetectedTask] = useState(false);

  const fullText = 'Add a reminder to call Paul next week and ask about cabinets';

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);
  const dueDateStr = dueDate.toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Simulate typing out the transcription
  useEffect(() => {
    if (!isTranscribing) return;
    if (transcript.length >= fullText.length) {
      setIsTranscribing(false);
      return;
    }
    const timeout = setTimeout(() => {
      setTranscript(fullText.slice(0, transcript.length + 1));
    }, 35);
    return () => clearTimeout(timeout);
  }, [transcript, isTranscribing]);

  // Show detected task after transcription finishes (with a short delay to simulate AI processing)
  useEffect(() => {
    if (isTranscribing || showDetectedTask) return;
    const timeout = setTimeout(() => setShowDetectedTask(true), 600);
    return () => clearTimeout(timeout);
  }, [isTranscribing, showDetectedTask]);

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-xl shadow-xl max-w-lg w-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-xl">{'\uD83C\uDFA4'}</span>
            <h2 className="text-lg font-semibold text-gray-900">Voice Mode</h2>
            {isTranscribing && (
              <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full animate-pulse">
                Listening...
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p className="text-sm text-gray-500 mb-3">
            Project: <span className="font-medium text-gray-700">{projectName}</span>
          </p>

          {/* Waveform visualiser placeholder */}
          <div className="flex items-center justify-center gap-1 h-12 mb-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className={`w-1 rounded-full ${isTranscribing ? 'bg-red-400 animate-pulse' : 'bg-gray-300'}`}
                style={{
                  height: `${12 + Math.sin(i * 0.8) * 10 + Math.random() * 8}px`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>

          {/* Transcript */}
          <div className="relative">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">
              Transcript
            </label>
            <textarea
              rows={3}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Speak now..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            {isTranscribing && (
              <span className="absolute bottom-3 right-3 w-2 h-4 bg-gray-900 animate-pulse rounded-sm" />
            )}
          </div>

          {/* AI-detected task */}
          {showDetectedTask && (
            <div className="mt-4 border border-violet-200 bg-violet-50 rounded-lg p-3 animate-fadeIn">
              <div className="flex items-center gap-1.5 mb-2">
                <svg className="w-3.5 h-3.5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
                <span className="text-xs font-semibold text-violet-700">AI Detected Task</span>
              </div>
              <div className="flex items-start gap-3">
                <input type="checkbox" checked readOnly className="mt-0.5 h-4 w-4 rounded border-violet-300 text-violet-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Call Paul re cabinets</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    <span className="text-xs text-gray-500">Due {dueDateStr}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={transcript.trim().length === 0}
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
