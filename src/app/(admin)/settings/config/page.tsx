'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useTenantConfigs } from '@/features/config/hooks/useTenantConfigs';
import TenantConfigCard from '@/features/config/components/TenantConfigCard';
import TenantConfigForm from '@/features/config/components/TenantConfigForm';

export default function ConfigPage() {
  const { data: session } = useSession();
  const isSuperAdmin = (session?.user as { role?: string })?.role === 'SUPER_ADMIN';

  const { data: configs, isLoading, isError } = useTenantConfigs();
  const [showForm, setShowForm] = useState(false);

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-gray-700">접근 권한이 없습니다</p>
          <p className="text-sm text-gray-400">SUPER_ADMIN 권한이 필요합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">IAS 연동 설정</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            SAP IAS Tenant URL 및 인증 정보를 관리합니다.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          + 새 설정 추가
        </button>
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          설정을 불러올 수 없습니다.
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-400 text-sm">불러오는 중...</div>
      ) : configs && configs.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-xl">
          <p className="text-gray-400 text-sm">등록된 설정이 없습니다.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-3 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            첫 번째 설정 추가
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {configs?.map((config) => (
            <TenantConfigCard key={config.id} config={config} />
          ))}
        </div>
      )}

      {showForm && (
        <TenantConfigForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
