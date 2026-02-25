'use client';

import { useState } from 'react';
import { usePasswordReset, useSendResetEmail } from '../hooks/usePasswordReset';
import { validatePassword } from '@/lib/password-policy';

interface Props {
  userId: string;
  userEmail: string;
  onClose: () => void;
}

export default function PasswordResetModal({ userId, userEmail, onClose }: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetMutation = usePasswordReset(userId);
  const emailMutation = useSendResetEmail(userId);

  const rules = [
    { ok: password.length >= 8, label: '8자 이상' },
    { ok: /[A-Z]/.test(password), label: '대문자' },
    { ok: /[a-z]/.test(password), label: '소문자' },
    { ok: /[0-9]/.test(password), label: '숫자' },
    { ok: /[!@#$%^&*]/.test(password), label: '특수문자' },
  ];

  const handleReset = async () => {
    const check = validatePassword(password);
    if (!check.valid) { setError(check.message ?? null); return; }
    try {
      await resetMutation.mutateAsync(password);
      setSuccess('패스워드가 리셋되었습니다.');
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleEmail = async () => {
    try {
      await emailMutation.mutateAsync();
      setSuccess('리셋 이메일이 발송되었습니다.');
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h2 className="text-lg font-semibold">패스워드 관리</h2>
        <p className="text-sm text-gray-600">대상: <strong>{userEmail}</strong></p>

        {success ? (
          <div className="space-y-4">
            <p className="text-green-700 bg-green-50 border border-green-200 rounded p-3 text-sm">
              ✅ {success}
            </p>
            <button onClick={onClose} className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
              닫기
            </button>
          </div>
        ) : (
          <>
            <div className="border-t pt-4 space-y-3">
              <h3 className="text-sm font-medium">직접 리셋</h3>
              <input
                type="password"
                className="w-full border rounded px-3 py-2 text-sm"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                placeholder="새 패스워드"
              />
              <div className="flex gap-3 text-xs">
                {rules.map((r) => (
                  <span key={r.label} className={r.ok ? 'text-green-600' : 'text-gray-400'}>
                    {r.ok ? '✓' : '○'} {r.label}
                  </span>
                ))}
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button
                onClick={handleReset}
                disabled={resetMutation.isPending}
                className="w-full px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
              >
                {resetMutation.isPending ? '리셋 중...' : '리셋 실행'}
              </button>
            </div>

            <div className="border-t pt-4 space-y-3">
              <h3 className="text-sm font-medium">이메일로 리셋 링크 발송</h3>
              <button
                onClick={handleEmail}
                disabled={emailMutation.isPending}
                className="w-full px-4 py-2 border text-sm rounded hover:bg-gray-50 disabled:opacity-50"
              >
                {emailMutation.isPending ? '발송 중...' : '리셋 이메일 발송'}
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={onClose} className="px-4 py-2 text-sm border rounded hover:bg-gray-50">
                취소
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
