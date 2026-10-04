import { useQuery } from '@tanstack/react-query';
import { getProduct } from '@/lib/api';

export const productKeys = {
  all: ['product'] as const,
  byId: (id: number) => [...productKeys.all, id] as const,
};

export function useProduct(id: number | null) {
  return useQuery({
    queryKey: productKeys.byId(id ?? -1),
    queryFn: () => getProduct(id!),
    enabled: id != null && Number.isFinite(id),
  });
}
