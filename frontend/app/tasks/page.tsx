import { TasksClient } from '@/components/tasks/tasks-client';
import { fetchFromApp } from '@/lib/api/server-app-fetch';

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

async function getTasks(): Promise<Task[]> {
  const res = await fetchFromApp('/api/tasks');
  const data = await res.json().catch(() => []);
  return Array.isArray(data) ? data : [];
}

export default async function TasksPage() {
  const initial = await getTasks();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">
        Create, assign, update status, and filter tasks within your projects.
      </p>

      <TasksClient initial={initial} />
    </div>
  );
}

