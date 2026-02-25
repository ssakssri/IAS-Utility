import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { getSapIasService } from '@/services/sap-ias.service';
import { auditLogService } from '@/services/audit-log.service';
import { mapScimError } from '@/lib/scim-error';

const schema = z.object({ active: z.boolean() });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });
  }

  let body: { active: boolean };
  try {
    body = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ code: 'VALIDATION_ERROR' }, { status: 400 });
  }

  let targetUserName = params.id;
  try {
    const service = await getSapIasService();
    const user = await service.getUser(params.id);
    targetUserName = user.email;
  } catch {}

  const logId = await auditLogService.create({
    adminEmail: session.user.email,
    action: 'STATUS_CHANGE',
    targetUserId: params.id,
    targetUserName,
    metadata: { active: body.active },
  });

  try {
    const service = await getSapIasService();
    await service.updateUserStatus(params.id, body.active);
    await auditLogService.complete(logId, 'SUCCESS');
    return NextResponse.json({
      success: true,
      message: `계정이 ${body.active ? '활성화' : '비활성화'}되었습니다.`,
    });
  } catch (e) {
    await auditLogService.complete(logId, 'FAILED', (e as Error).message);
    return mapScimError(e);
  }
}
