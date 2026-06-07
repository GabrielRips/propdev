import React, { useState, useMemo } from 'react';
import { PROJECT_PHASES } from '../data/projects';
import { phaseDetails, Activity, TaskStatus } from '../data/phase-details';
import { automatedActivities, AutomatedActionType, AutomatedActivityStatus } from '../data/automated-activities';
import ActivityModal from './ActivityModal';
import SoftPhoneModal from './SoftPhoneModal';
import { Contact, contactsData } from '../data/contacts-data';

const activityIcons: Record<string, { icon: string; label: string }> = {
  email_in: { icon: '📩', label: 'Email from' },
  email_out: { icon: '📤', label: 'Email to' },
  phone_in: { icon: '📞', label: 'Phone call from' },
  phone_out: { icon: '📱', label: 'Phone call to' },
  sms_in: { icon: '💬', label: 'SMS from' },
  sms_out: { icon: '💬', label: 'SMS to' },
};

const statusLabel: Record<TaskStatus, string> = {
  done: 'Done',
  in_progress: 'In Progress',
  not_started: 'Not Started',
};

const statusStyle: Record<TaskStatus, string> = {
  done: 'bg-green-100 text-green-700',
  in_progress: 'bg-blue-100 text-blue-700',
  not_started: 'bg-gray-100 text-gray-500',
};

const actionTypeIcons: Record<AutomatedActionType, string> = {
  email_reminder: '\u23F0',
  follow_up_email: '\uD83E\uDD16',
  status_request: '\uD83D\uDCCB',
  document_chase: '\uD83D\uDCCE',
  meeting_request: '\uD83D\uDCC5',
};

const automatedStatusStyle: Record<AutomatedActivityStatus, string> = {
  scheduled: 'bg-amber-100 text-amber-700',
  pending_approval: 'bg-blue-100 text-blue-700',
  sent: 'bg-green-100 text-green-700',
};

const automatedStatusLabel: Record<AutomatedActivityStatus, string> = {
  scheduled: 'Scheduled',
  pending_approval: 'Pending Approval',
  sent: 'Sent',
};

interface AnnotatedActivity extends Activity {
  phase: string;
}

interface AggregatedTask {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate?: string;
  phase: string;
  source: 'mock' | 'user';
}


function getAllActivities(projectId: string): AnnotatedActivity[] {
  const projectPhases = phaseDetails[projectId] || {};
  const activities: AnnotatedActivity[] = [];

  for (const phase of PROJECT_PHASES) {
    const detail = projectPhases[phase];
    if (detail) {
      for (const a of detail.activities) {
        activities.push({ ...a, phase });
      }
    }
  }

  return activities.sort((a, b) => b.date.localeCompare(a.date));
}

function getFilteredTasks(projectId: string): AggregatedTask[] {
  const projectPhases = phaseDetails[projectId] || {};
  const tasks: AggregatedTask[] = [];
  const today = new Date().toISOString().slice(0, 10);
  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekEndStr = weekEnd.toISOString().slice(0, 10);

  for (const phase of PROJECT_PHASES) {
    const detail = projectPhases[phase];
    if (detail) {
      for (const t of detail.tasks) {
        if (t.status === 'done') continue;
        if (t.dueDate && t.dueDate > weekEndStr) continue;
        tasks.push({ id: t.id, title: t.title, status: t.status, dueDate: t.dueDate, phase, source: 'mock' });
      }
    }

    const storageKey = `propdev:${projectId}:${phase}:todos`;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const todos: { id: string; text: string; completed: boolean; dueDate: string }[] = JSON.parse(stored);
        for (const todo of todos) {
          if (todo.completed) continue;
          if (todo.dueDate && todo.dueDate > weekEndStr) continue;
          tasks.push({
            id: todo.id,
            title: todo.text,
            status: 'not_started',
            dueDate: todo.dueDate || undefined,
            phase,
            source: 'user',
          });
        }
      }
    } catch {
      // ignore
    }
  }

  // Sort: overdue first, then by status, then by due date
  const statusOrder: Record<TaskStatus, number> = { in_progress: 0, not_started: 1, done: 2 };
  return tasks.sort((a, b) => {
    const aOverdue = a.dueDate && a.dueDate < today ? 1 : 0;
    const bOverdue = b.dueDate && b.dueDate < today ? 1 : 0;
    if (bOverdue !== aOverdue) return bOverdue - aOverdue;
    const sd = statusOrder[a.status] - statusOrder[b.status];
    if (sd !== 0) return sd;
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    return 0;
  });
}


