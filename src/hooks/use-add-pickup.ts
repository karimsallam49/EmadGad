import { useMutation } from '@tanstack/react-query';
import { addBookingPickup, type AddBookingPickupBody } from '@/lib/api';

export function useAddPickup() {
  return useMutation({
    mutationFn: (body: AddBookingPickupBody) => addBookingPickup(body),
  });
}
