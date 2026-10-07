import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Truck } from 'lucide-react';
import { useCart } from '@/cart';
import { useLang } from '@/i18n';
import { ecomProductsFromPages, useEcomProductsInfinite } from '@/hooks/use-ecom-products-infinite';
import { useEcomProducts } from '@/hooks/use-ecom-products';
import { useWhatsappUrl } from '@/hooks/use-social-media';
import BatteryFinder, { type BatteryCarFilter } from '@/components/BatteryFinder';
import ProductImage from '@/components/ProductImage';
import { NotifyMeButton } from '@/components/NotifyMeButton';
import type { EcomProductInfiniteModel } from '@/types/api';
import { WhatsAppIcon } from './art';

export function ApiProductCard({
  p,
  detailBase,
  ctaLabel = 'اختار البطارية',
}: {
  p: EcomProductInfiniteModel;
  detailBase?: string;
  ctaLabel?: string;
}) {
  const { add } = useCart();
  const { t, fmt, num } = useLang();
  const base = Number(p.default_sell_price ?? p.variation?.sell_price_inc_tax ?? 0);
  const disc = Number(p.discounted_price ?? 0);
  const price = disc > 0 && disc < base ? disc : base;
  const images =
    Array.isArray(p.images) && p.images.length ? p.images.filter(Boolean) : p.image_url ? [p.image_url] : [];
  const discount = Number(p.discount ?? 0);
  const outOfStock = p.qty_available != null && Number(p.qty_available) <= 0;
  const detailTo = `${detailBase ?? '/products'}/${p.id}`;
  return (
    <article className="flex flex-col rounded-2xl border-2 border-border bg-white overflow-hidden transition-colors hover:border-ink">
      <Link to={detailTo} className="relative block aspect-[4/3] bg-muted/40 overflow-hidden" aria-label={p.name}>
        {discount > 0 && (
          <span className="absolute z-10 top-3 start-3 rounded-full px-3 py-1 text-xs font-black bg-red-600 text-white">
            {t('خصم')} {p.discount_type === 'percentage' ? `${num(discount)}%` : fmt(discount)}
          </span>
        )}
        <ProductImage images={images} alt={p.name} />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          {p.brand_name && <p className="text-sm font-extrabold text-ink-mute">{p.brand_name}</p>}
          {p.brand_jobsheet_photo && (
            <img
              src={p.brand_jobsheet_photo}
              alt={p.brand_name ?? ''}
              loading="lazy"
              className="h-8 w-8 shrink-0 rounded-full border border-border bg-[#ffffff] object-contain"
            />
          )}
        </div>
        <Link to={detailTo} className="mt-1 text-lg font-black text-ink hover:underline underline-offset-4">
          {p.name}
        </Link>
        {p.variation?.name && p.variation.name !== 'DUMMY' && (
          <p className="mt-1 text-xs font-bold text-ink-mute">{p.variation.name}</p>
        )}
        <div className="mt-3">
          <p className="text-2xl font-black text-ink ltr">{fmt(price)}</p>
          {disc > 0 && disc < base && (
            <p className="text-xs font-bold text-ink-mute line-through">{fmt(base)}</p>
          )}
        </div>
        <div className="mt-auto pt-3">
          {outOfStock ? (
            <NotifyMeButton productId={p.id} variationId={p.variation_id ?? p.variation?.id} />
          ) : (
            <button
              onClick={() =>
                add(
                  {
                    id: `${p.id}-${p.variation_id ?? p.variation?.id ?? 0}`,
                    title: p.name,
                    subtitle: p.variation?.name ?? '',
                    price,
                    productId: p.id,
                    variationId: p.variation_id ?? p.variation?.id,
                  },
                  1,
                )
              }
              className="w-full rounded-xl bg-brand text-coal h-12 text-base font-black border-2 border-coal shadow-[0_4px_0_#191919] hover:translate-y-[2px] hover:shadow-[0_2px_0_#191919] transition-all"
            >
              {t(ctaLabel)}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function BatterySection({ categoryId = 2222 }: { categoryId?: number }) {
  const { t } = useLang();
  const waUrl = useWhatsappUrl();
  const [carFilter, setCarFilter] = useState<BatteryCarFilter>({});
  const hasFilter = !!(carFilter.car_brand_id || carFilter.car_model_id || carFilter.car_year);

  // filtered: plain ecom-products endpoint supports car_brand_id/car_model_id/car_year
  const filteredQuery = useEcomProducts(
    hasFilter ? { business_id: 1, category_id: categoryId, ...carFilter, per_page: 100 } : null,
  );
  const productsQuery = useEcomProductsInfinite(
    { business_id: 1, category_id: categoryId, per_page: 24 },
    !hasFilter,
  );
  const { isLoading } = hasFilter ? filteredQuery : productsQuery;
  const apiProducts: EcomProductInfiniteModel[] = useMemo(() => {
    if (hasFilter) {
      const raw = (filteredQuery.data as { data?: unknown } | undefined)?.data;
      const arr = Array.isArray(raw) ? raw : (raw as { data?: unknown[] } | null)?.data;
      return (Array.isArray(arr) ? arr : []) as EcomProductInfiniteModel[];
    }
    return ecomProductsFromPages<EcomProductInfiniteModel>(productsQuery.data?.pages);
  }, [hasFilter, filteredQuery.data, productsQuery.data]);

  // auto-load next page when the grid bottom scrolls into view (unfiltered only)
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = productsQuery;
  useEffect(() => {
    if (hasFilter) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: '600px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasFilter, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <section id="batteries" className="bg-white border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-14">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-brand-light text-ink px-4 py-1.5 text-sm font-extrabold">
              {t('محدد البطاريات')}
            </p>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black text-ink leading-snug">{t('بطاريتك خلصت؟')}</h2>
            <p className="mt-3 text-lg font-semibold text-ink-mute leading-relaxed">
              {t('اختار عربيتك واعرف البطارية المناسبة ليها بالسعة والضمان والسعر — ولو عايز، نيجي نغيرهالك في مكانك.')}
            </p>

            {/* Battery finder */}
            <div className="mt-6">
              <BatteryFinder onFilter={setCarFilter} />
            </div>

            {/* Mobile battery service */}
            <div className="mt-5 rounded-2xl bg-coal text-white p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand text-coal">
                  <Truck className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-lg font-black text-brand">{t('خدمة تغيير البطارية عندك')}</p>
                  <p className="text-sm font-semibold text-white/70">{t('نوصلك في أي مكان من ٣٠ دقيقة')}</p>
                </div>
              </div>
              <a href={waUrl} target="_blank" rel="noreferrer"
                className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-brand text-coal h-12 text-base font-black hover:bg-brand-dark transition-colors">
                <WhatsAppIcon className="h-5 w-5" /> {t('اطلب الخدمة')}
              </a>
            </div>
          </div>

          {/* Battery cards */}
          <div>
            <p className="text-base font-extrabold text-ink-mute">
              {hasFilter ? t('البطاريات المناسبة لعربيتك:') : t('بطاريات مختارة بأسعار مناسبة:')}
            </p>
            {isLoading && (
              <p className="mt-4 text-sm font-bold text-ink-mute">{t('جاري تحميل البطاريات...')}</p>
            )}
            {!isLoading && apiProducts.length === 0 && (
              <p className="mt-4 text-sm font-bold text-ink-mute">
                {hasFilter ? t('مفيش بطاريات مطابقة لعربيتك — جرب موديل أو سنة تانية') : t('مفيش بطاريات متاحة دلوقتي')}
              </p>
            )}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {apiProducts.map((p) => (
                <ApiProductCard key={`${p.id}-${p.variation_id ?? 0}`} p={p} detailBase="/batteries" />
              ))}
            </div>
            {!hasFilter && <div ref={sentinelRef} className="h-1" aria-hidden="true" />}
            {isFetchingNextPage && (
              <p className="mt-4 text-center text-sm font-bold text-ink-mute">{t('جاري تحميل المزيد...')}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
