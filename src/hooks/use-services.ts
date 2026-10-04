import { useQuery } from '@tanstack/react-query';
import { getServices, getServicesGrouped } from '@/lib/api';

export const servicesKeys = {
  all: ['services'] as const,
  byLocation: (locationId: number) => [...servicesKeys.all, locationId] as const,
  byGroup: (locationIds: number[]) => [...servicesKeys.all, 'group', locationIds.join(',')] as const,
};

export function useServices(locationId: number | null, enabled = true) {
  return useQuery({
    queryKey: servicesKeys.byLocation(locationId ?? -1),
    queryFn: () => getServices(locationId != null ? { location_id: locationId } : undefined),
    enabled: locationId != null && enabled,
  });
}

/** Services keyed by location id — used when the picked branch is a master group */
export function useGroupServices(locationIds: number[] | null, enabled = true) {
  return useQuery({
    queryKey: servicesKeys.byGroup(locationIds ?? []),
    queryFn: () => getServicesGrouped(locationIds ?? []),
    enabled: !!locationIds?.length && enabled,
  });
}
