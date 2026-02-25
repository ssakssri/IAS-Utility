'use client';

import { useState } from 'react';
import type { UserSearchParams } from '@/types/scim';
import UserSearchForm from '@/features/user-search/components/UserSearchForm';
import UserTable from '@/features/user-search/components/UserTable';
import BulkActionBar from '@/features/user-search/components/BulkActionBar';
import { useUserSearch } from '@/features/user-search/hooks/useUserSearch';

export default function UsersPage() {
  const [params, setParams] = useState<UserSearchParams>({ page: 1, pageSize: 20 });

  const { data, isLoading, isError, error } = useUserSearch(params);

  const handleSearch = (searchParams: UserSearchParams) => {
    setParams({ ...searchParams, page: 1, pageSize: 20 });
  };

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">사용자 관리</h1>
        {data && (
          <span className="text-sm text-gray-500">
            전체 {data.totalCount.toLocaleString()}명
          </span>
        )}
      </div>

      <UserSearchForm onSearch={handleSearch} />

      <BulkActionBar />

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          오류: {(error as Error)?.message ?? '사용자 목록을 불러올 수 없습니다.'}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-400 text-sm">불러오는 중...</div>
      ) : (
        data && (
          <>
            <UserTable users={data.users} />
            {Math.ceil(data.totalCount / data.pageSize) > 1 && (
              <div className="flex justify-center gap-2 pt-2">
                {Array.from({ length: Math.ceil(data.totalCount / data.pageSize) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 text-sm rounded border transition-colors ${
                      page === params.page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )
      )}
    </div>
  );
}
