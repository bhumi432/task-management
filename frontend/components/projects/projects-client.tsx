'use client';

import { useEffect, useMemo, useState } from 'react';

type Project = {
  id: string;
  name: string;
  description?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
};

type DirectoryUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

function normalizeErrorMessage(err: unknown) {
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'message' in err) return String((err as any).message);
  return 'Something went wrong';
}

export function ProjectsClient({ initial }: { initial: Project[] }) {
  const [projects, setProjects] = useState<Project[]>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [directoryUsers, setDirectoryUsers] = useState<DirectoryUser[] | null>(null);
  const [directoryLoading, setDirectoryLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [memberPickByProject, setMemberPickByProject] = useState<Record<string, string>>({});
  const [memberMessage, setMemberMessage] = useState<string | null>(null);
  const [memberError, setMemberError] = useState<string | null>(null);

  const canSubmit = useMemo(() => name.trim().length >= 2 && name.trim().length <= 120, [name]);
  const showAdminDirectory = directoryUsers !== null;

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/projects', { cache: 'no-store' });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message ?? 'Failed to load projects');
      setProjects(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(normalizeErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  async function loadDirectory() {
    setDirectoryLoading(true);
    try {
      const res = await fetch('/api/users', { cache: 'no-store' });
      const data = await res.json().catch(() => null);
      if (res.status === 403) {
        setDirectoryUsers(null);
        return;
      }
      if (!res.ok) {
        setDirectoryUsers(null);
        return;
      }
      setDirectoryUsers(Array.isArray(data) ? data : []);
    } finally {
      setDirectoryLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    void loadDirectory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function copyId(id: string) {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setCopiedId(null);
    }
  }

  async function createProject() {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: description || undefined })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message ?? 'Project creation failed (ADMIN only)');

      setName('');
      setDescription('');
      await refresh();
    } catch (e) {
      setError(normalizeErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  async function addMember(projectId: string) {
    const userId = memberPickByProject[projectId]?.trim();
    if (!userId) return;
    setLoading(true);
    setMemberError(null);
    setMemberMessage(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message ?? 'Could not add member');
      setMemberMessage('Member added to the project.');
      await refresh();
    } catch (e) {
      setMemberError(normalizeErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black">
        <div className="text-sm font-medium">Create project (ADMIN)</div>
        <div className="mt-3 grid gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 dark:border-white/15 dark:focus:ring-white/20"
            placeholder="Project name"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-24 w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 dark:border-white/15 dark:focus:ring-white/20"
            placeholder="Description (optional)"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={loading || !canSubmit}
              onClick={() => void createProject()}
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
          {error ? (
            <div className="text-sm text-red-600 dark:text-red-300">{error}</div>
          ) : null}
        </div>
      </div>

      {showAdminDirectory ? (
        <div className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-sm font-medium">People (ADMIN)</div>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                Copy a user&apos;s ID to use elsewhere, or pick someone below to add them to a project.
              </p>
            </div>
            <button
              type="button"
              disabled={directoryLoading}
              onClick={() => void loadDirectory()}
              className="shrink-0 rounded-md border border-black/10 bg-white px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 disabled:opacity-60 dark:border-white/15 dark:bg-black dark:hover:bg-zinc-900"
            >
              Reload list
            </button>
          </div>

          {directoryLoading ? (
            <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">Loading people…</div>
          ) : directoryUsers!.length === 0 ? (
            <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">No users yet.</div>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10 dark:border-white/10">
                    <th className="py-2 pr-3 font-medium">Name</th>
                    <th className="py-2 pr-3 font-medium">Email</th>
                    <th className="py-2 pr-3 font-medium">Role</th>
                    <th className="py-2 pr-3 font-medium">User ID</th>
                    <th className="py-2 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {directoryUsers!.map((u) => (
                    <tr key={u.id} className="border-b border-black/5 dark:border-white/5">
                      <td className="py-2 pr-3 align-top">{u.name}</td>
                      <td className="py-2 pr-3 align-top">{u.email}</td>
                      <td className="py-2 pr-3 align-top">{u.role}</td>
                      <td className="max-w-[12rem] truncate py-2 pr-3 align-top font-mono text-xs text-zinc-600 dark:text-zinc-400">
                        {u.id}
                      </td>
                      <td className="py-2 align-top">
                        <button
                          type="button"
                          onClick={() => void copyId(u.id)}
                          className="rounded-md border border-black/10 bg-white px-2 py-1 text-xs font-medium hover:bg-zinc-50 dark:border-white/15 dark:bg-black dark:hover:bg-zinc-900"
                        >
                          {copiedId === u.id ? 'Copied' : 'Copy ID'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}

      {!showAdminDirectory && !directoryLoading ? (
        <div className="rounded-lg border border-dashed border-black/15 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-white/15 dark:bg-zinc-950 dark:text-zinc-400">
          Member directory is only visible to <span className="font-medium">ADMIN</span> accounts. Log in as an admin to
          see user IDs and add people to projects from this page.
        </div>
      ) : null}

      <div className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Your projects</div>
          <div className="text-xs text-zinc-600 dark:text-zinc-300">
            {loading ? 'Loading…' : `${projects.length} project(s)`}
          </div>
        </div>

        {memberMessage ? (
          <div className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">{memberMessage}</div>
        ) : null}
        {memberError ? (
          <div className="mt-2 text-sm text-red-600 dark:text-red-300">{memberError}</div>
        ) : null}

        <div className="mt-3 grid gap-3">
          {projects.length === 0 ? (
            <div className="text-sm text-zinc-600 dark:text-zinc-300">No projects yet.</div>
          ) : (
            projects.map((p) => (
              <div
                key={p.id}
                className="rounded-md border border-black/10 p-3 dark:border-white/10"
              >
                <div className="font-medium">{p.name}</div>
                {p.description ? (
                  <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{p.description}</div>
                ) : null}
                <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">id: {p.id}</div>

                {showAdminDirectory && directoryUsers && directoryUsers.length > 0 ? (
                  <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-black/5 pt-3 dark:border-white/10">
                    <div className="min-w-[12rem] flex-1">
                      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Add team member</label>
                      <select
                        value={memberPickByProject[p.id] ?? ''}
                        onChange={(e) =>
                          setMemberPickByProject((prev) => ({ ...prev, [p.id]: e.target.value }))
                        }
                        className="mt-1 w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none dark:border-white/15"
                      >
                        <option value="">Choose a user…</option>
                        {directoryUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.email} — {u.role}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      disabled={loading || !(memberPickByProject[p.id] ?? '').trim()}
                      onClick={() => void addMember(p.id)}
                      className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                    >
                      Add to project
                    </button>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
