import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { TenantConfig, CreateTenantConfigInput, UpdateTenantConfigInput } from '@/types/config';

export function useTenantConfigs() {
  return useQuery<TenantConfig[]>({
    queryKey: ['tenant-configs'],
    queryFn: () => axios.get('/api/config/tenant').then((r) => r.data),
  });
}

export function useTenantConfigMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['tenant-configs'] });

  const create = useMutation<TenantConfig, Error, CreateTenantConfigInput>({
    mutationFn: (input) => axios.post('/api/config/tenant', input).then((r) => r.data),
    onSuccess: invalidate,
  });

  const update = useMutation<TenantConfig, Error, { id: string } & UpdateTenantConfigInput>({
    mutationFn: ({ id, ...input }) =>
      axios.put(`/api/config/tenant/${id}`, input).then((r) => r.data),
    onSuccess: invalidate,
  });

  const remove = useMutation<void, Error, string>({
    mutationFn: (id) => axios.delete(`/api/config/tenant/${id}`).then((r) => r.data),
    onSuccess: invalidate,
  });

  const activate = useMutation<void, Error, string>({
    mutationFn: (id) => axios.post(`/api/config/tenant/${id}/activate`).then((r) => r.data),
    onSuccess: invalidate,
  });

  const testConnection = useMutation<{ success: boolean; message: string }, Error, string>({
    mutationFn: (id) => axios.post(`/api/config/tenant/${id}/test`).then((r) => r.data),
    onSuccess: invalidate,
  });

  return { create, update, remove, activate, testConnection };
}
