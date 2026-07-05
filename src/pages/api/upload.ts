// src/pages/api/upload.ts — 文件上传（JSON base64 存储，兼容 Netlify）
import type { APIContext } from 'astro';
import { saveFile } from '../../lib/fileStore';

export const prerender = false;

export async function POST({ request }: APIContext) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: '未收到文件' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 最大 50MB（base64 存储限制）
    if (file.size > 50 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: '文件大小不能超过 50MB' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ext = file.name.split('.').pop() || 'file';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await saveFile(filename, file.name, buffer, file.type || 'application/octet-stream');

    return new Response(JSON.stringify({
      url: `/api/download/${filename}`,
      filename,
      originalName: file.name,
      size: file.size,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Upload error:', err);
    return new Response(JSON.stringify({ error: '上传失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
