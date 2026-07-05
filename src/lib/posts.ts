// src/lib/posts.ts — 文章 CRUD（Netlify Blobs 兼容）
import fs from 'node:fs';
import path from 'node:path';
import { readData, writeData } from './dataStore';

const DATA_NAME = 'posts';
const isNetlify = !!process.env.NETLIFY;
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

/** 读取文章正文：Netlify 上从 Blob 读，本地从 MD 文件读 */
async function readContent(slug: string): Promise<string | null> {
  if (isNetlify) {
    try {
      const { getStore } = await import('@netlify/blobs');
      const store = getStore('blog-posts');
      return await store.get(slug, { type: 'text' });
    } catch { return null; }
  }
  const mdPath = path.join(CONTENT_DIR, `${slug}.md`);
  if (!fs.existsSync(mdPath)) return null;
  return fs.readFileSync(mdPath, 'utf-8');
}

/** 写入文章正文 */
async function writeContent(slug: string, content: string): Promise<void> {
  if (isNetlify) {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('blog-posts');
    await store.set(slug, content);
    return;
  }
  fs.mkdirSync(CONTENT_DIR, { recursive: true });
  fs.writeFileSync(path.join(CONTENT_DIR, `${slug}.md`), content, 'utf-8');
}

/** 删除文章正文 */
async function deleteContent(slug: string): Promise<void> {
  if (isNetlify) {
    try {
      const { getStore } = await import('@netlify/blobs');
      const store = getStore('blog-posts');
      await store.delete(slug);
    } catch { /* ignore */ }
    return;
  }
  const mdPath = path.join(CONTENT_DIR, `${slug}.md`);
  if (fs.existsSync(mdPath)) fs.unlinkSync(mdPath);
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
