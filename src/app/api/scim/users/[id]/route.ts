import { NextRequest, NextResponse } from 'next/server';
import { getSapIasService } from '@/services/sap-ias.service';
import { mapScimError } from '@/lib/scim-error';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const service = await getSapIasService();
    const user = await service.getUser(params.id);
    return NextResponse.json(user);
  } catch (e) {
    return mapScimError(e);
  }
}
