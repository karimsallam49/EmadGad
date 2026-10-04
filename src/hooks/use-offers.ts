import { useQuery } from '@tanstack/react-query';
import { getOffer, getOffers } from '@/lib/api';

export const offersKeys = {
  all: ['offers'] as const,
  list: (query?: { business_id?: number; location_id?: number }) => [...offersKeys.all, query] as const,
  detail: (id: number) => [...offersKeys.all, 'detail', id] as const,
};

export function useOffers(query: { business_id?: number; location_id?: number } = { business_id: 1 }) {
  return useQuery({
    queryKey: offersKeys.list(query),
    queryFn: () => getOffers(query),
  });
}

/** Single offer — returns the raw model (media are storage paths, discounts in *_type/*_value columns) */
export function useOffer(id: number | null | undefined, businessId = 1) {
  return useQuery({
    queryKey: offersKeys.detail(id ?? 0),
    queryFn: () => getOffer(id!, businessId),
    enabled: !!id,
  });
}
