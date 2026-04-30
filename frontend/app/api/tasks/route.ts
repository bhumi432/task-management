import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const qs = url.searchParams.toString();
  const path = qs ? `/tasks?${qs}` : '/tasks';

  const res = await backendFetch(path, { method: 'GET' });
  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const res = await backendFetch('/tasks', { method: 'POST', body: JSON.stringify(body) });
  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}

