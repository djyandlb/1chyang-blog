// src/pages/api/upload.ts — 文件上传（任意类型）
import type { APIContext } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

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

    // 校验文件大小（最大 100MB）
    if (file.size > 100 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: '文件大小不能超过 100MB' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 生成唯一文件名，保留原始拓展名
    const ext = file.name.split('.').pop() || 'file';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const uploadDir = path.resolve('public/uploads');
    fs.mkdirSync(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(uploadDir, filename), buffer);

    return new Response(JSON.stringify({
      url: `/uploads/${filename}`,
      filename,
      originalName: file.name,
      size: file.size,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: '上传失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
