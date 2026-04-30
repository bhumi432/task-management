import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend';

export async function GET() {
  const res = await backendFetch('/projects', { method: 'GET' });
  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const res = await backendFetch('/projects', {
    method: 'POST',
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}

