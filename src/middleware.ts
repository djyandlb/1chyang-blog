// src/middleware.ts — 后台路由 JWT 守卫
import { defineMiddleware } from 'astro:middleware';
import { verifyToken } from './lib/auth';

// 需要保护的路由前缀
const PROTECTED_ROUTES = ['/admin', '/api/auth/logout', '/api/posts', '/api/upload', '/api/works', '/api/settings', '/api/friends'];

// 公开路由（即使匹配 PROTECTED_ROUTES 也不需要认证）
const PUBLIC_PATHS = ['/admin/login', '/api/auth/login'];

export const onRequest = defineMiddleware((context, next) => {
  const pathname = new URL(context.request.url).pathname;

  // 检查是否需要保护
  const needsAuth = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isPublic = PUBLIC_PATHS.some((route) => pathname.startsWith(route));

  if (!needsAuth || isPublic) {
    return next();
  }

  const token = context.cookies.get('token')?.value;
  if (!token || !verifyToken(token)) {
    // API 返回 401，页面重定向到登录页
    if (pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: '未登录或登录已过期' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return context.redirect('/admin/login');
  }

  return next();
});
