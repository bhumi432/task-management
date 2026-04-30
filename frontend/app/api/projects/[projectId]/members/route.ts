import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend';

export async function POST(req: Request, ctx: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  const res = await backendFetch(`/projects/${projectId}/members`, {
    method: 'POST',
    body: JSON.stringify(body)
  });

  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}

