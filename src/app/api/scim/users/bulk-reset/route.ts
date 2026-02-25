import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { getSapIasService } from '@/services/sap-ias.service';
import { auditLogService } from '@/services/audit-log.service';
import { validatePassword } from '@/lib/password-policy';
import { throttledBulkProcess } from '@/lib/throttle';
import { mapScimError } from '@/lib/scim-error';

const schema = z.object({
  userIds: z.array(z.string()).min(1).max(100),
  newPassword: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });
  }

  let body: { userIds: string[]; newPassword: string };
  try {
    body = schema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ code: 'VALIDATION_ERROR', message: String(e) }, { status: 400 });
  }

  const pwCheck = validatePassword(body.newPassword);
  if (!pwCheck.valid) {
    return NextResponse.json({ code: 'PASSWORD_POLICY', message: pwCheck.message }, { status: 400 });
  }

  try {
    const service = await getSapIasService();

    const results = await throttledBulkProcess(
      body.userIds,
      async (userId) => {
        let targetUserName = userId;
        try {
          const user = await service.getUser(userId);
          targetUserName = user.email;
        } catch {}

        const logId = await auditLogService.create({
          adminEmail: session.user!.email!,
          action: 'BULK_PASSWORD_RESET',
          targetUserId: userId,
          targetUserName,
        });

        try {
          await service.resetPassword(userId, body.newPassword);
          await auditLogService.complete(logId, 'SUCCESS');
          return { userId, email: targetUserName };
        } catch (e) {
          await auditLogService.complete(logId, 'FAILED', (e as Error).message);
          throw e;
        }
      },
      100,
    );

    const mapped = results.map(({ item: userId, result, error }) =>
      error
        ? { userId, email: userId, status: 'failed', error }
        : { userId: result!.userId, email: result!.email, status: 'success' },
    );

    const success = mapped.filter((r) => r.status === 'success').length;
    return NextResponse.json({
      total: body.userIds.length,
      success,
      failed: body.userIds.length - success,
      results: mapped,
    });
  } catch (e) {
    return mapScimError(e);
  }
}
