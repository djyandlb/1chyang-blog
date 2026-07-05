// src/lib/posts.ts — 文章 CRUD
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.resolve('data');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
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

function readPosts(): PostMeta[] {
  if (!fs.existsSync(POSTS_FILE)) return [];
  return JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8'));
}

function writePosts(posts: PostMeta[]): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf-8');
}

/** 获取所有已发布文章（按日期倒序） */
export function getAllPosts(): PostMeta[] {
  return readPosts()
    .filter((p) => p.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** 获取所有文章（含草稿，后台用） */
export function getAllPostsAdmin(): PostMeta[] {
  return readPosts().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** 按 slug 获取单篇文章（含正文） */
export function getPostBySlug(slug: string): Post | null {
  const posts = readPosts();
  const meta = posts.find((p) => p.slug === slug);
  if (!meta) return null;

  const mdPath = path.join(CONTENT_DIR, `${slug}.md`);
  if (!fs.existsSync(mdPath)) return null;

  const content = fs.readFileSync(mdPath, 'utf-8');
  return { ...meta, content };
}

/** 创建新文章 */
export function createPost(meta: Omit<PostMeta, 'id'>, content: string): PostMeta {
  const posts = readPosts();
  const id = String(Date.now());
  const newPost: PostMeta = { ...meta, id };
  posts.push(newPost);
  writePosts(posts);

  fs.mkdirSync(CONTENT_DIR, { recursive: true });
  fs.writeFileSync(path.join(CONTENT_DIR, `${meta.slug}.md`), content, 'utf-8');

  return newPost;
}

/** 更新文章 */
export function updatePost(id: string, meta: Partial<PostMeta>, content?: string): PostMeta | null {
  const posts = readPosts();
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const oldSlug = posts[index].slug;
  posts[index] = { ...posts[index], ...meta };
  const newSlug = posts[index].slug;
  writePosts(posts);

  if (content !== undefined) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
    if (oldSlug !== newSlug) {
      const oldPath = path.join(CONTENT_DIR, `${oldSlug}.md`);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    fs.writeFileSync(path.join(CONTENT_DIR, `${newSlug}.md`), content, 'utf-8');
  } else if (oldSlug !== newSlug) {
    const oldPath = path.join(CONTENT_DIR, `${oldSlug}.md`);
    const newPath = path.join(CONTENT_DIR, `${newSlug}.md`);
    if (fs.existsSync(oldPath)) fs.renameSync(oldPath, newPath);
  }

  return posts[index];
}

/** 删除文章 */
export function deletePost(id: string): boolean {
  const posts = readPosts();
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) return false;

  const post = posts[index];
  posts.splice(index, 1);
  writePosts(posts);

  const mdPath = path.join(CONTENT_DIR, `${post.slug}.md`);
  if (fs.existsSync(mdPath)) fs.unlinkSync(mdPath);

  return true;
}
