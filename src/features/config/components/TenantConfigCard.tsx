'use client';

import { useState } from 'react';
import type { TenantConfig } from '@/types/config';
import { useTenantConfigMutations } from '../hooks/useTenantConfigs';
import TenantConfigForm from './TenantConfigForm';

interface Props {
  config: TenantConfig;
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  ok: { label: '연결됨', cls: 'bg-green-100 text-green-800' },
  error: { label: '오류', cls: 'bg-red-100 text-red-800' },
  unknown: { label: '미테스트', cls: 'bg-gray-100 text-gray-600' },
};

export default function TenantConfigCard({ config }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [testMsg, setTestMsg] = useState<string | null>(null);
  const { activate, remove, testConnection } = useTenantConfigMutations();
  const badge = STATUS_BADGE[config.connectionStatus] ?? STATUS_BADGE.unknown;

  const handleTest = async () => {
    setTestMsg(null);
    try {
      const res = await testConnection.mutateAsync(config.id);
      setTestMsg(res.success ? '✅ 연결 성공' : `❌ ${res.message}`);
    } catch {
      setTestMsg('❌ 연결 테스트 실패');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`"${config.name}" 설정을 삭제하시겠습니까?`)) return;
    try {
      await remove.mutateAsync(config.id);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  return (
    <>
      <div className="border rounded-lg p-4 space-y-3 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{config.name}</h3>
            {config.isActive && (
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                활성
              </span>
            )}
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${badge.cls}`}>
              {badge.label}
            </span>
          </div>
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <span className="font-medium">URL:</span> {config.tenantUrl}
          </p>
          <p>
            <span className="font-medium">Client ID:</span> {config.clientId}
          </p>
          {config.lastTestedAt && (
            <p className="text-xs text-gray-400">
              마지막 테스트: {new Date(config.lastTestedAt).toLocaleString('ko-KR')}
            </p>
          )}
        </div>

        {testMsg && <p className="text-sm">{testMsg}</p>}

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleTest}
            disabled={testConnection.isPending}
            className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            {testConnection.isPending ? '테스트 중...' : '연결 테스트'}
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
          >
            수정
          </button>
          {!config.isActive && (
            <button
              onClick={() => activate.mutate(config.id)}
              disabled={activate.isPending}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              활성으로 전환
            </button>
          )}
          {!config.isActive && (
            <button
              onClick={handleDelete}
              disabled={remove.isPending}
              className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 disabled:opacity-50"
            >
              삭제
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <TenantConfigForm config={config} onClose={() => setShowForm(false)} />
      )}
    </>
  );
}
