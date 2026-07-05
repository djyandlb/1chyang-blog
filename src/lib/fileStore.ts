// src/lib/fileStore.ts — 文件上传存储（Netlify Blobs 持久化）
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { getStore } from '@netlify/blobs';

const STORE_NAME = 'yibuchuanyang-files';
const isNetlify = !!(process.env.NETLIFY || process.env.NETLIFY_LOCAL);

// 本地存储路径（开发环境）
const STORE_DIR = path.join(os.tmpdir(), 'yibuchuanyang-uploads');
const STORE_FILE = path.join(STORE_DIR, 'uploads.json');

export interface StoredFile {
  filename: string;
  originalName: string;
  data: string; // base64
  mimeType: string;
}

/** 本地读取 */
function readLocalStore(): Record<string, StoredFile> {
  try {
    if (!fs.existsSync(STORE_FILE)) return {};
    return JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
  } catch { return {}; }
}

/** 本地写入 */
function writeLocalStore(store: Record<string, StoredFile>): void {
  fs.mkdirSync(STORE_DIR, { recursive: true });
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

/** 从 Blobs 读取文件索引 */
async function readBlobIndex(): Promise<Record<string, StoredFile>> {
  try {
    const store = getStore(STORE_NAME);
    const raw = await store.get('__index__', { type: 'text' });
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

/** 写入文件索引到 Blobs */
async function writeBlobIndex(index: Record<string, StoredFile>): Promise<void> {
  const store = getStore(STORE_NAME);
  await store.set('__index__', JSON.stringify(index, null, 2));
}

/** 存储文件 */
export async function saveFile(filename: string, originalName: string, buffer: Buffer, mimeType: string): Promise<void> {
  if (isNetlify) {
    const store = getStore(STORE_NAME);
    const index = await readBlobIndex();
    index[filename] = { filename, originalName, data: buffer.toString('base64'), mimeType };
    // 文件内容单独存，避免 index 过大
    await store.set(`file-${filename}`, buffer.toString('base64'));
    await writeBlobIndex(index);
  } else {
    const store = readLocalStore();
    store[filename] = { filename, originalName, data: buffer.toString('base64'), mimeType };
    writeLocalStore(store);
  }
}

/** 获取文件 */
export async function getFile(filename: string): Promise<StoredFile | null> {
  if (isNetlify) {
    const store = getStore(STORE_NAME);
    const raw = await store.get(`file-${filename}`, { type: 'text' });
    if (!raw) return null;
    const index = await readBlobIndex();
    const meta = index[filename];
    return meta ? { ...meta, data: raw } : null;
  } else {
    const store = readLocalStore();
    return store[filename] || null;
  }
}

/** 删除文件 */
export async function deleteFile(filename: string): Promise<boolean> {
  if (isNetlify) {
    const index = await readBlobIndex();
    if (!index[filename]) return false;
    delete index[filename];
    const store = getStore(STORE_NAME);
    await store.delete(`file-${filename}`);
    await writeBlobIndex(index);
    return true;
  } else {
    const store = readLocalStore();
    if (!store[filename]) return false;
    delete store[filename];
    writeLocalStore(store);
    return true;
  }
}
