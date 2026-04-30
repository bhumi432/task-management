import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Team Task Manager</h1>
      <p className="max-w-2xl text-zinc-600 dark:text-zinc-300">
        App Router scaffold with auth routes, dashboard, projects and tasks.
      </p>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/login"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-white/15 dark:bg-black dark:hover:bg-zinc-900"
        >
          Sign up
        </Link>
        <Link
          href="/dashboard"
          className="rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-white/15 dark:bg-black dark:hover:bg-zinc-900"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
