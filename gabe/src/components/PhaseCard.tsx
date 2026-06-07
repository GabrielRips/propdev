import React, { useState, useEffect, useRef } from 'react';
import { Activity, PhaseDetail, TaskStatus } from '../data/phase-details';
import ActivityModal from './ActivityModal';

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

const activityIcons: Record<string, { icon: string; label: string }> = {
  email_in: { icon: '📩', label: 'Email from' },
  email_out: { icon: '📤', label: 'Email to' },
  phone_in: { icon: '📞', label: 'Phone call from' },
  phone_out: { icon: '📱', label: 'Phone call to' },
  sms_in: { icon: '💬', label: 'SMS from' },
  sms_out: { icon: '💬', label: 'SMS to' },
};

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate: string; // ISO date string e.g. '2026-03-01'
}

function defaultDueDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

function useTodos(storageKey: string) {
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(todos));
  }, [storageKey, todos]);

  const addTodo = (text: string) => {
    setTodos((prev) => [{ id: `todo-${Date.now()}`, text, completed: false, dueDate: defaultDueDate() }, ...prev]);
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTodoDueDate = (id: string, dueDate: string) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, dueDate } : t)));
  };

  return { todos, addTodo, toggleTodo, deleteTodo, updateTodoDueDate };
}

interface NoteItem {
  id: string;
  text: string;
  createdAt: string;
}

function useNotes(storageKey: string) {
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(notes));
  }, [storageKey, notes]);

  const addNote = (text: string) => {
    setNotes((prev) => [{ id: `note-${Date.now()}`, text, createdAt: new Date().toISOString() }, ...prev]);
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return { notes, addNote, deleteNote };
}

interface PhaseCardProps {
  projectId: string;
  phase: string;
  progress: number;
  detail: PhaseDetail | undefined;
}

export default function PhaseCard({ projectId, phase, progress, detail }: PhaseCardProps) {
  const done = progress === 100;
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [newTodoText, setNewTodoText] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [tasksExpanded, setTasksExpanded] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const todoInputRef = useRef<HTMLInputElement>(null);

  const storagePrefix = `propdev:${projectId}:${phase}`;
  const { todos, addTodo, toggleTodo, deleteTodo, updateTodoDueDate } = useTodos(`${storagePrefix}:todos`);
  const { notes, addNote, deleteNote } = useNotes(`${storagePrefix}:notes`);

  const handleAddTodo = () => {
    const trimmed = newTodoText.trim();
    if (!trimmed) return;
    addTodo(trimmed);
    setNewTodoText('');
    todoInputRef.current?.focus();
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{phase}</h3>
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                done
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {done ? 'Complete' : `${progress}%`}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${
                done ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Tasks */}
        <div className="border-t border-gray-100">
          {(() => {
            const mockDone = detail ? detail.tasks.filter((t) => t.status === 'done').length : 0;
            const todoDone = todos.filter((t) => t.completed).length;
            const completedCount = mockDone + todoDone;
            const totalCount = (detail ? detail.tasks.length : 0) + todos.length;
            return (
              <button
                onClick={() => setTasksExpanded(!tasksExpanded)}
                className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  Tasks
                  {totalCount > 0 && (
                    <span className={`rounded-full px-1.5 py-0.5 text-xs normal-case font-medium ${
                      completedCount === totalCount
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {completedCount}/{totalCount}
                    </span>
                  )}
                </h4>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${tasksExpanded ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            );
          })()}

          {tasksExpanded && (
            <div className="px-5 pb-4">
              <ul className="space-y-2">
                {/* Mock data tasks */}
                {detail && detail.tasks.map((task) => (
                  <li key={task.id} className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-sm ${
                          task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-700'
                        }`}
                      >
                        {task.title}
                      </span>
                      {task.dueDate && (
                        <span className={`text-xs ml-2 ${
                          task.status !== 'done' && task.dueDate < new Date().toISOString().slice(0, 10)
                            ? 'text-red-500'
                            : 'text-gray-400'
                        }`}>
                          Due {new Date(task.dueDate + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${statusStyle[task.status]}`}
                    >
                      {statusLabel[task.status]}
                    </span>
                  </li>
                ))}

                {/* User-added tasks */}
                {todos.map((todo) => (
                  <li key={todo.id} className="flex items-center justify-between gap-2 group">
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-sm ${
                          todo.completed ? 'text-gray-400 line-through' : 'text-gray-700'
                        }`}
                      >
                        {todo.text}
                      </span>
                      <input
                        type="date"
                        value={todo.dueDate || ''}
                        onChange={(e) => updateTodoDueDate(todo.id, e.target.value)}
                        className={`ml-2 text-xs border border-gray-200 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                          !todo.completed && todo.dueDate && todo.dueDate < new Date().toISOString().slice(0, 10)
                            ? 'text-red-500'
                            : 'text-gray-400'
                        }`}
                      />
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        className="flex-shrink-0"
                      >
                        {todo.completed ? (
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300 hover:border-blue-400 transition-colors" />
                        )}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Add task input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddTodo();
                }}
                className="flex gap-2 mt-3"
              >
                <input
                  ref={todoInputRef}
                  type="text"
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  placeholder="Add a task..."
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
                <button
                  type="submit"
                  disabled={!newTodoText.trim()}
                  className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                >
                  Add
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="border-t border-gray-100">
          <button
            onClick={() => setNotesExpanded(!notesExpanded)}
            className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              Notes
              {notes.length > 0 && (
                <span className="bg-gray-200 text-gray-600 rounded-full px-1.5 py-0.5 text-xs normal-case font-medium">
                  {notes.length}
                </span>
              )}
            </h4>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${notesExpanded ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {notesExpanded && (
            <div className="px-5 pb-4">
              {notes.length > 0 && (
                <ul className="space-y-2 mb-3">
                  {notes.map((note) => (
                    <li key={note.id} className="bg-gray-50 rounded-lg px-3 py-2 group relative">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap pr-5">{note.text}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(note.createdAt).toLocaleDateString('en-AU', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="absolute top-2 right-2 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete note"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Write a note..."
                rows={2}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 resize-y"
              />
              <button
                onClick={() => {
                  const trimmed = newNoteText.trim();
                  if (!trimmed) return;
                  addNote(trimmed);
                  setNewNoteText('');
                }}
                disabled={!newNoteText.trim()}
                className="mt-2 text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Save Note
              </button>
            </div>
          )}
        </div>

        {/* Activities */}
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Latest Activities
          </h4>
          {detail && detail.activities.length > 0 ? (
            <ul className="space-y-2">
              {detail.activities.map((activity) => {
                const info = activityIcons[activity.type] || { icon: '📋', label: 'Activity' };
                return (
                  <li key={activity.id}>
                    <button
                      onClick={() => setSelectedActivity(activity)}
                      className="flex items-start gap-2 text-sm w-full text-left rounded-lg p-2 -mx-2 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <span className="flex-shrink-0">{info.icon}</span>
                      <div className="min-w-0">
                        <p className="text-gray-700">
                          <span className="text-gray-400">{info.label}</span>{' '}
                          <span className="font-medium">{activity.person}</span>
                        </p>
                        <p className="text-gray-500 text-xs truncate">{activity.summary}</p>
                        <p className="text-gray-400 text-xs">
                          {new Date(activity.date).toLocaleDateString('en-AU', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 italic">No activities yet</p>
          )}
        </div>
      </div>

      {selectedActivity && (
        <ActivityModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
        />
      )}
    </>
  );
}
