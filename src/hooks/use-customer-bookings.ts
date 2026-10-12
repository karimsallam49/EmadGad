import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth';
import { getCustomerBookings } from '@/lib/api';

export const customerBookingsKeys = {
  all: ['customer-bookings'] as const,
};

export function useCustomerBookings(enabled = true) {
  const { user } = useAuth();
  return useQuery({
    queryKey: customerBookingsKeys.all,
    queryFn: getCustomerBookings,
    enabled: enabled && !!user,
    staleTime: 60_000,
    retry: false,
  });
}
