import { useQuery } from '@tanstack/react-query';
import { getBusinessLocations } from '@/lib/api';

export const businessLocationsKeys = {
  all: ['business-locations'] as const,
};

export function useBusinessLocations() {
  return useQuery({
    queryKey: businessLocationsKeys.all,
    queryFn: async () => {
      const res = await getBusinessLocations();
      return res.data ?? [];
    },
  });
}
