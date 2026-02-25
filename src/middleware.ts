import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';

// Edge Runtime 호환: Prisma를 import하지 않는 authConfig만 사용
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // 로그인 페이지 — 이미 로그인된 경우 /users로 리다이렉트
  if (pathname === '/login') {
    if (isLoggedIn) return NextResponse.redirect(new URL('/users', req.url));
    return NextResponse.next();
  }

  // API 인증 라우트는 NextAuth가 처리
  if (pathname.startsWith('/api/auth')) return NextResponse.next();

  // 미인증 상태에서 admin 영역 접근 차단
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Config API는 SUPER_ADMIN만 접근 가능
  if (pathname.startsWith('/api/config')) {
    const role = (req.auth?.user as { role?: string })?.role;
    if (role !== 'SUPER_ADMIN') {
      return NextResponse.json({ code: 'FORBIDDEN', message: '권한이 없습니다.' }, { status: 403 });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
