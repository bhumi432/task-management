import { fetchFromApp } from '@/lib/api/server-app-fetch';

type Summary = {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
};

async function getSummary(): Promise<Summary | null> {
  const res = await fetchFromApp('/api/dashboard/summary');
  if (!res.ok) return null;
  return res.json();
}

export default async function DashboardPage() {
  const summary = await getSummary();

  const cards = [
    { label: 'Total', value: summary?.totalTasks },
    { label: 'Completed', value: summary?.completedTasks },
    { label: 'Pending', value: summary?.pendingTasks },
    { label: 'Overdue', value: summary?.overdueTasks }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">Summary scoped to your projects.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black"
          >
            <div className="text-sm text-zinc-600 dark:text-zinc-300">{c.label}</div>
            <div className="mt-2 text-2xl font-semibold">{c.value ?? '—'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

