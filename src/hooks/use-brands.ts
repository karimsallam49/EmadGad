import { useQuery } from '@tanstack/react-query';
import { getBrands } from '@/lib/api';

export const brandsKeys = {
  all: ['brands'] as const,
};

export function useBrands() {
  return useQuery({
    queryKey: brandsKeys.all,
    queryFn: () => getBrands(),
  });
}
