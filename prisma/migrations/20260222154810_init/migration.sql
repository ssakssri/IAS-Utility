-- CreateTable
CREATE TABLE "TenantConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "tenantUrl" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecretEncrypted" TEXT NOT NULL,
    "encryptionIv" TEXT NOT NULL,
    "encryptionTag" TEXT NOT NULL,
    "authType" TEXT NOT NULL DEFAULT 'basic',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "connectionStatus" TEXT NOT NULL DEFAULT 'unknown',
    "lastTestedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminEmail" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "targetUserName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantConfig_name_key" ON "TenantConfig"("name");

-- CreateIndex
CREATE INDEX "TenantConfig_isActive_idx" ON "TenantConfig"("isActive");

-- CreateIndex
CREATE INDEX "AuditLog_adminEmail_idx" ON "AuditLog"("adminEmail");

-- CreateIndex
CREATE INDEX "AuditLog_targetUserId_idx" ON "AuditLog"("targetUserId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
