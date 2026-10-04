import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelEcomOrder,
  createEcomOrder,
  getEcomOrder,
  getEcomOrders,
  type CreateEcomOrderBody,
} from '@/lib/api';

export const ecomOrdersKeys = {
  all: ['ecom-orders'] as const,
  list: (query?: { order_filter?: 'ongoing' | 'history'; per_page?: number; page?: number }) =>
    [...ecomOrdersKeys.all, 'list', query] as const,
  detail: (id: number) => [...ecomOrdersKeys.all, 'detail', id] as const,
};

export function useEcomOrders(
  query: { order_filter?: 'ongoing' | 'history'; per_page?: number; page?: number } = {},
  enabled = true,
) {
  return useQuery({
    queryKey: ecomOrdersKeys.list(query),
    queryFn: () => getEcomOrders(query),
    enabled,
  });
}

export function useEcomOrder(id: number | null | undefined) {
  return useQuery({
    queryKey: ecomOrdersKeys.detail(id ?? 0),
    queryFn: () => getEcomOrder(id!),
    enabled: !!id,
  });
}

export function useCreateEcomOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateEcomOrderBody) => createEcomOrder(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ecomOrdersKeys.all });
    },
  });
}

export function useCancelEcomOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: number; note?: string }) => cancelEcomOrder(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ecomOrdersKeys.all });
    },
  });
}
