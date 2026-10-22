import { useQuery } from '@tanstack/react-query';
import {
  getBestSellEcomProducts,
  getEcomSliders,
  getFeaturedEcomProducts,
  searchEcomProducts,
} from '@/lib/api';

export const homeContentKeys = {
  sliders: ['ecom-sliders'] as const,
  featured: ['ecom-products', 'featured'] as const,
  bestSell: ['ecom-products', 'best-sell'] as const,
  search: (q: string) => ['ecom-products', 'search', q] as const,
};

export function useEcomSliders() {
  return useQuery({
    queryKey: homeContentKeys.sliders,
    queryFn: () => getEcomSliders(1),
    staleTime: 5 * 60_000,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: homeContentKeys.featured,
    queryFn: () => getFeaturedEcomProducts(1),
    staleTime: 5 * 60_000,
  });
}

export function useBestSellProducts() {
  return useQuery({
    queryKey: homeContentKeys.bestSell,
    queryFn: () => getBestSellEcomProducts(1),
    staleTime: 5 * 60_000,
  });
}

/** product search — only fires at 2+ chars */
export function useEcomProductSearch(q: string, perPage = 10) {
  const query = q.trim();
  return useQuery({
    queryKey: homeContentKeys.search(query),
    queryFn: () => searchEcomProducts({ business_id: 1, q: query, per_page: perPage }),
    enabled: query.length >= 2,
  });
}
