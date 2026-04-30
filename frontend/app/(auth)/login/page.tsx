'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(72)
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultValues = useMemo<FormValues>(() => ({ email: '', password: '' }), []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setServerError(data?.message ?? 'Login failed');
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">Welcome back.</p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-lg border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-black"
      >
        {serverError ? (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">
            {serverError}
          </div>
        ) : null}

        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 dark:border-white/15 dark:focus:ring-white/20"
            placeholder="you@company.com"
            {...register('email')}
          />
          {errors.email ? (
            <div className="text-xs text-red-600 dark:text-red-300">{errors.email.message}</div>
          ) : null}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 dark:border-white/15 dark:focus:ring-white/20"
            placeholder="••••••••"
            {...register('password')}
          />
          {errors.password ? (
            <div className="text-xs text-red-600 dark:text-red-300">{errors.password.message}</div>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="text-sm text-zinc-600 dark:text-zinc-300">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium text-black dark:text-white">
          Sign up
        </Link>
      </div>
    </div>
  );
}

