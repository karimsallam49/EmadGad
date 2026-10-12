import { Link, Navigate } from 'react-router';
import { ArrowLeft, BadgePercent, Gift } from 'lucide-react';
import { useLang } from '@/i18n';
import { useOffers } from '@/hooks/use-offers';
import type { OfferModel } from '@/types/api';

const TRIGGER_TAG: Record<string, string> = {
  buy_x_get_same: 'اشتري وخد هدية',
  buy_x_get_other: 'اشتري وخد هدية',
  order_total_threshold: 'خصم على الإجمالي',
  combo: 'عرض كومبو',
};

function OfferCard({ offer, featured }: { offer: OfferModel; featured?: boolean }) {
  const { t, isAr, num, fmt, lang } = useLang();

  const title = (isAr ? offer.name_ar : offer.name) ?? offer.name;
  const desc = (isAr ? offer.description_ar : offer.description) ?? offer.description;
  const media = (isAr ? offer.media_ar : offer.media_en) ?? (isAr ? offer.image_ar : offer.image_en);
  const image = (isAr ? offer.image_ar : offer.image_en) ?? (offer.media_type === 'image' ? media : null) ?? media;

  const discount = offer.trigger_type === 'combo' ? offer.combo_discount : offer.order_discount;
  const discountLabel = discount
    ? discount.type === 'percentage'
      ? `${num(Number(discount.value))}%`
      : fmt(Number(discount.value))
    : null;

  const endsAt = offer.ends_at
    ? new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-GB', { day: 'numeric', month: 'long' }).format(new Date(offer.ends_at))
    : null;

  const summary =
    offer.trigger_type === 'order_total_threshold'
      ? `${discountLabel ? `${t('خصم')} ${discountLabel} ` : ''}${offer.min_order_total ? `${t('لطلبات فوق')} ${fmt(Number(offer.min_order_total))}` : ''}`.trim()
      : offer.trigger_type === 'combo'
        ? `${discountLabel ? `${t('خصم')} ${discountLabel} ${t('على الكومبو')}` : ''}`.trim()
        : `${t('اطلب')} ${num(Number(offer.min_trigger_quantity ?? 1))} ${t('وخد هدية')}`;

  return (
    <Link
      to={`/offers/${offer.id}`}
      className={`group flex overflow-hidden rounded-2xl border-2 border-border bg-white transition-colors hover:border-ink ${
        featured ? 'flex-col md:flex-row md:col-span-2 lg:col-span-3' : 'flex-col'
      }`}
    >
      {image && (
        <div className={`${featured ? 'h-56 w-full md:h-auto md:w-2/5' : 'h-44 w-full'} shrink-0 bg-muted/40 overflow-hidden`}>
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-coal text-brand px-3 py-1 text-xs font-black">
            <BadgePercent className="h-3.5 w-3.5" />
            {t(TRIGGER_TAG[offer.trigger_type ?? ''] ?? 'عرض')}
          </span>
          {discountLabel && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
              {t('خصم')} {discountLabel}
            </span>
          )}
        </div>

        <h3 className={`mt-4 font-black text-ink leading-snug group-hover:underline underline-offset-4 ${featured ? 'text-2xl sm:text-3xl' : 'text-xl'}`}>
          {title}
        </h3>
        {desc && <p className="mt-1 text-sm font-bold text-ink-mute">{desc}</p>}
        {summary && <p className="mt-2 text-sm font-black text-emerald-700 dark:text-emerald-400">{summary}</p>}

        {!!offer.combo_items?.length && offer.trigger_type === 'combo' && (
          <ul className="mt-3 space-y-1 rounded-xl bg-muted/70 p-3">
            {offer.combo_items.map((ci) => (
              <li key={`${ci.product_id}-${ci.variation_id ?? 0}`} className="flex justify-between gap-2 text-xs font-bold text-ink">
                <span className="truncate">{ci.product_name ?? `#${ci.product_id}`}</span>
                <span className="shrink-0">×{num(Number(ci.quantity))}</span>
              </li>
            ))}
          </ul>
        )}

        {!!offer.rewards?.length && (
          <div className="mt-3 flex flex-wrap gap-2">
            {offer.rewards.map((r) => (
              <span key={r.id} className="inline-flex items-center gap-1.5 rounded-full bg-brand-light dark:bg-brand/20 px-3 py-1 text-xs font-black text-ink">
                <Gift className="h-3.5 w-3.5" />
                {r.product_name ?? ''} ×{num(Number(r.quantity))}
                {r.reward_mode === 'free' && <span className="text-emerald-700 dark:text-emerald-400">{t('مجانًا')}</span>}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-4">
          {endsAt && <p className="mb-3 text-xs font-bold text-ink-mute">{t('متاح لحد')} {endsAt}</p>}
          <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-coal text-brand h-12 text-base font-black group-hover:bg-coal-soft transition-colors">
            {t('عرض التفاصيل')}
            <ArrowLeft className="h-5 w-5 ltr:-scale-x-100" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function OffersPage() {
  const { t } = useLang();
  const { data: offers, isLoading, isError } = useOffers({ business_id: 1 });

  if (!isLoading && !isError && !offers?.length) return <Navigate to="/" replace />;

  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 lg:py-14">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-coal">
            <BadgePercent className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-ink">{t('عروض EmadGad')}</h1>
            <p className="text-lg font-semibold text-ink-mute">{t('كل العروض المتاحة دلوقتي — دوس على أي عرض تشوف تفاصيله.')}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl border-2 border-border bg-white" />
            ))}
          </div>
        ) : isError ? (
          <div className="mt-8 rounded-2xl border-2 border-dashed border-border bg-white p-10 text-center">
            <p className="text-xl font-black text-red-700">{t('فشل تحميل العروض')}</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(offers ?? []).map((o, i) => <OfferCard key={o.id} offer={o} featured={i === 0} />)}
          </div>
        )}
      </div>
    </div>
  );
}
