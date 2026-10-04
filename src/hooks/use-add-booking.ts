import { useMutation } from '@tanstack/react-query';
import { addBooking, type AddBookingBody } from '@/lib/api';

export function useAddBooking() {
  return useMutation({
    mutationFn: (body: AddBookingBody) => addBooking(body),
  });
}
