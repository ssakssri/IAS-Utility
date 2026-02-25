'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { IasUser } from '@/types/scim';
import UserDetailCard from '@/features/user-search/components/UserDetailCard';
import PasswordResetModal from '@/features/password-reset/components/PasswordResetModal';

async function fetchUser(id: string): Promise<IasUser> {
  const res = await fetch(`/api/scim/users/${id}`);
  if (!res.ok) throw new Error('사용자를 불러올 수 없습니다.');
  return res.json();
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [showResetModal, setShowResetModal] = useState(false);

  const { data: user, isLoading, isError, refetch } = useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">불러오는 중...</div>
    );
  }

  if (isError || !user) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← 돌아가기
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          사용자 정보를 불러올 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <button
        onClick={() => router.back()}
        className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        ← 목록으로
      </button>

      <h1 className="text-xl font-semibold text-gray-900">사용자 상세</h1>

      <UserDetailCard user={user} onStatusChanged={() => refetch()} />

      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">패스워드 관리</h3>
        <button
          onClick={() => setShowResetModal(true)}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          패스워드 관리
        </button>
      </div>

      {showResetModal && (
        <PasswordResetModal
          userId={user.id}
          userEmail={user.email}
          onClose={() => setShowResetModal(false)}
        />
      )}
    </div>
  );
}
