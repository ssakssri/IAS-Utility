import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { configService } from '@/services/config.service';

const createSchema = z.object({
  name: z.string().min(1),
  tenantUrl: z.string().url(),
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  authType: z.enum(['basic', 'certificate']).optional(),
});

export async function GET() {
  try {
    const configs = await configService.listConfigs();
    return NextResponse.json(configs);
  } catch (e) {
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = createSchema.parse(body);
    const config = await configService.createConfig(input);
    return NextResponse.json(config, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ code: 'VALIDATION_ERROR', message: e.message }, { status: 400 });
    }
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: String(e) }, { status: 500 });
  }
}
