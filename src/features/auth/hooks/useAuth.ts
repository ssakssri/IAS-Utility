'use client';

import { useSession } from 'next-auth/react';
import type { AdminRole } from '@/types/admin';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    role: AdminRole;
  } | null;
}

export function useAuth(): AuthState {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return { isAuthenticated: false, isLoading: true, user: null };
  }

  if (!session?.user) {
    return { isAuthenticated: false, isLoading: false, user: null };
  }

  return {
    isAuthenticated: true,
    isLoading: false,
    user: {
      id: session.user.id as string,
      email: session.user.email ?? '',
      name: session.user.name ?? '',
      role: session.user.role as AdminRole,
    },
  };
}
