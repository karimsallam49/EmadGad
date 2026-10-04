import { useMutation } from '@tanstack/react-query';
import { addCustomerCar, type AddCustomerCarBody } from '@/lib/api';

export function useAddCustomerCar() {
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: AddCustomerCarBody }) => addCustomerCar(id, body),
  });
}
