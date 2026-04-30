'use client';

import { useEffect, useMemo, useState } from 'react';

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  dueDate?: string | null;
  assignedToId?: string | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
};

function normalizeErrorMessage(err: unknown) {
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'message' in err) return String((err as any).message);
  return 'Something went wrong';
}

export function TasksClient({ initial }: { initial: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [filterProjectId, setFilterProjectId] = useState('');
  const [filterAssignedToId, setFilterAssignedToId] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | ''>('');
  const [filterOverdue, setFilterOverdue] = useState(false);

  const canCreate = useMemo(() => projectId.trim().length > 0 && title.trim().length >= 2, [projectId, title]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterProjectId.trim()) params.set('projectId', filterProjectId.trim());
      if (filterAssignedToId.trim()) params.set('assignedToId', filterAssignedToId.trim());
      if (filterStatus) params.set('status', filterStatus);
      if (filterOverdue) params.set('overdue', 'true');

      const qs = params.toString();
      const res = await fetch(qs ? `/api/tasks?${qs}` : '/api/tasks', { cache: 'no-store' });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message ?? 'Failed to load tasks');
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(normalizeErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createTask() {
    if (!canCreate) return;
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        projectId: projectId.trim(),
        title,
        description: description || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined
      };

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message ?? 'Task creation failed');

      setTitle('');
      setDescription('');
      setDueDate('');
      await refresh();
    } catch (e) {
      setError(normalizeErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(taskId: string, status: TaskStatus) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message ?? 'Failed to update status');
      await refresh();
    } catch (e) {
      setError(normalizeErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  async function assign(taskId: string, assignedToId: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tasks/${taskId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedToId: assignedToId.trim() || null })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message ?? 'Failed to assign task');
      await refresh();
    } catch (e) {
      setError(normalizeErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black">
        <div className="text-sm font-medium">Create task</div>
        <div className="mt-3 grid gap-3">
          <input
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 dark:border-white/15 dark:focus:ring-white/20"
            placeholder="Project ID"
          />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 dark:border-white/15 dark:focus:ring-white/20"
            placeholder="Title"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-24 w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 dark:border-white/15 dark:focus:ring-white/20"
            placeholder="Description (optional)"
          />
          <input
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            type="datetime-local"
            className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 dark:border-white/15 dark:focus:ring-white/20"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={loading || !canCreate}
              onClick={() => void createTask()}
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Create
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => void refresh()}
              className="rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-60 dark:border-white/15 dark:bg-black dark:hover:bg-zinc-900"
            >
              Refresh
            </button>
          </div>
          {error ? <div className="text-sm text-red-600 dark:text-red-300">{error}</div> : null}
        </div>
      </div>

      <div className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black">
        <div className="text-sm font-medium">Filters</div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            value={filterProjectId}
            onChange={(e) => setFilterProjectId(e.target.value)}
            className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 dark:border-white/15 dark:focus:ring-white/20"
            placeholder="projectId"
          />
          <input
            value={filterAssignedToId}
            onChange={(e) => setFilterAssignedToId(e.target.value)}
            className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 dark:border-white/15 dark:focus:ring-white/20"
            placeholder="assignedToId"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none dark:border-white/15"
          >
            <option value="">status (any)</option>
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="DONE">DONE</option>
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filterOverdue}
              onChange={(e) => setFilterOverdue(e.target.checked)}
            />
            Overdue
          </label>
          <div className="md:col-span-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => void refresh()}
              className="rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-60 dark:border-white/15 dark:bg-black dark:hover:bg-zinc-900"
            >
              Apply filters
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Tasks</div>
          <div className="text-xs text-zinc-600 dark:text-zinc-300">
            {loading ? 'Loading…' : `${tasks.length} task(s)`}
          </div>
        </div>

        <div className="mt-3 grid gap-3">
          {tasks.length === 0 ? (
            <div className="text-sm text-zinc-600 dark:text-zinc-300">No tasks.</div>
          ) : (
            tasks.map((t) => (
              <div key={t.id} className="rounded-md border border-black/10 p-3 dark:border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium">{t.title}</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-300">{t.status}</div>
                </div>
                {t.description ? (
                  <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{t.description}</div>
                ) : null}
                <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  projectId: {t.projectId} · assignedToId: {t.assignedToId ?? '—'} · due:{' '}
                  {t.dueDate ? new Date(t.dueDate).toLocaleString() : '—'}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void updateStatus(t.id, 'TODO')}
                    className="rounded-md border border-black/10 bg-white px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 disabled:opacity-60 dark:border-white/15 dark:bg-black dark:hover:bg-zinc-900"
                  >
                    TODO
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void updateStatus(t.id, 'IN_PROGRESS')}
                    className="rounded-md border border-black/10 bg-white px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 disabled:opacity-60 dark:border-white/15 dark:bg-black dark:hover:bg-zinc-900"
                  >
                    IN_PROGRESS
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void updateStatus(t.id, 'DONE')}
                    className="rounded-md border border-black/10 bg-white px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 disabled:opacity-60 dark:border-white/15 dark:bg-black dark:hover:bg-zinc-900"
                  >
                    DONE
                  </button>

                  <input
                    defaultValue={t.assignedToId ?? ''}
                    placeholder="assignee userId"
                    className="min-w-56 flex-1 rounded-md border border-black/10 bg-transparent px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-black/20 dark:border-white/15 dark:focus:ring-white/20"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        void assign(t.id, (e.target as HTMLInputElement).value);
                      }
                    }}
                    onBlur={(e) => void assign(t.id, e.target.value)}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

