import { NextRequest, NextResponse } from 'next/server';
import { configService } from '@/services/config.service';
import { SapIasService } from '@/services/sap-ias.service';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/crypto';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 해당 config 로드 후 복호화 (캐시된 활성 config가 아닌 지정 config)
    const row = await prisma.tenantConfig.findUnique({ where: { id: params.id } });
    if (!row) return NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });

    const resolved = {
      tenantUrl: row.tenantUrl,
      clientId: row.clientId,
      clientSecret: decrypt(row.clientSecretEncrypted, row.encryptionIv, row.encryptionTag),
      authType: row.authType as 'basic' | 'certificate',
    };

    const service = new SapIasService(resolved);
    await service.searchUsers({ pageSize: 1 });

    await configService.updateConnectionStatus(params.id, 'ok');
    return NextResponse.json({
      success: true,
      message: '연결 성공',
      testedAt: new Date().toISOString(),
    });
  } catch (e) {
    await configService.updateConnectionStatus(params.id, 'error').catch(() => {});
    return NextResponse.json(
      { success: false, message: `연결 실패: ${(e as Error).message}` },
      { status: 502 },
    );
  }
}
