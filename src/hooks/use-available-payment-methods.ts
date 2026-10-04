import { useQuery } from '@tanstack/react-query';
import { getAvailablePaymentMethods } from '@/lib/api';

export const availablePaymentMethodsKeys = {
  all: ['available-payment-methods'] as const,
};

/** Public API — admin-configured payment methods (Aman, Vodafone Cash, InstaPay…) */
export function useAvailablePaymentMethods(businessId = 1) {
  return useQuery({
    queryKey: [...availablePaymentMethodsKeys.all, businessId],
    queryFn: () => getAvailablePaymentMethods(businessId),
    staleTime: 5 * 60_000,
  });
}
