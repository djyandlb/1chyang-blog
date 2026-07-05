// src/lib/defaultData.ts — 构建时嵌入的种子数据
// 避免 Netlify 运行时从只读文件系统读取
import posts from '../../data/posts.json';
import works from '../../data/works.json';
import friends from '../../data/friends.json';

export interface Defaults {
  posts: any[];
  works: any[];
  friends: any[];
}

export const defaults: Defaults = {
  posts: posts as any[],
  works: works as any[],
  friends: friends as any[],
};
