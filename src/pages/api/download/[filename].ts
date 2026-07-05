// src/pages/api/download/[filename].ts — 文件下载
import type { APIContext } from 'astro';
import { getFile } from '../../../lib/fileStore';

export const prerender = false;

export async function GET({ params }: APIContext) {
  const { filename } = params;
  if (!filename) {
    return new Response('Missing filename', { status: 400 });
  }

  const file = await getFile(filename);
  if (!file) {
    return new Response('File not found', { status: 404 });
  }

  const buffer = Buffer.from(file.data, 'base64');
  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(file.originalName)}"`,
      'Content-Length': String(buffer.length),
    },
  });
}
