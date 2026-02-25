import { NextResponse } from 'next/server';
import { AxiosError } from 'axios';

const STATUS_MESSAGES: Record<number, string> = {
  400: '입력 데이터가 올바르지 않습니다.',
  401: 'SAP IAS 인증 오류 (관리자 확인 필요)',
  404: '사용자를 찾을 수 없습니다.',
  409: '이미 처리된 요청입니다.',
  429: '요청 한도 초과. 잠시 후 다시 시도해주세요.',
  500: 'SAP IAS 서버 오류. 잠시 후 다시 시도해주세요.',
};

export function mapScimError(e: unknown): NextResponse {
  if (e instanceof AxiosError && e.response) {
    const scimStatus = e.response.status;
    const httpStatus = scimStatus === 401 || scimStatus === 500 ? 502 : scimStatus;
    const message = STATUS_MESSAGES[scimStatus] ?? 'SAP IAS 오류가 발생했습니다.';
    const detail =
      process.env.NODE_ENV !== 'production' ? `SCIM ${e.config?.method?.toUpperCase()} ${e.config?.url} returned ${scimStatus}` : undefined;
    return NextResponse.json({ code: `SCIM_${scimStatus}`, message, detail }, { status: httpStatus });
  }
  if (e instanceof Error && e.message.includes('No active IAS tenant')) {
    return NextResponse.json(
      { code: 'CONFIG_MISSING', message: 'IAS Tenant 설정이 없습니다. /settings/config에서 설정해주세요.' },
      { status: 503 },
    );
  }
  return NextResponse.json(
    { code: 'INTERNAL_ERROR', message: 'SAP IAS 서비스에 연결할 수 없습니다.' },
    { status: 503 },
  );
}
