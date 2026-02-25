'use client';

import Link from 'next/link';
import type { IasUser } from '@/types/scim';
import { useUserSelectionStore } from '../store/userSelectionStore';

interface Props {
  users: IasUser[];
}

function StatusBadge({ status }: { status: IasUser['status'] }) {
  const cls = status === 'active'
    ? 'bg-green-100 text-green-800'
    : 'bg-gray-100 text-gray-600';
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${cls}`}>
      {status === 'active' ? '활성' : '비활성'}
    </span>
  );
}

function PasswordStatusBadge({ passwordStatus }: { passwordStatus: IasUser['passwordStatus'] }) {
  if (!passwordStatus) return <span className="text-gray-400">-</span>;
  const map: Record<NonNullable<IasUser['passwordStatus']>, { cls: string; label: string }> = {
    initial:  { cls: 'bg-yellow-100 text-yellow-800', label: '초기' },
    enabled:  { cls: 'bg-green-100 text-green-800',  label: '활성화' },
    disabled: { cls: 'bg-red-100 text-red-700',      label: '비활성화' },
    locked:   { cls: 'bg-red-100 text-red-700',      label: '잠금' },
  };
  const { cls, label } = map[passwordStatus];
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${cls}`}>
      {label}
    </span>
  );
}

export default function UserTable({ users }: Props) {
  const { selectedIds, toggleUser, selectAll, clearSelection } = useUserSelectionStore();
  const allSelected = users.length > 0 && users.every((u) => selectedIds.has(u.id));

  const handleSelectAll = () => {
    if (allSelected) clearSelection();
    else selectAll(users);
  };

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="w-10 px-4 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleSelectAll}
                className="rounded"
              />
            </th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">사용자 ID</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">이메일</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">이름</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">상태</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">패스워드 상태</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">마지막 로그인</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(user.id)}
                  onChange={() => toggleUser(user)}
                  className="rounded"
                />
              </td>
              <td className="px-4 py-3 text-gray-500 font-mono text-xs">{user.userName}</td>
              <td className="px-4 py-3">
                <Link href={`/users/${user.id}`} className="text-blue-600 hover:underline">
                  {user.email}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-700">{user.displayName}</td>
              <td className="px-4 py-3">
                <StatusBadge status={user.status} />
              </td>
              <td className="px-4 py-3">
                <PasswordStatusBadge passwordStatus={user.passwordStatus} />
              </td>
              <td className="px-4 py-3 text-gray-500">
                {user.lastLoginTime
                  ? new Date(user.lastLoginTime).toLocaleString('ko-KR')
                  : '-'}
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                검색 결과가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
