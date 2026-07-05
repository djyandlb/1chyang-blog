// src/api/posts/[id].ts — 单篇文章 CRUD
import type { APIContext } from 'astro';
import { getPostBySlug, updatePost, deletePost } from '../../../lib/posts';

export const prerender = false;

// GET 为公开访问
export async function GET({ params }: APIContext) {
  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: '缺少文章标识' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const post = await getPostBySlug(id);
  if (!post) {
    return new Response(JSON.stringify({ error: '文章不存在' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response(JSON.stringify(post), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function PUT({ params, request }: APIContext) {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: '缺少文章 ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { title, slug, date, tags, excerpt, published, content } = body;

    const updated = await updatePost(id, { title, slug, date, tags, excerpt, published }, content);

    if (!updated) {
      return new Response(JSON.stringify({ error: '文章不存在' }), {
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
    return new Response(JSON.stringify({ error: '缺少文章 ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const success = await deletePost(id);
  if (!success) {
    return new Response(JSON.stringify({ error: '文章不存在' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
