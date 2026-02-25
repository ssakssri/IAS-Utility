import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface BulkResetResult {
  total: number;
  success: number;
  failed: number;
  results: Array<{ userId: string; email: string; status: string; error?: string }>;
}

export function useBulkReset() {
  const queryClient = useQueryClient();
  return useMutation<BulkResetResult, Error, { userIds: string[]; newPassword: string }>({
    mutationFn: ({ userIds, newPassword }) =>
      axios.post('/api/scim/users/bulk-reset', { userIds, newPassword }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useBulkResetEmail() {
  return useMutation<BulkResetResult, Error, { userIds: string[] }>({
    mutationFn: ({ userIds }) =>
      axios.post('/api/scim/users/bulk-reset-email', { userIds }).then((r) => r.data),
  });
}
