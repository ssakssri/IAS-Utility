'use client';

import { useState } from 'react';
import type { AuditLogFilter } from '@/types/audit';
import AuditLogFilterComponent from '@/features/audit-log/components/AuditLogFilter';
import AuditLogTable from '@/features/audit-log/components/AuditLogTable';
import { useAuditLogs } from '@/features/audit-log/hooks/useAuditLogs';

export default function AuditLogPage() {
  const [filter, setFilter] = useState<AuditLogFilter>({});
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useAuditLogs({ ...filter, page, pageSize: 30 });

  const handleFilter = (newFilter: AuditLogFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">감사 로그</h1>

      <AuditLogFilterComponent onFilter={handleFilter} />

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          감사 로그를 불러올 수 없습니다.
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-400 text-sm">불러오는 중...</div>
      ) : (
        data && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                전체 {data.totalCount.toLocaleString()}건
              </span>
            </div>

            <AuditLogTable logs={data.logs} />

            {Math.ceil(data.totalCount / data.pageSize) > 1 && (
              <div className="flex justify-center gap-2 pt-2">
                {Array.from({ length: Math.ceil(data.totalCount / data.pageSize) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1 text-sm rounded border transition-colors ${
                      p === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {p}
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
