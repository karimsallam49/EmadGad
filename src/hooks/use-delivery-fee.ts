import { useQuery } from '@tanstack/react-query';
import { calculateDeliveryFee, getDeliveryFeeConfig } from '@/lib/api';

export const deliveryFeeKeys = {
  all: ['delivery-fee'] as const,
  config: (locationId?: number) => [...deliveryFeeKeys.all, 'config', locationId] as const,
  calculate: (query: {
    location_id?: number;
    distance?: number;
    area_id?: number;
    order_amount?: number;
  }) => [...deliveryFeeKeys.all, 'calculate', query] as const,
};

/** Branch delivery settings + general/branch areas */
export function useDeliveryFeeConfig(locationId?: number, enabled = true) {
  return useQuery({
    queryKey: deliveryFeeKeys.config(locationId),
    queryFn: () => getDeliveryFeeConfig(locationId),
    enabled,
  });
}

/** Expected delivery charge for display — mirrors the server-side calculation */
export function useDeliveryCharge(
  query: {
    location_id?: number;
    distance?: number;
    area_id?: number;
    order_amount?: number;
  },
  enabled = true,
) {
  return useQuery({
    queryKey: deliveryFeeKeys.calculate(query),
    queryFn: () => calculateDeliveryFee(query),
    enabled,
    staleTime: 30_000,
  });
}
