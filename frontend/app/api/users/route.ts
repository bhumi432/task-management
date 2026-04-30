import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend';

export async function GET() {
  const res = await backendFetch('/users', { method: 'GET' });
  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}
