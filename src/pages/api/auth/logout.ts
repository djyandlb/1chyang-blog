// src/pages/api/auth/logout.ts — 登出接口
import type { APIContext } from 'astro';

export const prerender = false;

export async function POST({ cookies, redirect }: APIContext) {
  cookies.delete('token', { path: '/' });
  return redirect('/admin/login');
}

// 也支持 GET 方式登出（方便链接点击）
export async function GET({ cookies, redirect }: APIContext) {
  cookies.delete('token', { path: '/' });
  return redirect('/admin/login');
}
