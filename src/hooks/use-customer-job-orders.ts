import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth';
import { checkJobOrderPhone, getCustomerJobOrders } from '@/lib/api';

export const customerJobOrdersKeys = {
  all: ['customer-job-orders'] as const,
  check: (id: number) => [...customerJobOrdersKeys.all, 'check', id] as const,
};

/** List of the logged-in customer's workshop job orders */
export function useCustomerJobOrders(enabled = true) {
  const { user } = useAuth();
  return useQuery({
    queryKey: customerJobOrdersKeys.all,
    queryFn: getCustomerJobOrders,
    enabled: enabled && !!user,
    staleTime: 60_000,
    retry: false,
  });
}

/** Details are gated by a phone check — the server verifies the last 4 digits of the customer's mobile */
export function useJobOrderPhoneCheck(id: number | null) {
  const { user } = useAuth();
  const last4 = (user?.mobile ?? '').replace(/\D/g, '').slice(-4);
  return useQuery({
    queryKey: [...customerJobOrdersKeys.check(id ?? 0), last4],
    queryFn: () => checkJobOrderPhone(id!, last4),
    enabled: id != null && last4.length === 4,
    retry: false,
  });
}
