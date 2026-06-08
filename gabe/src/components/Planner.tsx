import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { projects, PROJECT_PHASES } from '../data/projects';
import { phaseDetails, TaskStatus } from '../data/phase-details';
import AppShell from './AppShell';
import { useAuth } from '../auth/AuthContext';
import { canAccessProject } from '../data/roles';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlannerTask {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate: string | undefined;
  projectId: string;
  phase: string;
  source: 'mock' | 'user';
}

type KanbanColumn = 'backlog' | 'todo' | 'in_progress' | 'done';

const COLUMNS: { id: KanbanColumn; label: string; emptyText: string }[] = [
  { id: 'backlog',     label: 'Backlog',      emptyText: 'No backlog items' },
  { id: 'todo',        label: 'To Do',        emptyText: 'Nothing scheduled' },
  { id: 'in_progress', label: 'In Progress',  emptyText: 'Nothing in progress' },
  { id: 'done',        label: 'Done',         emptyText: 'No completed tasks' },
];

const columnHeaderStyle: Record<KanbanColumn, string> = {
  backlog:     'bg-gray-100 text-gray-500',
  todo:        'bg-blue-50 text-blue-600',
  in_progress: 'bg-amber-50 text-amber-600',
  done:        'bg-green-50 text-green-600',
};

const columnDotStyle: Record<KanbanColumn, string> = {
  backlog:     'bg-gray-400',
  todo:        'bg-blue-500',
  in_progress: 'bg-amber-500',
  done:        'bg-green-500',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
  });
}

function toKanbanColumn(task: PlannerTask): KanbanColumn {
  if (task.status === 'done') return 'done';
  if (task.status === 'in_progress') return 'in_progress';
  // not_started: has a due date → TODO, no due date → Backlog
  return task.dueDate ? 'todo' : 'backlog';
}

// ─── Data loading ─────────────────────────────────────────────────────────────

