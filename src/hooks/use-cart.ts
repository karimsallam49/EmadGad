import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addEcomCartItem,
  clearEcomCart,
  deleteEcomCartItem,
  getEcomCart,
  updateEcomCartItem,
} from '@/lib/api';
import type { EcomAddCartItemBody, EcomCartModel, EcomUpdateCartItemBody } from '@/types/api';

export const cartKeys = {
  all: ['ecom-cart'] as const,
};

export function useServerCart(enabled: boolean) {
  return useQuery({
    queryKey: cartKeys.all,
    queryFn: getEcomCart,
    enabled,
    staleTime: 30_000,
  });
}

/** Every mutation returns the full updated cart — swap the cache with it */
function useCartMutation<TVars>(
  fn: (vars: TVars) => Promise<EcomCartModel>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (cart) => {
      queryClient.setQueryData(cartKeys.all, cart);
    },
    onError: (err) => console.error('cart mutation failed:', err),
  });
}

export function useAddCartItem() {
  return useCartMutation((body: EcomAddCartItemBody) => addEcomCartItem(body));
}

export function useUpdateCartItem() {
  return useCartMutation(({ id, ...body }: { id: number } & EcomUpdateCartItemBody) =>
    updateEcomCartItem(id, body),
  );
}

export function useDeleteCartItem() {
  return useCartMutation((id: number) => deleteEcomCartItem(id));
}

export function useClearServerCart() {
  return useCartMutation(() => clearEcomCart());
}
