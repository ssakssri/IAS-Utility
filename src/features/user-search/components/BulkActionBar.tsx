'use client';

import { useState } from 'react';
import { useUserSelectionStore } from '../store/userSelectionStore';
import BulkConfirmDialog from '../../password-reset/components/BulkConfirmDialog';

type Action = 'reset' | 'email' | null;

export default function BulkActionBar() {
  const { selectedUsers, clearSelection } = useUserSelectionStore();
  const [action, setAction] = useState<Action>(null);

  if (selectedUsers.length === 0) return null;

  return (
    <>
      <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
        <span className="text-sm font-medium text-blue-800">
          {selectedUsers.length}개 선택됨
        </span>
        <button
          onClick={() => setAction('reset')}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          패스워드 리셋
        </button>
        <button
          onClick={() => setAction('email')}
          className="px-3 py-1.5 text-sm border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
        >
          리셋 이메일 발송
        </button>
        <button
          onClick={clearSelection}
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
        >
          선택 해제
        </button>
      </div>

      {action && (
        <BulkConfirmDialog
          users={selectedUsers}
          actionType={action}
          onClose={() => {
            setAction(null);
            clearSelection();
          }}
        />
      )}
    </>
  );
}
