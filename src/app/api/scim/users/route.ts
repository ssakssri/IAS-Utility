import { NextRequest, NextResponse } from 'next/server';
import { getSapIasService } from '@/services/sap-ias.service';
import { mapScimError } from '@/lib/scim-error';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const service = await getSapIasService();
    const result = await service.searchUsers({
      q: searchParams.get('q') ?? undefined,
      email: searchParams.get('email') ?? undefined,
      status: (searchParams.get('status') as 'active' | 'inactive' | 'all') ?? 'all',
      page: Number(searchParams.get('page') ?? 1),
      pageSize: Math.min(Number(searchParams.get('pageSize') ?? 20), 100),
    });
    return NextResponse.json(result);
  } catch (e) {
    return mapScimError(e);
  }
}
