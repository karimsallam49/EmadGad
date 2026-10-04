import { Link, useParams } from 'react-router';
import { BadgePercent, Gift, MapPin, PackageCheck } from 'lucide-react';
import { useLang } from '@/i18n';
import { useOffer } from '@/hooks/use-offers';
import { productPrice, useApplyOffer } from '@/hooks/use-apply-offer';
import { storageUrl } from '@/lib/api';
import { useWhatsappUrl } from '@/hooks/use-social-media';
import { WhatsAppIcon } from '@/components/art';
import InstagramEmbed from '@/components/InstagramEmbed';

const TRIGGER_TAG: Record<string, string> = {
  buy_x_get_same: 'اشتري وخد هدية',
  buy_x_get_other: 'اشتري وخد هدية',
  order_total_threshold: 'خصم على الإجمالي',
  combo: 'عرض كومبو',
};

export default function OfferDetailsPage() {
  const { id } = useParams();
  const { t, isAr, num, fmt, lang } = useLang();
  const { data: offer, isLoading, isError } = useOffer(Number(id));
  const { apply, loading: applying, canApply, products } = useApplyOffer(offer);
  const waUrl = useWhatsappUrl();

  if (isLoading) {
    return (
      <div className="bg-paper min-h-[60vh] flex items-center justify-center">
        <p className="text-xl font-black text-ink-mute">{t('جاري التحميل...')}</p>
      </div>
    );
  }

  if (isError || !offer) {
    return (
      <div className="bg-paper min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-black text-ink">{t('العرض مش موجود أو انتهى')}</h1>
          <Link to="/offers" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-coal text-brand px-6 h-12 font-black">
            {t('ارجع للعروض')}
          </Link>
        </div>
      </div>
    );
  }

  const title = (isAr ? offer.name_ar : offer.name) ?? offer.name;
  const desc = (isAr ? offer.description_ar : offer.description) ?? offer.description;
  const mediaPath = isAr ? offer.media_ar : offer.media_en;
  const imagePath = isAr ? offer.image_ar : offer.image_en;
  const mediaLooksLikeImage = !!mediaPath && /\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i.test(mediaPath);
  const image = storageUrl(imagePath ?? (mediaLooksLikeImage || offer.media_type === 'image' ? mediaPath : null));
  const videoRaw = isAr ? offer.video_ar : offer.video_en;
  const videoUrl = typeof videoRaw === 'string' ? storageUrl(videoRaw) : videoRaw?.url ?? null;

  const isCombo = offer.trigger_type === 'combo';
  const discType = isCombo ? offer.combo_discount_type : offer.order_discount_type;
  const discValue = isCombo ? offer.combo_discount_value : offer.order_discount_value;
  const discountLabel =
    discType && discValue != null
      ? discType === 'percentage'
        ? `${num(Number(discValue))}%`
        : fmt(Number(discValue))
      : null;

  const fmtDate = (s?: string | null) =>
    s ? new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(s)) : null;
  const startsAt = fmtDate(offer.starts_at);
  const endsAt = fmtDate(offer.ends_at);

  const branchNames = (offer.branches ?? [])
    .map((b) => b.location?.name)
    .filter((n): n is string => !!n);

  return (
    <div className="bg-paper min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 lg:py-12">
        <nav className="text-sm font-bold text-ink-mute">
          <Link to="/" className="hover:text-ink">{t('الرئيسية')}</Link>
          <span className="mx-2">/</span>
          <Link to="/offers" className="hover:text-ink">{t('العروض')}</Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{title}</span>
        </nav>

        <div className="mt-6 overflow-hidden rounded-2xl border-2 border-ink bg-white dark:bg-[#1c1c1c] shadow-[0_10px_0_#f6c744]">
          {image ? (
            <img src={image} alt={title} className="h-64 w-full bg-muted object-cover sm:h-80" />
          ) : videoUrl && /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i.test(videoUrl) ? (
            <video src={videoUrl} className="h-64 w-full bg-black object-cover sm:h-80" autoPlay loop muted playsInline preload="metadata" />
          ) : videoUrl && /instagram\.com\//i.test(videoUrl) ? (
            <div className="h-64 w-full bg-black sm:h-80">
              <InstagramEmbed url={videoUrl} className="h-full w-full" />
            </div>
          ) : null}

          <div className="p-5 sm:p-8">
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
              {!!offer.min_order_total && (
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-black text-ink-mute">
                  {t('لطلبات فوق')} {fmt(Number(offer.min_order_total))}
                </span>
              )}
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl font-black text-ink leading-snug">{title}</h1>
            {desc && <p className="mt-2 text-lg font-semibold text-ink-mute">{desc}</p>}

            {isCombo && !!offer.combo_items?.length && (
              <div className="mt-6">
                <h2 className="flex items-center gap-2 text-lg font-black text-ink">
                  <PackageCheck className="h-5 w-5" /> {t('المنتجات المطلوبة للعرض')}
                </h2>
                <ul className="mt-3 divide-y divide-border rounded-xl border-2 border-border">
                  {offer.combo_items.map((ci, i) => {
                    const p = products[i];
                    const name = ci.product?.name ?? ci.product_name ?? p?.name ?? `#${ci.product_id}`;
                    const varName = ci.variation_name ?? ci.variation?.name;
                    const price = Number(
                      ci.variation?.sell_price_inc_tax ??
                        ci.variation?.default_sell_price ??
                        ci.product?.default_sell_price ??
                        ci.product?.sell_price ??
                        0,
                    ) || productPrice(p);
                    return (
                      <li key={`${ci.product_id}-${ci.variation_id ?? 0}`} className="flex items-center justify-between gap-3 px-4 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-ink">{name}{varName ? ` — ${varName}` : ''}</p>
                          <p className="text-xs font-bold text-ink-mute">{t('الكمية')}: {num(Number(ci.quantity))}</p>
                        </div>
                        {price > 0 && <span className="shrink-0 text-sm font-black text-ink">{fmt(price)}</span>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {!!offer.rewards?.length && (
              <div className="mt-6">
                <h2 className="flex items-center gap-2 text-lg font-black text-ink">
                  <Gift className="h-5 w-5" /> {t('الهدايا')}
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {offer.rewards.map((r) => (
                    <span key={r.id} className="inline-flex items-center gap-1.5 rounded-full bg-brand-light dark:bg-brand/20 px-3 py-1.5 text-xs font-black text-ink">
                      <Gift className="h-3.5 w-3.5" />
                      {r.product_name ?? ''} ×{num(Number(r.quantity))}
                      <span className="text-emerald-700 dark:text-emerald-400">
                        {r.reward_mode === 'free'
                          ? t('مجانًا')
                          : `${t('خصم')} ${r.discount_type === 'percentage' ? `${num(Number(r.discount_value))}%` : fmt(Number(r.discount_value))}`}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-ink-mute">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {branchNames.length ? `${t('ساري في:')} ${branchNames.join('، ')}` : t('ساري في كل الفروع')}
              </span>
              {startsAt && <span>{t('من')} {startsAt}</span>}
              {endsAt && <span>{t('لحد')} {endsAt}</span>}
              {!!offer.max_uses && (
                <span>{t('الاستخدامات')}: {num(offer.used_count ?? 0)}/{num(offer.max_uses)}</span>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {canApply && (
                <button
                  type="button"
                  onClick={apply}
                  disabled={applying}
                  className="flex-1 min-w-56 rounded-xl bg-brand text-coal h-14 text-lg font-black border-2 border-coal shadow-[0_4px_0_#191919] hover:translate-y-[2px] hover:shadow-[0_2px_0_#191919] disabled:opacity-40 transition-all"
                >
                  {applying ? t('جاري التحميل...') : t('اطلب العرض')}
                </button>
              )}
              {!canApply && offer.trigger_type === 'order_total_threshold' && (
                <Link to="/tires"
                  className="flex-1 min-w-56 inline-flex items-center justify-center rounded-xl bg-brand text-coal h-14 text-lg font-black border-2 border-coal shadow-[0_4px_0_#191919] hover:translate-y-[2px] hover:shadow-[0_2px_0_#191919] transition-all">
                  {t('اتسوق واستفد من العرض')}
                </Link>
              )}
              <a href={waUrl} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-ink px-6 h-14 font-black text-ink hover:bg-coal hover:text-brand transition-colors">
                <WhatsAppIcon className="h-5 w-5 text-[#25D366]" /> {t('اسأل على واتساب')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
