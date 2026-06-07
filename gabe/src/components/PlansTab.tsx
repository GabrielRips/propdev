import React, { useState, useMemo } from 'react';
import { PROJECT_PHASES } from '../data/projects';
import { phaseDetails, Activity, TaskStatus } from '../data/phase-details';
import { projectFiles, FileCategory, ProjectFile } from '../data/project-files';
import ActivityModal from './ActivityModal';
import FileVersionsModal from './FileVersionsModal';
import FileEmailModal from './FileEmailModal';

const FILE_CATEGORIES: FileCategory[] = ['Architectural', 'Working Drawings'];

const categoryIcons: Record<FileCategory, string> = {
  'Architectural': '🏗️',
  'Working Drawings': '📐',
  'Consultant Reports': '📊',
};

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

interface NoteItem {
  id: string;
  text: string;
  createdAt: string;
  phase: string;
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
          tasks.push({ id: todo.id, title: todo.text, status: 'not_started', dueDate: todo.dueDate || undefined, phase, source: 'user' });
        }
      }
    } catch {
      // ignore
    }
  }

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

function getAllNotes(projectId: string): NoteItem[] {
  const notes: NoteItem[] = [];
  for (const phase of PROJECT_PHASES) {
    const storageKey = `propdev:${projectId}:${phase}:notes`;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed: { id: string; text: string; createdAt: string }[] = JSON.parse(stored);
        for (const n of parsed) {
          notes.push({ ...n, phase });
        }
      }
    } catch {
      // ignore
    }
  }
  return notes.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface PlansTabProps {
  projectId: string;
}

export default function PlansTab({ projectId }: PlansTabProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<FileCategory>>(new Set());
  const [versionsFile, setVersionsFile] = useState<ProjectFile | null>(null);
  const [emailFile, setEmailFile] = useState<ProjectFile | null>(null);

  const files = projectFiles[projectId] || [];
  const activities = useMemo(() => getAllActivities(projectId), [projectId]);
  const tasks = useMemo(() => getFilteredTasks(projectId), [projectId]);
  const notes = useMemo(() => getAllNotes(projectId), [projectId]);

  const today = new Date().toISOString().slice(0, 10);

  const toggleCategory = (cat: FileCategory) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const filesByCategory = useMemo(() => {
    const map = new Map<FileCategory, typeof files>();
    for (const cat of FILE_CATEGORIES) {
      map.set(cat, files.filter((f) => f.category === cat));
    }
    return map;
  }, [files]);

  return (
    <>
      <div className="space-y-5">
        {/* Project Files */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">
              Project Files
              <span className="ml-2 text-xs font-normal text-gray-400">{files.length} files</span>
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {FILE_CATEGORIES.map((cat) => {
              const catFiles = filesByCategory.get(cat) || [];
              if (catFiles.length === 0) return null;
              const isCollapsed = collapsedCategories.has(cat);
              return (
                <div key={cat}>
                  <button
                    onClick={() => toggleCategory(cat)}
                    className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span>{categoryIcons[cat]}</span>
                      <span className="text-sm font-medium text-gray-700">{cat}</span>
                      <span className="text-xs text-gray-400">{catFiles.length}</span>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {!isCollapsed && (
                    <div className="px-5 pb-3">
                      <table className="w-full">
                        <thead>
                          <tr className="text-xs text-gray-400 uppercase tracking-wider">
                            <th className="text-left pb-2 font-medium">Name</th>
                            <th className="text-left pb-2 font-medium hidden sm:table-cell">Uploaded By</th>
                            <th className="text-left pb-2 font-medium hidden md:table-cell">Date</th>
                            <th className="text-right pb-2 font-medium"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {catFiles.map((file) => (
                            <tr key={file.id} className="text-sm">
                              <td className="py-2 text-gray-700 font-medium">{file.name}</td>
                              <td className="py-2 text-gray-500 hidden sm:table-cell">{file.uploadedBy}</td>
                              <td className="py-2 text-gray-400 hidden md:table-cell">{formatDateShort(file.date)}</td>
                              <td className="py-2 text-right">
                                <div className="inline-flex items-center gap-2">
                                  <button
                                    onClick={() => setEmailFile(file)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                                  >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                    </svg>
                                    Email
                                  </button>
                                  <button
                                    onClick={() => setVersionsFile(file)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                                  >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Versions
                                    {file.versions && file.versions.length > 0 && (
                                      <span className="ml-0.5 text-[10px] font-semibold bg-gray-200 text-gray-500 px-1 rounded-full">
                                        {file.versions.length}
                                      </span>
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Communications */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">
              Communications
              <span className="ml-2 text-xs font-normal text-gray-400">{activities.length} items</span>
            </h3>
          </div>
          <div className="px-5 py-3 max-h-[400px] overflow-y-auto">
            {activities.length > 0 ? (
              <ul className="space-y-1">
                {activities.map((activity) => {
                  const info = activityIcons[activity.type] || { icon: '📋', label: 'Activity' };
                  return (
                    <li key={activity.id}>
                      <button
                        onClick={() => setSelectedActivity(activity)}
                        className="flex items-start gap-2 text-sm w-full text-left rounded-lg p-2 hover:bg-gray-50 transition-colors cursor-pointer"
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
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 italic py-4">No communications yet</p>
            )}
          </div>
        </div>

        {/* Tasks + Notes side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Tasks */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">
                Tasks
                {tasks.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-gray-400">{tasks.length} upcoming</span>
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

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">
                Notes
                {notes.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-gray-400">{notes.length}</span>
                )}
              </h3>
            </div>
            <div className="px-5 py-3 max-h-[300px] overflow-y-auto">
              {notes.length > 0 ? (
                <ul className="space-y-2">
                  {notes.map((note) => (
                    <li key={note.id} className="bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">
                          {new Date(note.createdAt).toLocaleDateString('en-AU', {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                          {note.phase}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 italic py-4">No notes yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedActivity && (
        <ActivityModal activity={selectedActivity} onClose={() => setSelectedActivity(null)} />
      )}
      {versionsFile && (
        <FileVersionsModal file={versionsFile} onClose={() => setVersionsFile(null)} />
      )}
      {emailFile && (
        <FileEmailModal file={emailFile} onClose={() => setEmailFile(null)} />
      )}
    </>
  );
}
