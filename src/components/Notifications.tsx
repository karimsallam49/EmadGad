import { useState } from 'react';
import { Link } from 'react-router';
import {
  Bell,
  BadgePercent,
  Package,
  Wrench,
  Check,
  CheckCheck,
  Trash2,
  Loader2,
} from 'lucide-react';
import { useLang } from '@/i18n';
import { useAuth } from '@/auth';
import { useUnreadCount, useUserNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useDeleteNotification } from '@/hooks/use-notifications';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import type { UserNotificationModel } from '@/lib/api';

function notifIcon(type?: string) {
  switch (type) {
    case 'offer': return BadgePercent;
    case 'order': return Package;
    case 'booking': case 'service': return Wrench;
    default: return Bell;
  }
}

function notifLink(n: UserNotificationModel): string | null {
  if (n.type === 'offer' && n.reference_id) return `/offers/${n.reference_id}`;
  if (n.type === 'order' || n.type === 'booking') return '/profile';
  return null;
}

function timeAgo(iso: string | undefined, isAr: boolean, num: (n: number) => string) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso.replace(' ', 'T')).getTime();
  const mins = Math.max(0, Math.floor(diff / 60000));
  if (mins < 1) return isAr ? 'الآن' : 'now';
  if (mins < 60) return isAr ? `من ${num(mins)} دقيقة` : `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return isAr ? `من ${num(hours)} ساعة` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return isAr ? `من ${num(days)} يوم` : `${days}d ago`;
}

export function NotificationBell() {
  const { user } = useAuth();
  const { num } = useLang();
  const [open, setOpen] = useState(false);
  const { data: unread } = useUnreadCount();

  if (!user) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-border text-ink hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {(unread ?? 0) > 0 && (
          <span className="absolute -top-1 -end-1 min-w-[20px] h-5 px-1 rounded-full bg-coal text-brand text-xs font-black flex items-center justify-center border-2 border-brand">
            {num(unread!)}
          </span>
        )}
      </button>
      <NotificationsPanel open={open} onOpenChange={setOpen} />
    </>
  );
}

export function NotificationsPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { t, isAr, num } = useLang();
  const list = useUserNotifications(open);
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const del = useDeleteNotification();

  const notifications = [
    ...new Map(
      (list.data?.pages ?? []).flatMap((p) => p.data).map((n) => [n.id, n]),
    ).values(),
  ];
  const hasUnread = notifications.some((n) => !n.is_read);

  const body = (
    <>
      <SheetHeader className="p-5 pb-3 border-b-2 border-border">
        <div className="flex items-center justify-between">
          <SheetTitle className="text-xl font-black text-ink">{t('الإشعارات')}</SheetTitle>
          {hasUnread && (
            <button
              type="button"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-ink/70 hover:text-ink disabled:opacity-50"
            >
              {markAll.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
              {t('تعليم الكل كمقروء')}
            </button>
          )}
        </div>
        <SheetDescription className="sr-only">{t('إشعارات حسابك')}</SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto">
        {list.isLoading && (
          <div className="p-5 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border-2 border-border p-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-2/3 mb-2" />
                <div className="h-3 bg-muted rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {!list.isLoading && notifications.length === 0 && (
          <div className="p-10 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-ink font-bold">{t('لا توجد إشعارات')}</p>
            <p className="text-muted-foreground text-sm mt-1">{t('لما يوصلك جديد هيبقى هنا')}</p>
          </div>
        )}

        <ul className="p-4 space-y-2">
          {notifications.map((n) => {
            const Icon = notifIcon(n.type);
            const href = notifLink(n);
            const inner = (
              <div className="flex gap-3">
                <span className={`shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${n.is_read ? 'bg-muted text-muted-foreground' : 'bg-brand text-ink'}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-extrabold truncate ${n.is_read ? 'text-ink/70' : 'text-ink'}`}>{n.title}</p>
                  {n.body && <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{timeAgo(n.created_at, isAr, num)}</p>
                </div>
                {!n.is_read && <span className="shrink-0 h-2.5 w-2.5 rounded-full bg-brand mt-1.5" />}
              </div>
            );
            return (
              <li key={n.id} className={`rounded-xl border-2 p-3 transition-colors ${n.is_read ? 'border-border bg-white' : 'border-brand/60 bg-brand/10'}`}>
                {href ? <Link to={href} onClick={() => { onOpenChange(false); if (!n.is_read) markRead.mutate(n.id); }}>{inner}</Link> : inner}
                <div className="flex justify-end gap-1 mt-2">
                  {!n.is_read && (
                    <button
                      type="button"
                      onClick={() => markRead.mutate(n.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-ink/70 hover:text-ink px-2 py-1 rounded-lg hover:bg-muted"
                    >
                      <Check className="h-3.5 w-3.5" /> {t('تم القراءة')}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => del.mutate(n.id)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-red-500/80 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> {t('حذف')}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        {list.hasNextPage && (
          <div className="p-4 pt-0">
            <button
              type="button"
              onClick={() => list.fetchNextPage()}
              disabled={list.isFetchingNextPage}
              className="w-full rounded-xl border-2 border-border py-2.5 font-bold text-ink hover:bg-muted disabled:opacity-50"
            >
              {list.isFetchingNextPage ? t('جاري التحميل...') : t('عرض المزيد')}
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[92vw] max-w-md p-0 flex flex-col">{body}</SheetContent>
    </Sheet>
  );
}
