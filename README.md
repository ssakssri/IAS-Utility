# SAP IAS Admin Portal

SAP Identity Authentication Service(IAS) 사용자 계정을 관리하는 내부 관리자 웹 포털입니다.
SCIM 2.0 API를 프록시하여 패스워드 리셋, 계정 상태 변경, 감사 로그 조회 등을 안전하게 수행합니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| **사용자 검색** | 이메일·이름·사용자명으로 IAS 사용자 검색 및 목록 조회 |
| **개별 패스워드 리셋** | 임시 패스워드 직접 설정 또는 리셋 이메일 발송 |
| **일괄(Bulk) 처리** | 최대 100명 동시 패스워드 리셋 (100ms throttle) |
| **계정 상태 변경** | 계정 활성화 / 비활성화 |
| **감사 로그** | 모든 쓰기 작업 이력 조회 및 필터링 |
| **Tenant 설정** | SAP IAS Tenant URL·인증 정보 DB 관리 (SUPER_ADMIN 전용) |

---

## 기술 스택

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Auth**: NextAuth v5 (JWT, Credentials Provider)
- **DB**: Prisma 5 + SQLite (dev) / PostgreSQL (prod)
- **State**: TanStack Query v5, Zustand
- **Security**: AES-256-GCM 암호화, SUPER_ADMIN 역할 분리

---

## 시작하기

### 사전 요구사항

- Node.js 18+
- npm 9+

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.local` 파일을 생성하고 아래 내용을 채워주세요.

```env
# NextAuth
AUTH_SECRET=<32자 이상 랜덤 문자열>
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=file:/절대경로/prisma/dev.db

# Tenant Config 암호화 키 (32바이트 hex, 64자)
# 생성: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
CONFIG_ENCRYPTION_KEY=<64자 hex 문자열>

# (선택) DB Config 없을 때 ENV 폴백
SAP_IAS_TENANT_URL=https://xxxxx.accounts.ondemand.com
SAP_IAS_CLIENT_ID=your-client-id
SAP_IAS_CLIENT_SECRET=your-client-secret
```

### 3. DB 초기화

```bash
# 스키마 마이그레이션
npm run db:migrate

# 초기 관리자 계정 생성 (seed)
npm run db:seed
```

### 4. 개발 서버 시작

```bash
npm run dev
```

브라우저에서 http://localhost:3000 을 열고 seed로 생성된 계정으로 로그인하세요.

---

## 서버 종료

### 개발 서버

터미널에서 `Ctrl + C`를 누르면 즉시 종료됩니다.

### 프로덕션 서버

```bash
# 프로세스 ID 확인
lsof -i :3000

# 종료
kill <PID>
```

또는 pm2를 사용하는 경우:

```bash
pm2 stop sap-ias-admin
```

---

## 프로덕션 빌드

```bash
# 빌드
npm run build

# 서버 시작
npm run start
```

---

## 주요 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 시작 (http://localhost:3000) |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 시작 |
| `npm run db:migrate` | DB 스키마 마이그레이션 |
| `npm run db:seed` | 초기 데이터 생성 (관리자 계정) |
| `npm run db:studio` | Prisma Studio 실행 (DB GUI) |
| `npm run test` | 단위 테스트 실행 |

---

## 관리자 역할

| 역할 | 권한 |
|------|------|
| `ADMIN` | 사용자 검색, 패스워드 리셋, 감사 로그 조회 |
| `SUPER_ADMIN` | ADMIN 권한 + Tenant Config 관리 |

---

## 프로젝트 구조

```
src/
├── app/
│   ├── (auth)/login/          # 로그인 페이지
│   ├── (admin)/               # 인증 필요 페이지
│   │   ├── users/             # 사용자 검색·상세
│   │   ├── audit-log/         # 감사 로그
│   │   └── settings/config/   # Tenant 설정 (SUPER_ADMIN)
│   └── api/                   # API Routes (SCIM 프록시)
├── features/                  # 기능별 컴포넌트·훅
├── services/                  # 서비스 레이어
├── lib/                       # 유틸리티 (auth, crypto, prisma)
└── types/                     # TypeScript 타입 정의
```
