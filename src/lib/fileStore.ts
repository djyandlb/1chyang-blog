// src/lib/fileStore.ts — 文件存储
// 开发环境: 本地 JSON 文件
// 生产环境 (Netlify): Netlify Blobs（持久存储）
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const isNetlify = !!process.env.NETLIFY;
const STORE_NAME = 'blog-uploads';

interface StoredFile {
  filename: string;
  originalName: string;
  data: string; // base64
  mimeType: string;
}

// 本地文件路径（仅 dev 用）
function getLocalFile(): string {
  return path.join(process.cwd(), 'data', 'uploads.json');
}

function readLocalStore(): Record<string, StoredFile> {
  const file = getLocalFile();
  if (!fs.existsSync(file)) return {};
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); } catch { return {}; }
}

function writeLocalStore(store: Record<string, StoredFile>): void {
  const file = getLocalFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(store, null, 2), 'utf-8');
}

/** 存储文件 */
export async function saveFile(filename: string, originalName: string, buffer: Buffer, mimeType: string): Promise<void> {
  if (isNetlify) {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore(STORE_NAME);
    await store.set(filename, buffer, { metadata: { originalName, mimeType } });
  } else {
    const store = readLocalStore();
    store[filename] = { filename, originalName, data: buffer.toString('base64'), mimeType };
    writeLocalStore(store);
  }
}

/** 获取文件 */
export async function getFile(filename: string): Promise<StoredFile | null> {
  if (isNetlify) {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore(STORE_NAME);
    const blob = await store.get(filename, { type: 'arrayBuffer' });
    if (!blob) return null;
    const meta = await store.getMetadata(filename);
    const buffer = Buffer.from(blob);
    return {
      filename,
      originalName: meta?.metadata?.originalName || filename,
      data: buffer.toString('base64'),
      mimeType: meta?.metadata?.mimeType || 'application/octet-stream',
    };
  } else {
    const store = readLocalStore();
    return store[filename] || null;
  }
}

/** 删除文件 */
export async function deleteFile(filename: string): Promise<boolean> {
  if (isNetlify) {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore(STORE_NAME);
    await store.delete(filename);
    return true;
  } else {
    const store = readLocalStore();
    if (!store[filename]) return false;
    delete store[filename];
    writeLocalStore(store);
    return true;
  }
}
