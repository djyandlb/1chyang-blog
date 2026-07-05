// src/pages/api/works/[id].ts — 单个作品 CRUD
import type { APIContext } from 'astro';
import { getWorkById, updateWork, deleteWork } from '../../../lib/works';

export const prerender = false;

export async function GET({ params }: APIContext) {
  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: '缺少作品 ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const work = await getWorkById(id);
  if (!work) {
    return new Response(JSON.stringify({ error: '作品不存在' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response(JSON.stringify(work), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function PUT({ params, request }: APIContext) {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: '缺少作品 ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { title, description, url, icon, tags, fileUrl, fileName } = body;

    const updated = await updateWork(id, { title, description, url, icon, tags, fileUrl, fileName });

    if (!updated) {
      return new Response(JSON.stringify({ error: '作品不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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

export async function DELETE({ params }: APIContext) {
  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: '缺少作品 ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const success = await deleteWork(id);
  if (!success) {
    return new Response(JSON.stringify({ error: '作品不存在' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
