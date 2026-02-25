'use client';

type UserStatus = 'active' | 'inactive' | 'locked';

interface Props {
  status: UserStatus;
}

const STATUS_CONFIG: Record<UserStatus, { label: string; cls: string }> = {
  active: { label: '활성', cls: 'bg-green-100 text-green-800' },
  inactive: { label: '비활성', cls: 'bg-gray-100 text-gray-600' },
  locked: { label: '잠김', cls: 'bg-red-100 text-red-800' },
};

export default function UserStatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.inactive;
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.cls}`}>
      {config.label}
    </span>
  );
}
