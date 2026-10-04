import { useMutation, useQuery } from '@tanstack/react-query';
import {
  getEcomPaymentStatus,
  payEcomOrder,
  type EcomPayOrderBody,
} from '@/lib/api';

export const orderPaymentKeys = {
  all: ['ecom-payment'] as const,
  status: (paymentId: number) => [...orderPaymentKeys.all, 'status', paymentId] as const,
};

/** POST ecommerce/orders/{id}/pay — returns a webview URL (web) or gateway session (sdk) */
export function usePayEcomOrder() {
  return useMutation({
    mutationFn: ({ id, ...body }: { id: number } & EcomPayOrderBody) => payEcomOrder(id, body),
  });
}

/** Polls the payment status until it resolves — used after the payment webview closes */
export function useEcomPaymentStatus(paymentId: number | null | undefined, poll = true) {
  return useQuery({
    queryKey: orderPaymentKeys.status(paymentId ?? 0),
    queryFn: () => getEcomPaymentStatus(paymentId!),
    enabled: !!paymentId,
    refetchInterval: (query) => {
      if (!poll || query.state.status === 'error') return false;
      const d = query.state.data;
      if (d?.is_paid) return false;
      if (d?.payment_status === 'failed' || d?.payment_status === 'payment_failed') return false;
      return 4000;
    },
    retry: false,
  });
}
