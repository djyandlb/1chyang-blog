// src/lib/fileStore.ts — 文件存储（JSON base64，兼容 Netlify Serverless）
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.resolve('data');
const STORE_FILE = path.join(DATA_DIR, 'uploads.json');

interface StoredFile {
  filename: string;
  originalName: string;
  data: string; // base64
  mimeType: string;
}

function readStore(): Record<string, StoredFile> {
  if (!fs.existsSync(STORE_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, StoredFile>): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

/** 存储文件 */
export function saveFile(filename: string, originalName: string, buffer: Buffer, mimeType: string): void {
  const store = readStore();
  store[filename] = {
    filename,
    originalName,
    data: buffer.toString('base64'),
    mimeType,
  };
  writeStore(store);
}

/** 获取文件 */
export function getFile(filename: string): StoredFile | null {
  const store = readStore();
  return store[filename] || null;
}

/** 删除文件 */
export function deleteFile(filename: string): boolean {
  const store = readStore();
  if (!store[filename]) return false;
  delete store[filename];
  writeStore(store);
  return true;
}
