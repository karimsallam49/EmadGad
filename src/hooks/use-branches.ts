import { useQuery } from '@tanstack/react-query';
import { getBranches } from '@/lib/api';

export const branchesKeys = {
  all: ['branches'] as const,
};

export function useBranches() {
  return useQuery({
    queryKey: branchesKeys.all,
    queryFn: () => getBranches(),
  });
}
