// src/lib/works.ts — 作品 CRUD（支持 Netlify Blobs）
import { readData, writeData } from './dataStore';

const DATA_NAME = 'works';

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

/** 获取所有作品 */
export async function getAllWorks(): Promise<WorkMeta[]> {
  return readData<WorkMeta>(DATA_NAME);
}

/** 按 id 获取单个作品 */
export async function getWorkById(id: string): Promise<WorkMeta | null> {
  const works = await readData<WorkMeta>(DATA_NAME);
  return works.find((w) => w.id === id) || null;
}

/** 创建作品 */
export async function createWork(meta: Omit<WorkMeta, 'id'>): Promise<WorkMeta> {
  const works = await readData<WorkMeta>(DATA_NAME);
  const id = String(Date.now());
  const newWork: WorkMeta = { ...meta, id };
  works.push(newWork);
  await writeData(DATA_NAME, works);
  return newWork;
}

/** 更新作品 */
export async function updateWork(id: string, meta: Partial<WorkMeta>): Promise<WorkMeta | null> {
  const works = await readData<WorkMeta>(DATA_NAME);
  const index = works.findIndex((w) => w.id === id);
  if (index === -1) return null;
  works[index] = { ...works[index], ...meta };
  await writeData(DATA_NAME, works);
  return works[index];
}

/** 删除作品 */
export async function deleteWork(id: string): Promise<boolean> {
  const works = await readData<WorkMeta>(DATA_NAME);
  const index = works.findIndex((w) => w.id === id);
  if (index === -1) return false;
  works.splice(index, 1);
  await writeData(DATA_NAME, works);
  return true;
}
