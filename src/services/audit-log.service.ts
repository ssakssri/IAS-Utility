import { prisma } from '@/lib/prisma';
import type { AuditAction, AuditLog, AuditLogFilter, AuditLogResult } from '@/types/audit';

function toAuditLog(row: {
  id: string;
  adminEmail: string;
  action: string;
  targetUserId: string;
  targetUserName: string;
  status: string;
  errorMessage: string | null;
  metadata: string | null;
  createdAt: Date;
  updatedAt: Date;
}): AuditLog {
  return {
    id: row.id,
    adminEmail: row.adminEmail,
    action: row.action as AuditAction,
    targetUserId: row.targetUserId,
    targetUserName: row.targetUserName,
    status: row.status as AuditLog['status'],
    errorMessage: row.errorMessage,
    metadata: row.metadata ? JSON.parse(row.metadata) : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const auditLogService = {
  // Audit Log 생성 (PENDING 상태로 시작)
  async create(params: {
    adminEmail: string;
    action: AuditAction;
    targetUserId: string;
    targetUserName: string;
    metadata?: Record<string, unknown>;
  }): Promise<string> {
    const row = await prisma.auditLog.create({
      data: {
        adminEmail: params.adminEmail,
        action: params.action,
        targetUserId: params.targetUserId,
        targetUserName: params.targetUserName,
        status: 'PENDING',
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });
    return row.id;
  },

  // Audit Log 완료 처리
  async complete(id: string, status: 'SUCCESS' | 'FAILED', errorMessage?: string): Promise<void> {
    await prisma.auditLog.update({
      where: { id },
      data: { status, errorMessage: errorMessage ?? null },
    });
  },

  // Audit Log 목록 조회
  async list(filter: AuditLogFilter): Promise<AuditLogResult> {
    const page = filter.page ?? 1;
    const pageSize = Math.min(filter.pageSize ?? 20, 100);
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};
    if (filter.action) where.action = filter.action;
    if (filter.adminEmail) where.adminEmail = { contains: filter.adminEmail };
    if (filter.targetUser) where.targetUserName = { contains: filter.targetUser };
    if (filter.startDate || filter.endDate) {
      where.createdAt = {
        ...(filter.startDate ? { gte: new Date(filter.startDate) } : {}),
        ...(filter.endDate ? { lte: new Date(filter.endDate) } : {}),
      };
    }

    const [rows, totalCount] = await prisma.$transaction([
      prisma.auditLog.findMany({ where, skip, take: pageSize, orderBy: { createdAt: 'desc' } }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs: rows.map(toAuditLog), totalCount, page, pageSize };
  },
};
