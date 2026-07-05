// src/lib/dataStore.ts — 数据存储
// 构建时: 从 JSON 静态导入（bundled，不依赖文件系统）
// 运行时: 读写 /tmp 缓存（Netlify 兼容）
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { defaults, type Defaults } from './defaultData';

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

/** 读取数据（优先 /tmp 缓存，其次内置种子数据） */
export async function readData<T>(name: string): Promise<T[]> {
  // 1. 尝试 /tmp 缓存
  const cache = cacheFile(name);
  try {
    if (fs.existsSync(cache)) {
      return JSON.parse(fs.readFileSync(cache, 'utf-8'));
    }
  } catch {}
  // 2. 返回内置种子数据
  return getSeed<T>(name);
}

/** 写入数据（写入 /tmp 缓存，本地开发也写项目文件） */
export async function writeData<T>(name: string, data: T[]): Promise<void> {
  // 写入 /tmp 缓存（所有环境可写）
  fs.writeFileSync(cacheFile(name), JSON.stringify(data, null, 2), 'utf-8');
  // 本地开发写项目文件
  if (!process.env.NETLIFY) {
    try {
      const pf = path.resolve('data', `${name}.json`);
      fs.mkdirSync(path.dirname(pf), { recursive: true });
      fs.writeFileSync(pf, JSON.stringify(data, null, 2), 'utf-8');
    } catch {}
  }
}
