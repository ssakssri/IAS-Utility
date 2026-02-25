import { prisma } from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/crypto';
import type {
  TenantConfig,
  ResolvedTenantConfig,
  CreateTenantConfigInput,
  UpdateTenantConfigInput,
  ConnectionStatus,
} from '@/types/config';

// In-memory TTL 캐시 (싱글톤)
interface Cache {
  value: ResolvedTenantConfig | null;
  expiresAt: number;
}
const cache: Cache = { value: null, expiresAt: 0 };
const CACHE_TTL_MS = 5 * 60 * 1000; // 5분

// Prisma row → 공개 TenantConfig (secret 필드 제외)
function toPublicConfig(row: {
  id: string;
  name: string;
  tenantUrl: string;
  clientId: string;
  authType: string;
  isActive: boolean;
  connectionStatus: string;
  lastTestedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): TenantConfig {
  return {
    id: row.id,
    name: row.name,
    tenantUrl: row.tenantUrl,
    clientId: row.clientId,
    authType: row.authType as TenantConfig['authType'],
    isActive: row.isActive,
    connectionStatus: row.connectionStatus as ConnectionStatus,
    lastTestedAt: row.lastTestedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

class ConfigService {
  // 활성 Config 조회 — Cache → DB → ENV 폴백
  async getActiveConfig(): Promise<ResolvedTenantConfig> {
    if (cache.value && Date.now() < cache.expiresAt) {
      return cache.value;
    }

    const row = await prisma.tenantConfig.findFirst({ where: { isActive: true } });
    if (row) {
      const resolved: ResolvedTenantConfig = {
        tenantUrl: row.tenantUrl,
        clientId: row.clientId,
        clientSecret: decrypt(row.clientSecretEncrypted, row.encryptionIv, row.encryptionTag),
        authType: row.authType as ResolvedTenantConfig['authType'],
      };
      cache.value = resolved;
      cache.expiresAt = Date.now() + CACHE_TTL_MS;
      return resolved;
    }

    // ENV 폴백 (마이그레이션 경로 — DB config 없을 때만)
    if (process.env.SAP_IAS_TENANT_URL) {
      return {
        tenantUrl: process.env.SAP_IAS_TENANT_URL,
        clientId: process.env.SAP_IAS_CLIENT_ID!,
        clientSecret: process.env.SAP_IAS_CLIENT_SECRET!,
        authType: 'basic',
      };
    }

    throw new Error('No active IAS tenant configuration found. Please configure via /settings/config.');
  }

  // Config 목록 조회 (secret 제외)
  async listConfigs(): Promise<TenantConfig[]> {
    const rows = await prisma.tenantConfig.findMany({ orderBy: { createdAt: 'asc' } });
    return rows.map(toPublicConfig);
  }

  // Config 단건 조회 (secret 제외)
  async getConfig(id: string): Promise<TenantConfig | null> {
    const row = await prisma.tenantConfig.findUnique({ where: { id } });
    return row ? toPublicConfig(row) : null;
  }

  // Config 생성
  async createConfig(input: CreateTenantConfigInput): Promise<TenantConfig> {
    const { encrypted, iv, tag } = encrypt(input.clientSecret);
    const isFirst = (await prisma.tenantConfig.count()) === 0;

    const row = await prisma.tenantConfig.create({
      data: {
        name: input.name,
        tenantUrl: input.tenantUrl,
        clientId: input.clientId,
        clientSecretEncrypted: encrypted,
        encryptionIv: iv,
        encryptionTag: tag,
        authType: input.authType ?? 'basic',
        isActive: isFirst, // 첫 번째 config는 자동 활성화
      },
    });

    if (isFirst) this.invalidateCache();
    return toPublicConfig(row);
  }

  // Config 수정
  async updateConfig(id: string, input: UpdateTenantConfigInput): Promise<TenantConfig> {
    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.tenantUrl !== undefined) updateData.tenantUrl = input.tenantUrl;
    if (input.clientId !== undefined) updateData.clientId = input.clientId;
    if (input.authType !== undefined) updateData.authType = input.authType;
    if (input.clientSecret) {
      const { encrypted, iv, tag } = encrypt(input.clientSecret);
      updateData.clientSecretEncrypted = encrypted;
      updateData.encryptionIv = iv;
      updateData.encryptionTag = tag;
    }

    const row = await prisma.tenantConfig.update({ where: { id }, data: updateData });
    this.invalidateCache();
    return toPublicConfig(row);
  }

  // Config 삭제 (활성 Config는 삭제 불가)
  async deleteConfig(id: string): Promise<void> {
    const row = await prisma.tenantConfig.findUnique({ where: { id } });
    if (!row) throw new Error('Config not found');
    if (row.isActive) throw new Error('Cannot delete active config. Activate another first.');
    await prisma.tenantConfig.delete({ where: { id } });
  }

  // 활성 Config 전환
  async activateConfig(id: string): Promise<void> {
    await prisma.$transaction([
      prisma.tenantConfig.updateMany({ data: { isActive: false } }),
      prisma.tenantConfig.update({ where: { id }, data: { isActive: true } }),
    ]);
    this.invalidateCache();
  }

  // 연결 테스트 결과 저장
  async updateConnectionStatus(id: string, status: 'ok' | 'error'): Promise<void> {
    await prisma.tenantConfig.update({
      where: { id },
      data: { connectionStatus: status, lastTestedAt: new Date() },
    });
  }

  // 캐시 즉시 무효화
  invalidateCache(): void {
    cache.value = null;
    cache.expiresAt = 0;
  }
}

export const configService = new ConfigService();
