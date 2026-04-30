import { ProjectsClient } from '@/components/projects/projects-client';
import { fetchFromApp } from '@/lib/api/server-app-fetch';

type Project = {
  id: string;
  name: string;
  description?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
};

async function getProjects(): Promise<Project[]> {
  const res = await fetchFromApp('/api/projects');
  const data = await res.json().catch(() => []);
  return Array.isArray(data) ? data : [];
}

export default async function ProjectsPage() {
  const initial = await getProjects();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">
        Create projects (ADMIN) and view projects you belong to.
      </p>

      <ProjectsClient initial={initial} />
    </div>
  );
}

