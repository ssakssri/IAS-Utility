import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSapIasService } from '@/services/sap-ias.service';
import { auditLogService } from '@/services/audit-log.service';
import { mapScimError } from '@/lib/scim-error';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });
  }

  let targetUserName = params.id;
  try {
    const service = await getSapIasService();
    const user = await service.getUser(params.id);
    targetUserName = user.email;
  } catch {}

  const logId = await auditLogService.create({
    adminEmail: session.user.email,
    action: 'PASSWORD_RESET_EMAIL',
    targetUserId: params.id,
    targetUserName,
  });

  try {
    const service = await getSapIasService();
    await service.sendPasswordResetEmail(params.id);
    await auditLogService.complete(logId, 'SUCCESS');
    return NextResponse.json({ success: true, message: '패스워드 리셋 이메일이 발송되었습니다.' });
  } catch (e) {
    await auditLogService.complete(logId, 'FAILED', (e as Error).message);
    return mapScimError(e);
  }
}
