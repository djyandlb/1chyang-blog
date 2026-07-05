// src/lib/posts.ts — 文章 CRUD（支持 Netlify Blobs）
import fs from 'node:fs';
import path from 'node:path';
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

/** 获取所有已发布文章（按日期倒序） */
export async function getAllPosts(): Promise<PostMeta[]> {
  const posts = await readData<PostMeta>(DATA_NAME);
  return posts.filter((p) => p.published).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** 获取所有文章（含草稿，后台用） */
export async function getAllPostsAdmin(): Promise<PostMeta[]> {
  const posts = await readData<PostMeta>(DATA_NAME);
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** 按 slug 获取单篇文章（含正文） */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const posts = await readData<PostMeta>(DATA_NAME);
  const meta = posts.find((p) => p.slug === slug);
  if (!meta) return null;

  const mdPath = path.join(CONTENT_DIR, `${slug}.md`);
  if (!fs.existsSync(mdPath)) return null;

  const content = fs.readFileSync(mdPath, 'utf-8');
  return { ...meta, content };
}

/** 创建新文章 */
export async function createPost(meta: Omit<PostMeta, 'id'>, content: string): Promise<PostMeta> {
  const posts = await readData<PostMeta>(DATA_NAME);
  const id = String(Date.now());
  const newPost: PostMeta = { ...meta, id };
  posts.push(newPost);
  await writeData(DATA_NAME, posts);

  fs.mkdirSync(CONTENT_DIR, { recursive: true });
  fs.writeFileSync(path.join(CONTENT_DIR, `${meta.slug}.md`), content, 'utf-8');

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
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
    if (oldSlug !== (meta.slug || oldSlug)) {
      const oldPath = path.join(CONTENT_DIR, `${oldSlug}.md`);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    fs.writeFileSync(path.join(CONTENT_DIR, `${meta.slug || oldSlug}.md`), content, 'utf-8');
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

  const mdPath = path.join(CONTENT_DIR, `${post.slug}.md`);
  if (fs.existsSync(mdPath)) fs.unlinkSync(mdPath);
  return true;
}
