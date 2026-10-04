import { useQuery } from '@tanstack/react-query';
import { getEcomInvoice, getEcomInvoices } from '@/lib/api';

export const ecomInvoicesKeys = {
  all: ['ecom-invoices'] as const,
  list: (query?: { payment_status?: string; invoice_type?: string; per_page?: number; page?: number }) =>
    [...ecomInvoicesKeys.all, 'list', query] as const,
  detail: (id: number) => [...ecomInvoicesKeys.all, 'detail', id] as const,
};

export function useEcomInvoices(
  query: { payment_status?: string; invoice_type?: string; per_page?: number; page?: number } = {},
  enabled = true,
) {
  return useQuery({
    queryKey: ecomInvoicesKeys.list(query),
    queryFn: () => getEcomInvoices(query),
    enabled,
  });
}

export function useEcomInvoice(id: number | null | undefined) {
  return useQuery({
    queryKey: ecomInvoicesKeys.detail(id ?? 0),
    queryFn: () => getEcomInvoice(id!),
    enabled: !!id,
  });
}
