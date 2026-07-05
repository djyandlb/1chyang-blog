// src/lib/works.ts — 作品 CRUD
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.resolve('data');
const WORKS_FILE = path.join(DATA_DIR, 'works.json');

export interface WorkMeta {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: string;
  tags: string[];
  fileUrl?: string;
  fileName?: string;
}

function readWorks(): WorkMeta[] {
  if (!fs.existsSync(WORKS_FILE)) return [];
  return JSON.parse(fs.readFileSync(WORKS_FILE, 'utf-8'));
}

function writeWorks(works: WorkMeta[]): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(WORKS_FILE, JSON.stringify(works, null, 2), 'utf-8');
}

/** 获取所有作品 */
export function getAllWorks(): WorkMeta[] {
  return readWorks();
}

/** 按 id 获取单个作品 */
export function getWorkById(id: string): WorkMeta | null {
  const works = readWorks();
  return works.find((w) => w.id === id) || null;
}

/** 创建作品 */
export function createWork(meta: Omit<WorkMeta, 'id'>): WorkMeta {
  const works = readWorks();
  const id = String(Date.now());
  const newWork: WorkMeta = { ...meta, id };
  works.push(newWork);
  writeWorks(works);
  return newWork;
}

/** 更新作品 */
export function updateWork(id: string, meta: Partial<WorkMeta>): WorkMeta | null {
  const works = readWorks();
  const index = works.findIndex((w) => w.id === id);
  if (index === -1) return null;
  works[index] = { ...works[index], ...meta };
  writeWorks(works);
  return works[index];
}

/** 删除作品 */
export function deleteWork(id: string): boolean {
  const works = readWorks();
  const index = works.findIndex((w) => w.id === id);
  if (index === -1) return false;
  works.splice(index, 1);
  writeWorks(works);
  return true;
}
