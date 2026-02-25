import type { NextAuthConfig } from 'next-auth';
import type { AdminRole } from '@/types/admin';

// Edge Runtime 호환 설정 (Prisma 미포함)
// middleware.ts에서 이 파일만 import
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: AdminRole }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as AdminRole;
      }
      return session;
    },
  },
  providers: [], // Credentials provider는 auth.ts에서 추가
};
