import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export function usePasswordReset(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newPassword: string) =>
      axios.post(`/api/scim/users/${userId}/reset-password`, { newPassword }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useSendResetEmail(userId: string) {
  return useMutation({
    mutationFn: () => axios.post(`/api/scim/users/${userId}/send-reset-email`).then((r) => r.data),
  });
}

export function useStatusChange(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (active: boolean) =>
      axios.patch(`/api/scim/users/${userId}/status`, { active }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
  });
}
