export type AuditAction =
  | 'PASSWORD_RESET'
  | 'PASSWORD_RESET_EMAIL'
  | 'BULK_PASSWORD_RESET'
  | 'BULK_PASSWORD_RESET_EMAIL'
  | 'STATUS_CHANGE';

export type AuditStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface AuditLog {
  id: string;
  adminEmail: string;
  action: AuditAction;
  targetUserId: string;
  targetUserName: string;
  status: AuditStatus;
  errorMessage: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogFilter {
  action?: AuditAction;
  adminEmail?: string;
  targetUser?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface AuditLogResult {
  logs: AuditLog[];
  totalCount: number;
  page: number;
  pageSize: number;
}
