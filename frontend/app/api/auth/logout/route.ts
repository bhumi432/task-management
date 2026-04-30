import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, DEFAULT_COOKIE_OPTIONS } from '@/lib/auth/cookies';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, '', { ...DEFAULT_COOKIE_OPTIONS, maxAge: 0 });
  return NextResponse.json({ ok: true });
}