function loadTasksForProject(projectId: string): PlannerTask[] {
  const tasks: PlannerTask[] = [];
  const projectPhases = phaseDetails[projectId] || {};

  for (const phase of PROJECT_PHASES) {
    const detail = projectPhases[phase];

    if (detail) {
      for (const t of detail.tasks) {
        tasks.push({
          id: t.id,
          title: t.title,
          status: t.status,
          dueDate: t.dueDate,
          projectId,
          phase,
          source: 'mock',
        });
      }
    }

    const storageKey = `propdev:${projectId}:${phase}:todos`;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const todos: { id: string; text: string; completed: boolean; dueDate: string }[] = JSON.parse(stored);
        for (const todo of todos) {
          tasks.push({
            id: todo.id,
            title: todo.text,
            status: todo.completed ? 'done' : 'not_started',
            dueDate: todo.dueDate || undefined,
            projectId,
            phase,
            source: 'user',
          });
        }
      }
    } catch {
      // ignore malformed localStorage
    }
  }

  return tasks;
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({ task }: { task: PlannerTask }) {
  const today = getToday();
  const isOverdue = task.status !== 'done' && !!task.dueDate && task.dueDate < today;

  return (
    <div className={`bg-white rounded-lg border shadow-sm px-3 py-2.5 ${isOverdue ? 'border-red-200' : 'border-gray-200'}`}>
      <p className="text-sm text-gray-800 font-medium leading-snug">{task.title}</p>
      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
        <span className="text-[11px] text-gray-400">{task.phase}</span>
        {task.dueDate && (
          <span className={`text-[11px] ${isOverdue ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
            {isOverdue ? 'Overdue · ' : 'Due '}{formatDateShort(task.dueDate)}
          </span>
        )}
        {task.source === 'user' && (
          <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">
            My task
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Swimlanes ────────────────────────────────────────────────────────────────

const SWIMLANES: { id: string; label: string; icon: string; phases: string[] }[] = [
  { id: 'permit',       label: 'Permit',       icon: '🏛️', phases: ['Planning Permit'] },
  { id: 'construction', label: 'Construction', icon: '🏗️', phases: ['Construction'] },
];

function buildColumns(tasks: PlannerTask[]): Record<KanbanColumn, PlannerTask[]> {
  const map: Record<KanbanColumn, PlannerTask[]> = {
    backlog: [], todo: [], in_progress: [], done: [],
  };
  for (const task of tasks) {
    map[toKanbanColumn(task)].push(task);
  }
  const today = getToday();
  const sortFn = (a: PlannerTask, b: PlannerTask) => {
    const aOverdue = a.dueDate && a.dueDate < today ? 1 : 0;
    const bOverdue = b.dueDate && b.dueDate < today ? 1 : 0;
    if (bOverdue !== aOverdue) return bOverdue - aOverdue;
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    return 0;
  };
  for (const col of COLUMNS) map[col.id].sort(sortFn);
  return map;
}

// ─── Kanban Board ─────────────────────────────────────────────────────────────

function KanbanBoard({ projectId }: { projectId: string }) {
  const allTasks = useMemo(() => loadTasksForProject(projectId), [projectId]);

  const swimlaneData = useMemo(() =>
    SWIMLANES.map((lane) => {
      const tasks = allTasks.filter((t) => lane.phases.includes(t.phase));
      return { lane, columns: buildColumns(tasks), totalTasks: tasks.length };
    }),
  [allTasks]);

  // Column width in px — used to ensure header + card rows stay aligned
  const COL_W = 'w-64';

  return (
    <div className="overflow-x-auto pb-6">
      <div className="inline-block min-w-full">

        {/* Shared column headers */}
        <div className="flex gap-3 mb-3 pl-36">
          {COLUMNS.map((col) => (
            <div key={col.id} className={`${COL_W} flex-shrink-0`}>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${columnHeaderStyle[col.id]}`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${columnDotStyle[col.id]}`} />
                <span className="text-sm font-semibold">{col.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Swimlane rows */}
        <div className="space-y-3">
          {swimlaneData.map(({ lane, columns, totalTasks }) => (
            <div key={lane.id} className="flex gap-3 items-start">

              {/* Swimlane label */}
              <div className="w-32 flex-shrink-0 pt-2 pr-3">
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base leading-none">{lane.icon}</span>
                    <span className="text-sm font-semibold text-gray-700">{lane.label}</span>
                  </div>
                  <span className="text-xs text-gray-400">{totalTasks} tasks</span>
                </div>
              </div>

              {/* Columns for this swimlane */}
              {COLUMNS.map((col) => {
                const colTasks = columns[col.id];
                return (
                  <div key={col.id} className={`${COL_W} flex-shrink-0`}>
                    <div className="bg-gray-100 rounded-xl border border-gray-200 p-2 space-y-2 min-h-[100px]">
                      {colTasks.length === 0 ? (
                        <p className="text-xs text-gray-400 italic text-center py-6">{col.emptyText}</p>
                      ) : (
                        colTasks.map((task) => <TaskCard key={task.id} task={task} />)
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Planner() {
  const { user } = useAuth();
  const visibleProjects = projects.filter((p) => canAccessProject(user, p.id));
  const [activeProjectId, setActiveProjectId] = useState(
    visibleProjects[0]?.id ?? ''
  );

  const activeProject = visibleProjects.find((p) => p.id === activeProjectId);

  if (visibleProjects.length === 0 || !activeProject) {
    return (
      <AppShell title="Planner" subtitle="Tasks & payments across your projects">
        <p className="text-sm text-gray-500">No projects available.</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Planner" subtitle="Tasks & payments across your projects">
      {/* Project tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-1 overflow-x-auto">
          {visibleProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => setActiveProjectId(project.id)}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeProjectId === project.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{project.name}</span>
                <span className={`ml-2 text-xs ${activeProjectId === project.id ? 'text-blue-400' : 'text-gray-400'}`}>
                  {project.suburb}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Project link */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {activeProject.type} · {activeProject.suburb}, {activeProject.state}
          </p>
          <Link
            to={`/project/${activeProjectId}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Open project
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </Link>
        </div>

        {/* Kanban board */}
        <KanbanBoard projectId={activeProjectId} />
    </AppShell>
  );
}
