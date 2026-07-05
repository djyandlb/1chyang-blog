// src/lib/posts.ts — 文章 CRUD（Netlify Blobs 兼容）
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { readData, writeData } from './dataStore';

const DATA_NAME = 'posts';
const CONTENT_DIR = path.resolve('src/content/posts');

export interface PostMeta {
  id: string;
  title: string;
  slug: string;
  date: string;
  tags: string[];
  excerpt: string;
  published: boolean;
}

export interface Post extends PostMeta {
  content: string;
}

function tmpContentFile(slug: string): string {
  const dir = path.join(os.tmpdir(), 'yibuchuanyang-posts');
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `${slug}.md`);
}

/** 读取文章正文 */
async function readContent(slug: string): Promise<string | null> {
  // 1. 尝试 /tmp 缓存
  const tmpFile = tmpContentFile(slug);
  if (fs.existsSync(tmpFile)) return fs.readFileSync(tmpFile, 'utf-8');
  // 2. 尝试本地 MD 文件
  const mdPath = path.join(CONTENT_DIR, `${slug}.md`);
  if (fs.existsSync(mdPath)) return fs.readFileSync(mdPath, 'utf-8');
  return null;
}

/** 写入文章正文 */
async function writeContent(slug: string, content: string): Promise<void> {
  // 写入 /tmp（所有环境，唯一可写的地方）
  fs.mkdirSync(path.dirname(tmpContentFile(slug)), { recursive: true });
  fs.writeFileSync(tmpContentFile(slug), content, 'utf-8');
}

/** 删除文章正文 */
async function deleteContent(slug: string): Promise<void> {
  const f = tmpContentFile(slug);
  if (fs.existsSync(f)) fs.unlinkSync(f);
}

/** 获取所有已发布文章 */
export async function getAllPosts(): Promise<PostMeta[]> {
  const posts = await readData<PostMeta>(DATA_NAME);
  return posts.filter((p) => p.published).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** 获取所有文章（含草稿） */
export async function getAllPostsAdmin(): Promise<PostMeta[]> {
  const posts = await readData<PostMeta>(DATA_NAME);
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** 按 slug 获取单篇文章 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const posts = await readData<PostMeta>(DATA_NAME);
  const meta = posts.find((p) => p.slug === slug);
  if (!meta) return null;
  const content = await readContent(slug);
  if (content === null) return null;
  return { ...meta, content };
}

/** 创建新文章 */
export async function createPost(meta: Omit<PostMeta, 'id'>, content: string): Promise<PostMeta> {
  const posts = await readData<PostMeta>(DATA_NAME);
  const id = String(Date.now());
  const newPost: PostMeta = { ...meta, id };
  posts.push(newPost);
  await writeData(DATA_NAME, posts);
  await writeContent(newPost.slug, content);
  return newPost;
}

/** 更新文章 */
export async function updatePost(id: string, meta: Partial<PostMeta>, content?: string): Promise<PostMeta | null> {
  const posts = await readData<PostMeta>(DATA_NAME);
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const oldSlug = posts[index].slug;
  posts[index] = { ...posts[index], ...meta };
  await writeData(DATA_NAME, posts);

  if (content !== undefined) {
    if (oldSlug !== (meta.slug || oldSlug)) {
      await deleteContent(oldSlug);
    }
    await writeContent(meta.slug || oldSlug, content);
  }
  return posts[index];
}

/** 删除文章 */
export async function deletePost(id: string): Promise<boolean> {
  const posts = await readData<PostMeta>(DATA_NAME);
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) return false;

  const post = posts[index];
  posts.splice(index, 1);
  await writeData(DATA_NAME, posts);
  await deleteContent(post.slug);
  return true;
}
