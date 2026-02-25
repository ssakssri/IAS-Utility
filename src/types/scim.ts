// SAP IAS SCIM 2.0 User Schema
export interface ScimUser {
  id: string;
  externalId?: string;
  userName: string;
  name: {
    givenName: string;
    familyName: string;
    formatted?: string;
  };
  emails: Array<{
    value: string;
    primary: boolean;
    type?: string;
  }>;
  active: boolean;
  userType?: string;
  groups?: Array<{
    value: string;
    display: string;
  }>;
  // SAP IAS 확장 속성
  'urn:ietf:params:scim:schemas:extension:sap:2.0:User'?: {
    status?: 'active' | 'inactive';
    loginTime?: string;
    emailVerified?: boolean;
    passwordPolicy?: string;
    passwordDetails?: {
      status?: 'initial' | 'enabled' | 'disabled' | 'locked';
    };
    totpEnabled?: boolean;
  };
}

// SCIM List Response
export interface ScimListResponse<T> {
  schemas: string[];
  totalResults: number;
  startIndex: number;
  itemsPerPage: number;
  Resources: T[];
}

// 내부 정규화 User 타입 (UI에서 사용)
export interface IasUser {
  id: string;
  userName: string;
  displayName: string;
  email: string;
  active: boolean;
  status: 'active' | 'inactive';
  lastLoginTime: string | null;
  emailVerified: boolean;
  groups: string[];
  passwordStatus: 'initial' | 'enabled' | 'disabled' | 'locked' | null;
}

// 검색 파라미터
export interface UserSearchParams {
  q?: string;
  email?: string;
  status?: 'active' | 'inactive' | 'all';
  page?: number;
  pageSize?: number;
}

// 검색 결과
export interface UserSearchResult {
  users: IasUser[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// ScimUser → IasUser 변환 유틸
export function normalizeScimUser(scim: ScimUser): IasUser {
  const ext = scim['urn:ietf:params:scim:schemas:extension:sap:2.0:User'];
  const primaryEmail = scim.emails.find((e) => e.primary)?.value ?? scim.emails[0]?.value ?? '';
  return {
    id: scim.id,
    userName: scim.userName,
    displayName: scim.name.formatted ?? `${scim.name.givenName} ${scim.name.familyName}`.trim(),
    email: primaryEmail,
    active: scim.active,
    status: scim.active ? 'active' : 'inactive',
    lastLoginTime: ext?.loginTime ?? null,
    emailVerified: ext?.emailVerified ?? false,
    groups: scim.groups?.map((g) => g.display) ?? [],
    passwordStatus: ext?.passwordDetails?.status ?? null,
  };
}
