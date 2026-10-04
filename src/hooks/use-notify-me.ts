import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth';
import { useIdleReady } from '@/hooks/use-idle-ready';
import {
  getNotifyMeSubscriptions,
  subscribeNotifyMe,
  unsubscribeNotifyMe,
} from '@/lib/api';

export const notifyMeKeys = {
  all: ['notify-me'] as const,
};

export function useNotifyMeSubscriptions() {
  const { user } = useAuth();
  const idle = useIdleReady();
  return useQuery({
    queryKey: notifyMeKeys.all,
    queryFn: getNotifyMeSubscriptions,
    enabled: !!user && idle,
    staleTime: 30_000,
  });
}

export function useToggleNotifyMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      variationId,
      subscribed,
    }: {
      productId: number;
      variationId?: number;
      subscribed: boolean;
    }) =>
      subscribed
        ? unsubscribeNotifyMe(productId, variationId)
        : subscribeNotifyMe(productId, variationId),
    onSettled: () => qc.invalidateQueries({ queryKey: notifyMeKeys.all }),
  });
}