function formatDateShort(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface WipTabProps {
  projectId: string;
}

export default function WipTab({ projectId }: WipTabProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [callContact, setCallContact] = useState<Contact | null>(null);
  const allContacts = contactsData[projectId] ?? [];

  function openCallModal(personName: string) {
    const found = allContacts.find(c => c.name === personName);
    setCallContact(found ?? { id: `wip-${personName}`, name: personName, organisation: '', phone: '', email: '' });
  }

  const activities = useMemo(() => getAllActivities(projectId), [projectId]);
  const tasks = useMemo(() => getFilteredTasks(projectId), [projectId]);
  const aiActivities = useMemo(() => automatedActivities[projectId] || [], [projectId]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column — Activities */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Latest Activities</h3>
          </div>
          <div className="px-5 py-3 max-h-[600px] overflow-y-auto">
            {activities.length > 0 ? (
              <ul className="space-y-1">
                {activities.map((activity) => {
                  const info = activityIcons[activity.type] || { icon: '📋', label: 'Activity' };
                  return (
                    <li key={activity.id}>
                      <button
                        onClick={() => setSelectedActivity(activity)}
                        className="flex items-center gap-2 text-sm w-full text-left rounded-lg p-2 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <span className="flex-shrink-0">{info.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-gray-700">
                            <span className="text-gray-400">{info.label}</span>{' '}
                            <span className="font-medium">{activity.person}</span>
                          </p>
                          <p className="text-gray-500 text-xs truncate">{activity.summary}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-gray-400 text-xs">
                              {new Date(activity.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                              {activity.phase}
                            </span>
                          </div>
                        </div>
                        {/* Quick action buttons */}
                        <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                          {(activity.type === 'email_in' || activity.type === 'email_out') && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs font-medium transition-colors cursor-pointer">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                              </svg>
                              Reply
                            </span>
                          )}
                          {(activity.type === 'sms_in' || activity.type === 'sms_out') && (
                            <>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs font-medium transition-colors cursor-pointer">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                                </svg>
                                Reply
                              </span>
                              <button
                                onClick={() => openCallModal(activity.person)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 hover:bg-green-100 rounded text-xs font-medium transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                </svg>
                                Call
                              </button>
                            </>
                          )}
                          {(activity.type === 'phone_in' || activity.type === 'phone_out') && (
                            <button
                              onClick={() => openCallModal(activity.person)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 hover:bg-green-100 rounded text-xs font-medium transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                              </svg>
                              Call
                            </button>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 italic py-4">No activities yet</p>
            )}
          </div>
        </div>

        {/* Right Column — Tasks + Notes */}
        <div className="space-y-5">
          {/* Tasks */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">
                Tasks
                {tasks.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    {tasks.length} upcoming
                  </span>
                )}
              </h3>
            </div>
            <div className="px-5 py-3 max-h-[300px] overflow-y-auto">
              {tasks.length > 0 ? (
                <ul className="space-y-2">
                  {tasks.map((task) => {
                    const isOverdue = task.dueDate !== undefined && task.dueDate < today;
                    return (
                      <li key={task.id} className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700">{task.title}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-[11px] text-gray-400">{task.phase}</span>
                            {task.dueDate && (
                              <span className={`text-[11px] ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                                Due {formatDateShort(task.dueDate)}
                              </span>
                            )}
                            {task.source === 'user' && (
                              <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">
                                My task
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${statusStyle[task.status]}`}>
                          {statusLabel[task.status]}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 italic py-4">No upcoming tasks</p>
              )}
            </div>
          </div>

          {/* Automated Activities */}
          {aiActivities.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900">Automated Activities</h3>
                <span className="text-[10px] font-semibold bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full">
                  AI
                </span>
              </div>
              <div className="px-5 py-3 max-h-[300px] overflow-y-auto">
                <ul className="space-y-3">
                  {aiActivities.map((item) => (
                    <li key={item.id} className="flex items-start gap-3">
                      <span className="flex-shrink-0 text-base mt-0.5">{actionTypeIcons[item.actionType]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700">{item.description}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          To: <span className="font-medium">{item.recipient}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Triggered by: {item.triggerSummary}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                            {item.phase}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDateShort(item.scheduledDate)}
                          </span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${automatedStatusStyle[item.status]}`}>
                            {automatedStatusLabel[item.status]}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedActivity && (
        <ActivityModal activity={selectedActivity} onClose={() => setSelectedActivity(null)} />
      )}
      {callContact && (
        <SoftPhoneModal
          contact={callContact}
          allContacts={allContacts}
          onClose={() => setCallContact(null)}
        />
      )}
    </>
  );
}
