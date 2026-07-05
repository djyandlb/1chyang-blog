// src/pages/api/settings.ts — 站点设置 API
import type { APIContext } from 'astro';
import { getSettings, updateSettings } from '../../lib/settings';

export const prerender = false;

export async function GET() {
  const settings = await getSettings();
  return new Response(JSON.stringify(settings), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function PUT({ request }: APIContext) {
  try {
    const body = await request.json();
    const { about, subtitle } = body;
    const updated = updateSettings({ about, subtitle });
    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: '更新失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
