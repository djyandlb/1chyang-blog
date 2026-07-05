// src/pages/api/works/index.ts — 作品列表/创建 API
import type { APIContext } from 'astro';
import { getAllWorks, createWork, type WorkMeta } from '../../../lib/works';

export const prerender = false;

export async function GET() {
  const works = getAllWorks();
  return new Response(JSON.stringify(works), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST({ request }: APIContext) {
  try {
    const body = await request.json();
    const { title, description, url, icon, tags } = body;

    if (!title) {
      return new Response(JSON.stringify({ error: '标题为必填项' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const work = createWork({
      title,
      description: description || '',
      url: url || '',
      icon: icon || '📦',
      tags: tags || [],
    });

    return new Response(JSON.stringify(work), {
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
