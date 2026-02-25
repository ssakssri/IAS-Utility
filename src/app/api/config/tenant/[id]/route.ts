import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { configService } from '@/services/config.service';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  tenantUrl: z.string().url().optional(),
  clientId: z.string().min(1).optional(),
  clientSecret: z.string().optional(),
  authType: z.enum(['basic', 'certificate']).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const input = updateSchema.parse(body);
    const config = await configService.updateConfig(params.id, input);
    return NextResponse.json(config);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ code: 'VALIDATION_ERROR', message: e.message }, { status: 400 });
    }
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: String(e) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await configService.deleteConfig(params.id);
    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = String(e);
    if (msg.includes('active')) {
      return NextResponse.json({ code: 'CONFLICT', message: msg }, { status: 409 });
    }
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: msg }, { status: 500 });
  }
}
