import { NextRequest, NextResponse } from 'next/server';
import { configService } from '@/services/config.service';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await configService.activateConfig(params.id);
    return NextResponse.json({ success: true, activatedId: params.id });
  } catch (e) {
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: String(e) }, { status: 500 });
  }
}
