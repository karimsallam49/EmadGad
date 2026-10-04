import { useQuery } from '@tanstack/react-query';
import { getEcomPaymentMethods } from '@/lib/api';

export const paymentMethodsKeys = {
  all: ['ecom-payment-methods'] as const,
  list: (businessId: number) => [...paymentMethodsKeys.all, businessId] as const,
};

export function usePaymentMethods(businessId = 1) {
  return useQuery({
    queryKey: paymentMethodsKeys.list(businessId),
    queryFn: () => getEcomPaymentMethods(businessId),
  });
}
