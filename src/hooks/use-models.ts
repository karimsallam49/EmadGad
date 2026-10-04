import { useQuery } from '@tanstack/react-query';
import { getModels } from '@/lib/api';

export const modelsKeys = {
  all: ['models'] as const,
  byBrand: (brandId: number) => [...modelsKeys.all, brandId] as const,
};

export function useModels(brandId: number | null) {
  return useQuery({
    queryKey: modelsKeys.byBrand(brandId ?? -1),
    queryFn: () => {
      if (brandId == null) throw new Error('brandId is required');
      return getModels(brandId);
    },
    enabled: brandId != null,
  });
}
