import { useQuery } from '@tanstack/react-query';
import { getDeliveryAreas } from '@/lib/api';

export const deliveryAreasKeys = {
  all: ['delivery-areas'] as const,
};

export function useDeliveryAreas(enabled = true) {
  return useQuery({
    queryKey: deliveryAreasKeys.all,
    queryFn: getDeliveryAreas,
    enabled,
  });
}
