export type AuthType = 'basic' | 'certificate';
export type ConnectionStatus = 'unknown' | 'ok' | 'error';

// DB에 저장되는 TenantConfig 형태 (클라이언트에 반환 시 secret 필드 제외)
export interface TenantConfig {
  id: string;
  name: string;
  tenantUrl: string;
  clientId: string;
  authType: AuthType;
  isActive: boolean;
  connectionStatus: ConnectionStatus;
  lastTestedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// 서비스 레이어에서 복호화 후 사용하는 내부 타입 (메모리에만 존재)
export interface ResolvedTenantConfig {
  tenantUrl: string;
  clientId: string;
  clientSecret: string;
  authType: AuthType;
}

// 생성 입력
export interface CreateTenantConfigInput {
  name: string;
  tenantUrl: string;
  clientId: string;
  clientSecret: string;
  authType?: AuthType;
}

// 수정 입력 (clientSecret 선택적 - 변경 안 할 경우 생략)
export interface UpdateTenantConfigInput {
  name?: string;
  tenantUrl?: string;
  clientId?: string;
  clientSecret?: string;
  authType?: AuthType;
}
