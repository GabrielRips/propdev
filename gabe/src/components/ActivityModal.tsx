import React, { useEffect } from 'react';
import { Activity } from '../data/phase-details';

interface ActivityModalProps {
  activity: Activity;
  onClose: () => void;
}

const typeLabels: Record<string, string> = {
  email_in: 'Incoming Email',
  email_out: 'Outgoing Email',
  phone_in: 'Incoming Phone Call',
  phone_out: 'Outgoing Phone Call',
  sms_in: 'Incoming SMS',
  sms_out: 'Outgoing SMS',
};

const typeIcons: Record<string, string> = {
  email_in: '📩',
  email_out: '📤',
  phone_in: '📞',
  phone_out: '📱',
  sms_in: '💬',
  sms_out: '💬',
};

function isEmail(type: string) {
  return type === 'email_in' || type === 'email_out';
}

function isPhone(type: string) {
  return type === 'phone_in' || type === 'phone_out';
}

function isSms(type: string) {
  return type === 'sms_in' || type === 'sms_out';
}

function directionLabel(type: string) {
  if (type.endsWith('_in')) return 'From';
  return 'To';
}

export default function ActivityModal({ activity, onClose }: ActivityModalProps) {
  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const formattedDate = new Date(activity.date).toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-xl">{typeIcons[activity.type]}</span>
            <h2 className="text-lg font-semibold text-gray-900">
              {typeLabels[activity.type]}
            </h2>
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
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {/* Meta fields */}
          <dl className="space-y-3 mb-5">
            <div className="flex gap-3">
              <dt className="text-sm text-gray-400 w-20 flex-shrink-0">{directionLabel(activity.type)}</dt>
              <dd className="text-sm font-medium text-gray-900">{activity.person}</dd>
            </div>

            {isEmail(activity.type) && activity.subject && (
              <div className="flex gap-3">
                <dt className="text-sm text-gray-400 w-20 flex-shrink-0">Subject</dt>
                <dd className="text-sm font-medium text-gray-900">{activity.subject}</dd>
              </div>
            )}

            <div className="flex gap-3">
              <dt className="text-sm text-gray-400 w-20 flex-shrink-0">Date</dt>
              <dd className="text-sm text-gray-700">{formattedDate}</dd>
            </div>
          </dl>

          {/* Content */}
          <div className="border-t border-gray-100 pt-4">
            {isEmail(activity.type) && (
              <>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Email Body
                </h4>
                <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-4 leading-relaxed">
                  {activity.body || activity.summary}
                </div>
              </>
            )}

            {isPhone(activity.type) && (
              <>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Call Transcript
                </h4>
                <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-4 leading-relaxed">
                  {activity.transcript || activity.summary}
                </div>
              </>
            )}

            {isSms(activity.type) && (
              <>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  SMS Message
                </h4>
                <div className="text-sm text-gray-700 whitespace-pre-wrap bg-blue-50 rounded-xl p-4 leading-relaxed border border-blue-100">
                  {activity.body || activity.summary}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 flex justify-end">
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
