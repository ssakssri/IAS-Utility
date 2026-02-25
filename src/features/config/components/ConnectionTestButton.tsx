'use client';

import { useState } from 'react';
import { useTenantConfigMutations } from '../hooks/useTenantConfigs';

interface Props {
  tenantId: string;
}

export default function ConnectionTestButton({ tenantId }: Props) {
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const { testConnection } = useTenantConfigMutations();

  const handleTest = async () => {
    setResultMsg(null);
    try {
      const res = await testConnection.mutateAsync(tenantId);
      setResultMsg(res.success ? '연결 성공' : res.message);
    } catch {
      setResultMsg('연결 테스트 실패');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleTest}
        disabled={testConnection.isPending}
        className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
      >
        {testConnection.isPending ? '테스트 중...' : '연결 테스트'}
      </button>
      {resultMsg && (
        <span className="text-sm text-gray-700">{resultMsg}</span>
      )}
    </div>
  );
}
