import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { getSapIasService } from '@/services/sap-ias.service';
import { auditLogService } from '@/services/audit-log.service';
import { validatePassword } from '@/lib/password-policy';
import { mapScimError } from '@/lib/scim-error';

const schema = z.object({ newPassword: z.string().min(1) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });
  }

  let body: { newPassword: string };
  try {
    body = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ code: 'VALIDATION_ERROR', message: '입력이 올바르지 않습니다.' }, { status: 400 });
  }

  const pwCheck = validatePassword(body.newPassword);
  if (!pwCheck.valid) {
    return NextResponse.json({ code: 'PASSWORD_POLICY', message: pwCheck.message }, { status: 400 });
  }

  // 사용자 이메일 조회 (Audit Log용)
  let targetUserName = params.id;
  try {
    const service = await getSapIasService();
    const user = await service.getUser(params.id);
    targetUserName = user.email;
  } catch {
    // 이름 조회 실패해도 리셋 진행
  }

  const logId = await auditLogService.create({
    adminEmail: session.user.email,
    action: 'PASSWORD_RESET',
    targetUserId: params.id,
    targetUserName,
  });

  try {
    const service = await getSapIasService();
    await service.resetPassword(params.id, body.newPassword);
    await auditLogService.complete(logId, 'SUCCESS');
    return NextResponse.json({
      success: true,
      message: '패스워드가 성공적으로 리셋되었습니다.',
      auditLogId: logId,
    });
  } catch (e) {
    await auditLogService.complete(logId, 'FAILED', (e as Error).message);
    return mapScimError(e);
  }
}
