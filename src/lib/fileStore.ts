// src/lib/fileStore.ts — 文件存储
// 所有环境都存到系统临时目录，避免 Netlify 只读文件系统问题
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const STORE_DIR = path.join(os.tmpdir(), 'yibuchuanyang-uploads');
const STORE_FILE = path.join(STORE_DIR, 'uploads.json');

interface StoredFile {
  filename: string;
  originalName: string;
  data: string; // base64
  mimeType: string;
}

function readStore(): Record<string, StoredFile> {
  try {
    if (!fs.existsSync(STORE_FILE)) return {};
    return JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
  } catch { return {}; }
}

function writeStore(store: Record<string, StoredFile>): void {
  fs.mkdirSync(STORE_DIR, { recursive: true });
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

/** 存储文件 */
export function saveFile(filename: string, originalName: string, buffer: Buffer, mimeType: string): void {
  const store = readStore();
  store[filename] = { filename, originalName, data: buffer.toString('base64'), mimeType };
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
