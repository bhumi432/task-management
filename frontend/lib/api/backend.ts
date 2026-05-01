import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/lib/auth/cookies';

export type BackendFetchInit = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
};

export async function backendFetch(path: string, init: BackendFetchInit = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;

  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {})
    }
  });

  return res;
}

