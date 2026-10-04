import { useNavigate } from 'react-router';
import { Bell, BellRing, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLang } from '@/i18n';
import { useAuth } from '@/auth';
import { useNotifyMeSubscriptions, useToggleNotifyMe } from '@/hooks/use-notify-me';

interface Props {
  productId?: number;
  variationId?: number;
  className?: string;
}

/** Bell CTA shown on out-of-stock products — guests get sent to login */
export function NotifyMeButton({ productId, variationId, className }: Props) {
  const { user } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const subs = useNotifyMeSubscriptions();
  const toggle = useToggleNotifyMe();

  const subscribed =
    !!productId &&
    (subs.data ?? []).some(
      (a) =>
        a.product_id === productId &&
        (variationId == null || a.variation_id == null || a.variation_id === variationId),
    );

  const onClick = () => {
    if (!user) {
      toast(t('سجّل دخولك الأول عشان نوصلك لما يرجع'));
      navigate('/login');
      return;
    }
    if (!productId || toggle.isPending) return;
    toggle.mutate(
      { productId, variationId, subscribed },
      {
        onSuccess: () =>
          toast.success(subscribed ? t('اتلغى التنبيه') : t('تمام! هننبهك أول ما المنتج يرجع')),
        onError: (e) => toast.error(e instanceof Error ? e.message : t('حصلت مشكلة — جرب تاني')),
      },
    );
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={toggle.isPending}
      className={
        className ??
        `w-full rounded-xl h-12 text-base font-black border-2 flex items-center justify-center gap-2 transition-colors ${
          subscribed
            ? 'bg-brand text-coal border-coal'
            : 'bg-white text-ink border-ink hover:bg-muted'
        }`
      }
    >
      {toggle.isPending ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : subscribed ? (
        <BellRing className="h-5 w-5" />
      ) : (
        <Bell className="h-5 w-5" />
      )}
      {subscribed ? t('هننبهك — إلغاء التنبيه') : t('نبهني لما يرجع')}
    </button>
  );
}
