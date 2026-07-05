// src/api/posts/index.ts — 文章列表 API
import type { APIContext } from 'astro';
import { getAllPosts, getAllPostsAdmin, createPost, type PostMeta } from '../../../lib/posts';

export const prerender = false;

export async function GET({ request }: APIContext) {
  const url = new URL(request.url);
  const admin = url.searchParams.get('admin') === 'true';
  const posts = admin ? getAllPostsAdmin() : getAllPosts();

  return new Response(JSON.stringify(posts), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST({ request }: APIContext) {
  try {
    const body = await request.json();
    const { title, slug, date, tags, excerpt, content, published } = body;

    if (!title || !slug || !content) {
      return new Response(JSON.stringify({ error: '标题、slug 和内容为必填项' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const meta: Omit<PostMeta, 'id'> = {
      title,
      slug,
      date: date || new Date().toISOString().slice(0, 10),
      tags: tags || [],
      excerpt: excerpt || '',
      published: published ?? true,
    };

    const post = await createPost(meta, content);

    return new Response(JSON.stringify(post), {
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
