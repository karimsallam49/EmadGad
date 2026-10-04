import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth';
import { useIdleReady } from '@/hooks/use-idle-ready';
import {
  deleteNotification,
  getUnreadNotificationCount,
  getUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/api';

export const notificationKeys = {
  all: ['user-notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
  unread: () => [...notificationKeys.all, 'unread'] as const,
};

export function useUnreadCount() {
  const { user } = useAuth();
  const idle = useIdleReady();
  return useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: getUnreadNotificationCount,
    enabled: !!user && idle,
    refetchInterval: 60_000,
  });
}

/** Cursor-paginated notification list — only runs while `enabled` (panel open) */
export function useUserNotifications(enabled: boolean) {
  const { user } = useAuth();
  return useInfiniteQuery({
    queryKey: notificationKeys.list(),
    queryFn: ({ pageParam }) => getUserNotifications({ per_page: 20, after_id: pageParam || undefined }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const items = lastPage.data;
      if (items.length < 20) return undefined;
      return items[items.length - 1]?.id;
    },
    enabled: enabled && !!user,
  });
}

function useInvalidateNotifications() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: notificationKeys.all });
}

export function useMarkNotificationRead() {
  const invalidate = useInvalidateNotifications();
  return useMutation({ mutationFn: markNotificationRead, onSettled: invalidate });
}

export function useMarkAllNotificationsRead() {
  const invalidate = useInvalidateNotifications();
  return useMutation({ mutationFn: markAllNotificationsRead, onSettled: invalidate });
}

export function useDeleteNotification() {
  const invalidate = useInvalidateNotifications();
  return useMutation({ mutationFn: deleteNotification, onSettled: invalidate });
}
