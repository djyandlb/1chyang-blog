// src/pages/api/friends/[id].ts — 单个友链 CRUD
import type { APIContext } from 'astro';
import { updateFriend, deleteFriend } from '../../../lib/friends';

export const prerender = false;

export async function PUT({ params, request }: APIContext) {
  try {
    const { id } = params;
    if (!id) return new Response(JSON.stringify({ error: '缺少 ID' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    const body = await request.json();
    const updated = await updateFriend(id, body);
    if (!updated) return new Response(JSON.stringify({ error: '不存在' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    return new Response(JSON.stringify(updated), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch {
    return new Response(JSON.stringify({ error: '更新失败' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function DELETE({ params }: APIContext) {
  const { id } = params;
  if (!id) return new Response(JSON.stringify({ error: '缺少 ID' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  const success = await deleteFriend(id);
  if (!success) return new Response(JSON.stringify({ error: '不存在' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
