import { useQuery } from '@tanstack/react-query';
import { getEcomLoyalty } from '@/lib/api';

export const ecomLoyaltyKeys = {
  all: ['ecom-loyalty'] as const,
};

export function useEcomLoyalty(enabled = true) {
  return useQuery({
    queryKey: ecomLoyaltyKeys.all,
    queryFn: getEcomLoyalty,
    enabled,
    retry: false,
  });
}
