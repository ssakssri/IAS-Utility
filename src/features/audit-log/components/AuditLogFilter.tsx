'use client';

import { useState } from 'react';
import type { AuditLogFilter } from '@/types/audit';

interface Props {
  onFilter: (filter: AuditLogFilter) => void;
}

const ACTION_OPTIONS = [
  { value: '', label: '전체 작업' },
  { value: 'PASSWORD_RESET', label: '패스워드 리셋' },
  { value: 'PASSWORD_RESET_EMAIL', label: '리셋 이메일' },
  { value: 'BULK_PASSWORD_RESET', label: '일괄 리셋' },
  { value: 'BULK_PASSWORD_RESET_EMAIL', label: '일괄 리셋 이메일' },
  { value: 'STATUS_CHANGE', label: '상태 변경' },
];

export default function AuditLogFilter({ onFilter }: Props) {
  const [adminEmail, setAdminEmail] = useState('');
  const [action, setAction] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filter: AuditLogFilter = {};
    if (adminEmail.trim()) filter.adminEmail = adminEmail.trim();
    if (action) filter.action = action as AuditLogFilter['action'];
    if (startDate) filter.startDate = startDate;
    if (endDate) filter.endDate = endDate;
    onFilter(filter);
  };

  const handleReset = () => {
    setAdminEmail('');
    setAction('');
    setStartDate('');
    setEndDate('');
    onFilter({});
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <input
          type="text"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          placeholder="관리자 이메일"
          className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {ACTION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2 mt-3">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          검색
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 border text-sm rounded hover:bg-gray-50 transition-colors"
        >
          초기화
        </button>
      </div>
    </form>
  );
}
