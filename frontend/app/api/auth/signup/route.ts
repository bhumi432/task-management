import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, DEFAULT_COOKIE_OPTIONS } from '@/lib/auth/cookies';

type SignupBody = { name: string; email: string; password: string };

export async function POST(req: Request) {
  const body = (await req.json()) as SignupBody;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json(
      { message: data?.message ?? 'Signup failed' },
      { status: res.status }
    );
  }

  const token = data?.accessToken as string | undefined;
  if (!token) {
    return NextResponse.json({ message: 'Invalid signup response' }, { status: 502 });
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, DEFAULT_COOKIE_OPTIONS);

  return NextResponse.json({ user: data?.user ?? null });
}

