import { useMutation } from '@tanstack/react-query';
import { sellProforma, type SellProformaBody } from '@/lib/api';

export function useSellProforma() {
  return useMutation({
    mutationFn: (data: SellProformaBody) => sellProforma(data),
  });
}
