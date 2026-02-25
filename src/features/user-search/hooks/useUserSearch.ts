import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { UserSearchParams, UserSearchResult } from '@/types/scim';

export function useUserSearch(params: UserSearchParams, enabled = true) {
  return useQuery<UserSearchResult>({
    queryKey: ['users', params],
    queryFn: async () => {
      const { data } = await axios.get('/api/scim/users', { params });
      return data;
    },
    enabled,
    staleTime: 30_000,
  });
}
