import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/lib/api';

export const productsKeys = {
  all: ['products'] as const,
  list: (query?: { brand?: string; category?: string }) =>
    [...productsKeys.all, query] as const,
};

export function useProducts(query?: { brand?: string; category?: string }) {
  return useQuery({
    queryKey: productsKeys.list(query),
    queryFn: () => getProducts(query),
  });
}
