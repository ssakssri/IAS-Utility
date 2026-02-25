'use client';

import type { AuditLog } from '@/types/audit';

const ACTION_LABELS: Record<string, string> = {
  PASSWORD_RESET: '패스워드 리셋',
  PASSWORD_RESET_EMAIL: '리셋 이메일',
  BULK_PASSWORD_RESET: '일괄 리셋',
  BULK_PASSWORD_RESET_EMAIL: '일괄 리셋 이메일',
  STATUS_CHANGE: '상태 변경',
};

const STATUS_CLS: Record<string, string> = {
  SUCCESS: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
};

export default function AuditLogTable({ logs }: { logs: AuditLog[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-600">일시</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">관리자</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">작업</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">대상 계정</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">상태</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                {new Date(log.createdAt).toLocaleString('ko-KR')}
              </td>
              <td className="px-4 py-3 text-gray-700">{log.adminEmail}</td>
              <td className="px-4 py-3 text-gray-700">
                {ACTION_LABELS[log.action] ?? log.action}
              </td>
              <td className="px-4 py-3 text-gray-700">{log.targetUserName}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_CLS[log.status] ?? ''}`}>
                  {log.status}
                </span>
                {log.errorMessage && (
                  <p className="text-xs text-red-500 mt-0.5">{log.errorMessage}</p>
                )}
              </td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                이력이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
