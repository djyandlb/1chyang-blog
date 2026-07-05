// src/lib/dataStore.ts — 数据持久化存储
// 生产环境（Netlify）：Netlify Blobs，跨请求持久化
// 本地开发：文件系统 /tmp，方便调试
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { getStore } from '@netlify/blobs';
import { defaults } from './defaultData';

// 检测是否在 Netlify 环境
const isNetlify = !!(process.env.NETLIFY || process.env.NETLIFY_LOCAL);

// Blob store 名称
const BLOB_STORE = 'yibuchuanyang-data';

// 本地文件系统路径
const CACHE_DIR = path.join(os.tmpdir(), 'yibuchuanyang-data');

function cacheFile(name: string): string {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  return path.join(CACHE_DIR, `${name}.json`);
}

/** 获取内置种子数据 */
function getSeed<T>(name: string): T[] {
  const map: Record<string, any[]> = {
    posts: defaults.posts,
    works: defaults.works,
    friends: defaults.friends,
  };
  return (map[name] || []) as T[];
}

/** 从 Blobs 读取数据 */
async function readFromBlob<T>(name: string): Promise<T[] | null> {
  try {
    const store = getStore(BLOB_STORE);
    const raw = await store.get(name, { type: 'text' });
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

/** 写入数据到 Blobs */
async function writeToBlob<T>(name: string, data: T[]): Promise<void> {
  const store = getStore(BLOB_STORE);
  await store.set(name, JSON.stringify(data, null, 2));
}

/** 从本地文件读取 */
function readFromLocal<T>(name: string): T[] | null {
  try {
    const file = cacheFile(name);
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf-8'));
    }
  } catch {}
  return null;
}

/** 写入本地文件 */
function writeToLocal<T>(name: string, data: T[]): void {
  fs.writeFileSync(cacheFile(name), JSON.stringify(data, null, 2), 'utf-8');
}

/** 读取数据：Blobs > 本地缓存 > 种子数据 */
export async function readData<T>(name: string): Promise<T[]> {
  if (isNetlify) {
    const blobData = await readFromBlob<T>(name);
    if (blobData) return blobData;
  } else {
    const localData = readFromLocal<T>(name);
    if (localData) return localData;
  }
  return getSeed<T>(name);
}

/** 写入数据：Blobs（生产）或本地文件（开发） */
export async function writeData<T>(name: string, data: T[]): Promise<void> {
  if (isNetlify) {
    await writeToBlob(name, data);
  } else {
    writeToLocal(name, data);
  }
}
