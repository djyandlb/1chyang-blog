// src/lib/dataStore.ts — 数据存储
// 构建时/首次启动: 从 data/*.json 读取种子数据
// 运行时: 读写 /tmp 缓存（Netlify 兼容）
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const CACHE_DIR = path.join(os.tmpdir(), 'yibuchuanyang-data');

function cacheFile(name: string): string {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  return path.join(CACHE_DIR, `${name}.json`);
}

function projectFile(name: string): string {
  return path.resolve('data', `${name}.json`);
}

/** 读取数据（优先缓存，其次项目文件） */
export async function readData<T>(name: string): Promise<T[]> {
  // 1. 尝试 /tmp 缓存
  const cache = cacheFile(name);
  if (fs.existsSync(cache)) {
    try { return JSON.parse(fs.readFileSync(cache, 'utf-8')); } catch {}
  }
  // 2. 从项目文件读取
  const project = projectFile(name);
  if (fs.existsSync(project)) {
    try { return JSON.parse(fs.readFileSync(project, 'utf-8')); } catch {}
  }
  return [];
}

/** 写入数据（写入 /tmp 缓存，本地开发也写项目文件） */
export async function writeData<T>(name: string, data: T[]): Promise<void> {
  const json = JSON.stringify(data, null, 2);
  // 写入 /tmp 缓存（所有环境）
  fs.writeFileSync(cacheFile(name), json, 'utf-8');
  // 本地开发写项目文件
  if (!process.env.NETLIFY) {
    const pf = projectFile(name);
    fs.mkdirSync(path.dirname(pf), { recursive: true });
    fs.writeFileSync(pf, json, 'utf-8');
  }
}
