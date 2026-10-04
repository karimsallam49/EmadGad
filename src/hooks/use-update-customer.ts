import { useMutation } from '@tanstack/react-query';
import { updateCustomerBasicInfo } from '@/lib/api';

export function useUpdateCustomer() {
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: { first_name: string; last_name: string; mobile: string } }) =>
      updateCustomerBasicInfo(id, body),
  });
}
