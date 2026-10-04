import { BadgePercent, Gift } from 'lucide-react';
import { Link } from 'react-router';
import { useLang } from '@/i18n';
import { useWhatsappUrl } from '@/hooks/use-social-media';
import { useOffers } from '@/hooks/use-offers';
import { useApplyOffer } from '@/hooks/use-apply-offer';
import type { OfferModel } from '@/types/api';

const STATIC_OFFERS = [
  { tag: 'عرض إطارات', title: '٤ إطارات Apollo مقاس ١٤', was: 18600, now: 15900, note: 'شامل التركيب والترصيص' },
  { tag: 'عرض بطارية', title: 'بطارية Aston ٦٢ أمبير', was: 6500, now: 5800, note: 'شامل التركيب + ضمان ١٨ شهر' },
  { tag: 'باقة صيانة', title: 'تغيير زيت + فلتر + فحص', was: 1400, now: 999, note: 'زيت أصلي + فحص ٢٠ نقطة' },
];

const TRIGGER_TAG: Record<string, string> = {
  buy_x_get_same: 'اشتري وخد هدية',
  buy_x_get_other: 'اشتري وخد هدية',
  order_total_threshold: 'خصم على الإجمالي',
  combo: 'عرض كومبو',
};

function StaticOffers() {
  const { t, num } = useLang();
  const waUrl = useWhatsappUrl();
  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
      {STATIC_OFFERS.map((o) => (
        <article key={o.title} className="flex flex-col rounded-2xl border-2 border-border bg-white p-6 hover:border-ink transition-colors">
          <span className="self-start rounded-full bg-coal text-brand px-3 py-1 text-xs font-black">{t(o.tag)}</span>
          <h3 className="mt-4 text-xl font-black text-ink leading-snug">{t(o.title)}</h3>
          <p className="mt-1 text-sm font-bold text-ink-mute">{t(o.note)}</p>
          <div className="mt-4 flex items-end gap-3">
            <p className="text-sm font-bold text-ink-mute line-through">{num(o.was)} {t('جنيه')}</p>
            <p className="text-3xl font-black text-ink">
              {num(o.now)} <span className="text-base">{t('جنيه')}</span>
            </p>
          </div>
          <a href={waUrl} target="_blank" rel="noreferrer"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-coal text-brand h-12 text-base font-black hover:bg-coal-soft transition-colors">
            {t('اطلب العرض')}
          </a>
        </article>
      ))}
    </div>
  );
}

function OfferCard({ offer }: { offer: OfferModel }) {
  const { t, isAr, num, fmt, lang } = useLang();
  const { apply, loading: applying, canApply } = useApplyOffer(offer, { fetchProducts: false });

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
    <article className="flex flex-col rounded-2xl border-2 border-border bg-white overflow-hidden hover:border-ink transition-colors">
      {image && (
        <div className="h-40 w-full bg-muted/40">
          <img src={image} alt={title} className="h-full w-full object-cover" loading="lazy" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <span className="self-start rounded-full bg-coal text-brand px-3 py-1 text-xs font-black">
          {t(TRIGGER_TAG[offer.trigger_type ?? ''] ?? 'عرض')}
        </span>
        <Link to={`/offers/${offer.id}`} className="mt-4 block text-xl font-black text-ink leading-snug hover:underline underline-offset-4">
          {title}
        </Link>
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
          {canApply ? (
            <button
              type="button"
              onClick={apply}
              disabled={applying}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-coal text-brand h-12 text-base font-black hover:bg-coal-soft transition-colors disabled:opacity-40"
            >
              {applying ? t('جاري التحميل...') : t('اطلب العرض')}
            </button>
          ) : offer.trigger_type === 'order_total_threshold' ? (
            <Link
              to="/tires"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-coal text-brand h-12 text-base font-black hover:bg-coal-soft transition-colors"
            >
              {t('اتسوق واستفد من العرض')}
            </Link>
          ) : (
            <Link
              to={`/offers/${offer.id}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-ink text-ink h-12 text-base font-black hover:bg-coal hover:text-brand transition-colors"
            >
              {t('عرض التفاصيل')}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Offers() {
  const { t } = useLang();
  const { data: offers } = useOffers({ business_id: 1 });

  return (
    <section id="offers" className="bg-paper">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-coal">
            <BadgePercent className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-ink">{t('عروض EmadGad')}</h2>
            <p className="text-lg font-semibold text-ink-mute">{t('عروض واضحة من غير شروط مخفية.')}</p>
          </div>
        </div>

        {offers?.length ? (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
            {offers.map((o) => <OfferCard key={o.id} offer={o} />)}
          </div>
        ) : (
          <StaticOffers />
        )}
      </div>
    </section>
  );
}
