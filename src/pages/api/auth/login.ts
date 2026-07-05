// src/api/auth/login.ts — 登录接口
import type { APIContext } from 'astro';
import { verifyPassword, generateToken } from '../../../lib/auth';

export const prerender = false;

export async function POST({ request, cookies }: APIContext) {
  try {
    const { username, password } = await request.json();

    if (!verifyPassword(username, password)) {
      return new Response(JSON.stringify({ error: '用户名或密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = generateToken(username);
    cookies.set('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 天
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: '请求格式错误' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
