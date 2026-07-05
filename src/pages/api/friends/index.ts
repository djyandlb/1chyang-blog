// src/pages/api/friends/index.ts — 友链 API
import type { APIContext } from 'astro';
import { getAllFriends, createFriend } from '../../../lib/friends';

export const prerender = false;

export async function GET() {
  return new Response(JSON.stringify(getAllFriends()), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST({ request }: APIContext) {
  try {
    const body = await request.json();
    const { name, url, description } = body;
    if (!name || !url) {
      return new Response(JSON.stringify({ error: '名称和 URL 为必填项' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const friend = createFriend({ name, url, description: description || '' });
    return new Response(JSON.stringify(friend), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: '创建失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
