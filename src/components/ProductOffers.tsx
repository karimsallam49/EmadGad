import { Link } from 'react-router';
import { ArrowLeft, BadgePercent, Gift, TicketPercent } from 'lucide-react';
import { useLang } from '@/i18n';
import { useOffers } from '@/hooks/use-offers';
import type { OfferModel } from '@/types/api';

function isActive(o: OfferModel) {
  const now = Date.now();
  if (o.starts_at && new Date(o.starts_at.replace(' ', 'T')).getTime() > now) return false;
  if (o.ends_at && new Date(o.ends_at.replace(' ', 'T')).getTime() < now) return false;
  return true;
}

interface Props {
  productId?: number;
  variationId?: number;
}

/** Offers that involve this product — combo trigger/member, product trigger, or order-total threshold */
export function ProductOffers({ productId, variationId }: Props) {
  const { t, isAr, num, fmt } = useLang();
  const { data: offers, isLoading } = useOffers({ business_id: 1 });

  if (!productId || isLoading) return null;

  const relevant = (offers ?? [])
    .filter(isActive)
    .filter((o) => {
      if (o.trigger_type === 'order_total_threshold') return true;
      if (o.trigger_product_id === productId) return true;
      return (o.combo_items ?? []).some(
        (i) =>
          i.product_id === productId &&
          (variationId == null || i.variation_id == null || i.variation_id === variationId),
      );
    })
    .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));

  if (!relevant.length) return null;

  return (
    <div className="mt-6 space-y-3">
      <p className="text-sm font-extrabold text-ink-mute">{t('عروض شغالة على المنتج ده')}</p>
      {relevant.map((o) => {
        const name = isAr ? (o.name_ar ?? o.name) : o.name;
        const desc = isAr ? (o.description_ar ?? o.description ?? '') : (o.description ?? '');
        const disc = o.combo_discount ?? o.order_discount;
        const hasGift = (o.rewards ?? []).some((r) => r.reward_mode === 'free');
        const Icon =
          o.trigger_type === 'order_total_threshold' ? TicketPercent : hasGift ? Gift : BadgePercent;

        return (
          <Link
            key={o.id}
            to={`/offers/${o.id}`}
            className="block rounded-xl border-2 border-brand/70 bg-brand/10 p-4 hover:bg-brand/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-ink">
                <Icon className="h-5 w-5" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-black text-ink">{name}</p>
                {!!desc && <p className="text-sm font-bold text-ink-mute line-clamp-2">{desc}</p>}
              </div>
              <ArrowLeft className="h-5 w-5 shrink-0 text-ink ltr:-scale-x-100" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {o.trigger_type === 'order_total_threshold' && o.min_order_total != null && (
                <span className="rounded-full bg-white border border-border px-3 py-1 text-xs font-extrabold text-ink">
                  {t('لما تعدى')} {fmt(Number(o.min_order_total))}
                </span>
              )}
              {o.trigger_product_id === productId && (o.min_trigger_quantity ?? 0) > 1 && (
                <span className="rounded-full bg-white border border-border px-3 py-1 text-xs font-extrabold text-ink">
                  {t('اطلب')} {num(o.min_trigger_quantity!)} {t('وخد العرض')}
                </span>
              )}
              {!!disc && (
                <span className="rounded-full bg-coal px-3 py-1 text-xs font-black text-brand">
                  {disc.type === 'percentage'
                    ? `${t('خصم')} ${num(disc.value)}%`
                    : `${t('خصم')} ${fmt(disc.value)}`}
                </span>
              )}
              {hasGift && (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
                  {t('+ هدية')}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
