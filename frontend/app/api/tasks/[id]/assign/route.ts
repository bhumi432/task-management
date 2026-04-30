import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend';

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  const res = await backendFetch(`/tasks/${id}/assign`, {
    method: 'PATCH',
    body: JSON.stringify(body)
  });

  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}

