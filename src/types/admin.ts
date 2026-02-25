export type AdminRole = 'SUPER_ADMIN' | 'ADMIN';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  active: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}
