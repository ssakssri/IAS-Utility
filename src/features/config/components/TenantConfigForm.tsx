'use client';

import { useState } from 'react';
import type { TenantConfig } from '@/types/config';
import { useTenantConfigMutations } from '../hooks/useTenantConfigs';

interface Props {
  config?: TenantConfig;
  onClose: () => void;
}

export default function TenantConfigForm({ config, onClose }: Props) {
  const isEdit = !!config;
  const { create, update } = useTenantConfigMutations();

  const [form, setForm] = useState({
    name: config?.name ?? '',
    tenantUrl: config?.tenantUrl ?? '',
    clientId: config?.clientId ?? '',
    clientSecret: '',
    authType: config?.authType ?? 'basic',
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isEdit) {
        const updateData: Record<string, string> = {
          name: form.name,
          tenantUrl: form.tenantUrl,
          clientId: form.clientId,
          authType: form.authType,
        };
        if (form.clientSecret) updateData.clientSecret = form.clientSecret;
        await update.mutateAsync({ id: config.id, ...updateData });
      } else {
        if (!form.clientSecret) {
          setError('Client Secret은 필수입니다.');
          return;
        }
        await create.mutateAsync(form as Required<typeof form>);
      }
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const isPending = create.isPending || update.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h2 className="text-lg font-semibold">{isEdit ? 'Tenant 설정 수정' : '새 Tenant 추가'}</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름 (식별용)</label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Production"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tenant URL</label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              value={form.tenantUrl}
              onChange={(e) => setForm({ ...form, tenantUrl: e.target.value })}
              placeholder="https://xxxxx.accounts.ondemand.com"
              type="url"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              placeholder="scim-client-id"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Secret
              {isEdit && (
                <span className="text-gray-400 text-xs ml-1">
                  (변경하지 않으려면 빈칸)
                </span>
              )}
            </label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              type="password"
              value={form.clientSecret}
              onChange={(e) => setForm({ ...form, clientSecret: e.target.value })}
              placeholder="••••••••••••"
              required={!isEdit}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">인증 방식</label>
            <select
              className="w-full border rounded px-3 py-2 text-sm"
              value={form.authType}
              onChange={(e) => setForm({ ...form, authType: e.target.value as 'basic' | 'certificate' })}
            >
              <option value="basic">Basic Auth</option>
              <option value="certificate">Certificate</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
