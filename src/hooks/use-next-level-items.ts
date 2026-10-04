import { useQuery } from '@tanstack/react-query';
import { getCategoryItemsNextLevel } from '@/lib/api';

export const categoryItemKeys = {
  all: ['category-items'] as const,
  nextLevel: (itemId?: number) => [...categoryItemKeys.all, 'next-level', itemId] as const,
};

export function useNextLevelItems(itemId?: number) {
  return useQuery({
    queryKey: categoryItemKeys.nextLevel(itemId),
    queryFn: () => getCategoryItemsNextLevel(itemId!),
    enabled: itemId != null,
  });
}
