'use client';

import type { IasUser } from '@/types/scim';
import { useStatusChange } from '@/features/password-reset/hooks/usePasswordReset';
import { useState } from 'react';

const STATUS_LABELS: Record<string, string> = {
  active: '활성',
  inactive: '비활성',
};

interface Props {
  user: IasUser;
  onStatusChanged?: () => void;
}

export default function UserDetailCard({ user, onStatusChanged }: Props) {
  const statusChange = useStatusChange(user.id);
  const [confirmToggle, setConfirmToggle] = useState(false);

  const isActive = user.active;

  const handleToggle = async () => {
    if (!confirmToggle) {
      setConfirmToggle(true);
      return;
    }
    try {
      await statusChange.mutateAsync(!isActive);
      onStatusChanged?.();
    } finally {
      setConfirmToggle(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{user.displayName}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <span
          className={`px-2.5 py-1 text-xs font-medium rounded-full ${
            isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {STATUS_LABELS[isActive ? 'active' : 'inactive']}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t pt-4 text-sm">
        <div>
          <span className="text-gray-500 block">사용자명</span>
          <span className="text-gray-900 font-medium">{user.userName}</span>
        </div>
        <div>
          <span className="text-gray-500 block">마지막 로그인</span>
          <span className="text-gray-900">
            {user.lastLoginTime
              ? new Date(user.lastLoginTime).toLocaleString('ko-KR')
              : '-'}
          </span>
        </div>
        <div>
          <span className="text-gray-500 block">이메일 인증</span>
          <span className="text-gray-900">{user.emailVerified ? '인증됨' : '미인증'}</span>
        </div>
        <div>
          <span className="text-gray-500 block">그룹</span>
          <span className="text-gray-900">
            {user.groups.length > 0 ? user.groups.join(', ') : '-'}
          </span>
        </div>
      </div>

      <div className="border-t pt-4">
        {confirmToggle ? (
          <div className="space-y-2">
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
              ⚠️ 계정을 {isActive ? '비활성화' : '활성화'}하시겠습니까?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleToggle}
                disabled={statusChange.isPending}
                className={`px-3 py-1.5 text-sm rounded text-white disabled:opacity-50 ${
                  isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {statusChange.isPending ? '처리 중...' : '확인'}
              </button>
              <button
                onClick={() => setConfirmToggle(false)}
                className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleToggle}
            className={`px-3 py-1.5 text-sm border rounded transition-colors ${
              isActive
                ? 'border-red-300 text-red-600 hover:bg-red-50'
                : 'border-green-300 text-green-600 hover:bg-green-50'
            }`}
          >
            {isActive ? '계정 비활성화' : '계정 활성화'}
          </button>
        )}
      </div>
    </div>
  );
}
