import axios, { AxiosInstance } from 'axios';
import type { ResolvedTenantConfig } from '@/types/config';
import type { ScimUser, ScimListResponse, UserSearchParams, IasUser, UserSearchResult } from '@/types/scim';
import { normalizeScimUser } from '@/types/scim';
import { configService } from './config.service';

export class SapIasService {
  private readonly client: AxiosInstance;

  constructor(config: ResolvedTenantConfig) {
    const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
    this.client = axios.create({
      baseURL: config.tenantUrl,
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/scim+json',
        Accept: 'application/scim+json',
      },
      timeout: 15000,
    });
  }

  // 사용자 검색
  async searchUsers(params: UserSearchParams): Promise<UserSearchResult> {
    const filter = this.buildFilter(params);
    const startIndex = ((params.page ?? 1) - 1) * (params.pageSize ?? 20) + 1;
    const count = params.pageSize ?? 20;

    const response = await this.client.get<ScimListResponse<ScimUser>>('/scim/Users', {
      params: {
        ...(filter ? { filter } : {}),
        startIndex,
        count,
      },
    });

    const { Resources, totalResults } = response.data;
    return {
      users: Resources.map(normalizeScimUser),
      totalCount: totalResults,
      page: params.page ?? 1,
      pageSize: count,
    };
  }

  // 사용자 상세 조회
  async getUser(id: string): Promise<IasUser> {
    const response = await this.client.get<ScimUser>(`/scim/Users/${id}`);
    return normalizeScimUser(response.data);
  }

  // 패스워드 리셋
  async resetPassword(id: string, newPassword: string): Promise<void> {
    await this.client.patch(`/scim/Users/${id}`, {
      schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
      Operations: [
        {
          op: 'replace',
          value: {
            password: newPassword,
            'urn:ietf:params:scim:schemas:extension:sap:2.0:User': {
              passwordDetails: { status: 'initial' },
            },
          },
        },
      ],
    });
  }

  // 패스워드 리셋 이메일 발송
  async sendPasswordResetEmail(id: string): Promise<void> {
    // SAP IAS 전용 비표준 엔드포인트 — 테넌트에 따라 경로가 다를 수 있음
    await this.client.post(`/Accounts/${id}/Emails/activate`);
  }

  // 계정 상태 변경
  async updateUserStatus(id: string, active: boolean): Promise<void> {
    await this.client.patch(`/scim/Users/${id}`, {
      schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
      Operations: [
        {
          op: 'replace',
          value: { active },
        },
      ],
    });
  }

  // SCIM filter 빌더
  private buildFilter(params: UserSearchParams): string {
    const conditions: string[] = [];

    if (params.q) {
      const q = params.q.replace(/"/g, '\\"');
      conditions.push(
        `(userName co "${q}" or emails.value co "${q}" or name.familyName co "${q}" or name.givenName co "${q}")`,
      );
    }
    if (params.email) {
      conditions.push(`emails.value eq "${params.email.replace(/"/g, '\\"')}"`);
    }
    if (params.status && params.status !== 'all') {
      conditions.push(`active eq ${params.status === 'active' ? 'true' : 'false'}`);
    }

    return conditions.join(' and ');
  }
}

// API Route에서 사용하는 팩토리 헬퍼
export async function getSapIasService(): Promise<SapIasService> {
  const config = await configService.getActiveConfig();
  return new SapIasService(config);
}
