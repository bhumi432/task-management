import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend';

export async function DELETE(_req: Request, ctx: { params: Promise<{ projectId: string; userId: string }> }) {
  const { projectId, userId } = await ctx.params;

  const res = await backendFetch(`/projects/${projectId}/members/${userId}`, {
    method: 'DELETE'
  });

  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}

