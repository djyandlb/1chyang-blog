// src/lib/dataStore.ts — 数据存储抽象层
// 构建时: data/*.json（项目文件，只读）
// Netlify 运行时: Netlify Blobs → /tmp 降级
// 本地开发: data/*.json（读写）
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const STORE_NAME = 'blog-data';

/** 项目 data 目录（构建时/开发可读，Netlify 只读） */
function projectFile(name: string): string {
  return path.resolve('data', `${name}.json`);
}

/** tmp 目录（所有环境可读写） */
function tmpFile(name: string): string {
  const dir = path.join(os.tmpdir(), 'yibuchuanyang-data');
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `${name}.json`);
}

function readJson<T>(file: string): T[] {
  if (!fs.existsSync(file)) return [];
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); } catch { return []; }
}

function writeJson<T>(file: string, data: T[]): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * 读取数据。
 * 1. 优先 Netlify Blobs
 * 2. 其次 /tmp 缓存
 * 3. 最后 data/*.json（构建时数据）
 */
export async function readData<T>(name: string): Promise<T[]> {
  // 尝试 Netlify Blobs
  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore(STORE_NAME);
    const raw = await store.get(name, { type: 'text' });
    if (raw !== null) return JSON.parse(raw);
  } catch { /* Blobs 不可用 */ }

  // 尝试 /tmp 缓存
  const tmp = readJson<T>(tmpFile(name));
  if (tmp.length > 0) return tmp;

  // 最后从项目文件读取（构建时数据）
  return readJson<T>(projectFile(name));
}

/**
 * 写入数据。
 * 1. 优先 Netlify Blobs
 * 2. 降级到 /tmp
 * 3. 本地开发也写入 data/*.json（方便 git 提交）
 */
export async function writeData<T>(name: string, data: T[]): Promise<void> {
  const json = JSON.stringify(data, null, 2);

  // 尝试 Netlify Blobs
  let blobsOk = false;
  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore(STORE_NAME);
    await store.set(name, json);
    blobsOk = true;
  } catch { /* Blobs 不可用 */ }

  // 写入 /tmp 作为缓存（所有环境）
  writeJson(tmpFile(name), data);

  // 本地开发也写入项目文件
  if (!process.env.NETLIFY) {
    writeJson(projectFile(name), data);
  }

  if (!blobsOk && process.env.NETLIFY) {
    console.warn(`[dataStore] Blobs 写入失败，数据仅存于 /tmp，重启后可能丢失`);
  }
}
