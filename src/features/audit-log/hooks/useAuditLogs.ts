import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { AuditLogFilter, AuditLogResult } from '@/types/audit';

export function useAuditLogs(filter: AuditLogFilter) {
  return useQuery<AuditLogResult>({
    queryKey: ['audit-logs', filter],
    queryFn: async () => {
      const { data } = await axios.get('/api/audit-logs', { params: filter });
      return data;
    },
    staleTime: 10_000,
  });
}
