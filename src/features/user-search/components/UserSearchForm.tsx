'use client';

import { useState } from 'react';
import type { UserSearchParams } from '@/types/scim';

interface Props {
  onSearch: (params: UserSearchParams) => void;
}

export default function UserSearchForm({ onSearch }: Props) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ q: q || undefined, status, page: 1, pageSize: 20 });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end">
      <div className="flex-1">
        <input
          className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="이메일, 이름, 사용자명으로 검색..."
        />
      </div>
      <select
        className="border rounded-lg px-3 py-2 text-sm"
        value={status}
        onChange={(e) => setStatus(e.target.value as typeof status)}
      >
        <option value="all">전체 상태</option>
        <option value="active">활성</option>
        <option value="inactive">비활성</option>
      </select>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
      >
        검색
      </button>
    </form>
  );
}
