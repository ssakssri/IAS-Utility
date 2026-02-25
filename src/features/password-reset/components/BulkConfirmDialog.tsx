'use client';

import { useState } from 'react';
import type { IasUser } from '@/types/scim';
import { useBulkReset, useBulkResetEmail } from '../hooks/useBulkReset';
import { validatePassword } from '@/lib/password-policy';
import BulkProgressModal from './BulkProgressModal';

interface Props {
  users: IasUser[];
  actionType: 'reset' | 'email';
  onClose: () => void;
}

export default function BulkConfirmDialog({ users, actionType, onClose }: Props) {
  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [result, setResult] = useState<{ total: number; success: number; failed: number } | null>(null);
  const [processing, setProcessing] = useState(false);

  const bulkReset = useBulkReset();
  const bulkEmail = useBulkResetEmail();

  const isReset = actionType === 'reset';
  const PREVIEW = 3;

  const handleConfirm = async () => {
    if (isReset) {
      const check = validatePassword(password);
      if (!check.valid) { setPwError(check.message ?? null); return; }
    }

    setProcessing(true);
    try {
      const ids = users.map((u) => u.id);
      const res = isReset
        ? await bulkReset.mutateAsync({ userIds: ids, newPassword: password })
        : await bulkEmail.mutateAsync({ userIds: ids });
      setResult(res);
    } finally {
      setProcessing(false);
    }
  };

  if (result) {
    return (
      <BulkProgressModal
        total={result.total}
        success={result.success}
        failed={result.failed}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h2 className="text-lg font-semibold">
          {isReset ? '일괄 패스워드 리셋 확인' : '일괄 리셋 이메일 발송 확인'}
        </h2>

        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
          ⚠️ 다음 {users.length}개 계정에 작업을 수행합니다.
        </p>

        <ul className="text-sm text-gray-700 space-y-1">
          {users.slice(0, PREVIEW).map((u) => (
            <li key={u.id}>• {u.email}</li>
          ))}
          {users.length > PREVIEW && (
            <li className="text-gray-400">외 {users.length - PREVIEW}개</li>
          )}
        </ul>

        {isReset && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">새 패스워드</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2 text-sm"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPwError(null); }}
              placeholder="••••••••••••"
            />
            {pwError && <p className="text-sm text-red-600 mt-1">{pwError}</p>}
          </div>
        )}

        <p className="text-xs text-gray-400">이 작업은 즉시 적용되며 되돌릴 수 없습니다.</p>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded hover:bg-gray-50">
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={processing}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {processing ? '처리 중...' : `${users.length}개 계정 ${isReset ? '리셋' : '이메일 발송'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
