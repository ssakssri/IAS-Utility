import { NextRequest, NextResponse } from 'next/server';
import { auditLogService } from '@/services/audit-log.service';
import type { AuditAction } from '@/types/audit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const result = await auditLogService.list({
      action: (searchParams.get('action') as AuditAction) || undefined,
      adminEmail: searchParams.get('adminEmail') ?? undefined,
      targetUser: searchParams.get('targetUser') ?? undefined,
      startDate: searchParams.get('startDate') ?? undefined,
      endDate: searchParams.get('endDate') ?? undefined,
      page: Number(searchParams.get('page') ?? 1),
      pageSize: Number(searchParams.get('pageSize') ?? 20),
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: String(e) }, { status: 500 });
  }
}
