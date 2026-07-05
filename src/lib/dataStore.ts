// src/lib/dataStore.ts — 数据存储抽象层
// 构建时/本地: JSON 文件
// Netlify 运行时: Netlify Blobs（自动 fallback）
import fs from 'node:fs';
import path from 'node:path';

const isNetlify = !!process.env.NETLIFY;
const STORE_NAME = 'blog-data';

function localFile(name: string): string {
  return path.resolve('data', `${name}.json`);
}

function readLocal<T>(name: string): T[] {
  const file = localFile(name);
  if (!fs.existsSync(file)) return [];
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); } catch { return []; }
}

function writeLocal<T>(name: string, data: T[]): void {
  const file = localFile(name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * 读取数据。
 * Netlify 运行时优先从 Blob 读取，失败时降级到本地 JSON。
 */
export async function readData<T>(name: string): Promise<T[]> {
  if (isNetlify) {
    try {
      const { getStore } = await import('@netlify/blobs');
      const store = getStore(STORE_NAME);
      const raw = await store.get(name, { type: 'text' });
      if (raw !== null) return JSON.parse(raw);
    } catch {
      // Blob 不可用（如构建时），降级到本地
    }
  }
  return readLocal<T>(name);
}

/**
 * 写入数据。
 * Netlify 运行时写入 Blob，否则写入本地 JSON。
 */
export async function writeData<T>(name: string, data: T[]): Promise<void> {
  const json = JSON.stringify(data, null, 2);
  if (isNetlify) {
    try {
      const { getStore } = await import('@netlify/blobs');
      const store = getStore(STORE_NAME);
      await store.set(name, json);
      return;
    } catch {
      // Blob 不可用，降级到本地
    }
  }
  writeLocal(name, data);
}
