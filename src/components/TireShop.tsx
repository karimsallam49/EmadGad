import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Minus, Plus, Star } from 'lucide-react';
import { type Tire } from '@/data';
import { useCart } from '@/cart';
import { useLang } from '@/i18n';
import ProductImage from '@/components/ProductImage';
import { NotifyMeButton } from '@/components/NotifyMeButton';
import { ecomProductsFromPages, useEcomProductsInfinite } from '@/hooks/use-ecom-products-infinite';
import { useEcomProducts } from '@/hooks/use-ecom-products';
import type { EcomProductInfiniteModel } from '@/types/api';

const badgeStyle: Record<string, string> = {
  'الأكثر مبيعًا': 'bg-coal text-brand',
  'أفضل قيمة': 'bg-brand text-coal',
  'عرض': 'bg-red-600 text-white',
  'اقتصادي': 'bg-emerald-600 text-white',
};

function parseName(name: string) {
  const parts = name.split('-').map((s) => s.trim());
  return {
    size: parts[0] ?? '',
    brand: parts[1] ?? '',
    model: parts.slice(1).join(' - ') || name,
  };
}

export function toTire(p: EcomProductInfiniteModel & Record<string, any>): Tire {
  const { size, brand, model } = parseName(p.name ?? '');
  const images =
    Array.isArray(p.images) && p.images.length
      ? p.images.filter(Boolean)
      : (p.image_url ?? p.imageUrl) ? [p.image_url ?? p.imageUrl] : [];
  const base = Number(p.default_sell_price ?? p.defaultSellPrice ?? p.price ?? 0);
  const disc = Number(p.discounted_price ?? 0);
  const qty = p.qty_available != null ? Number(p.qty_available) : 1;
  return {
    id: String(p.id ?? p.variation_id ?? ''),
    brand: p.brand_name ?? p.brandName ?? brand,
    model,
    size,
    width: 0,
    profile: 0,
    rim: 0,
    price: disc > 0 && disc < base ? disc : base,
    oldPrice: disc > 0 && disc < base ? base : undefined,
    discountValue: Number(p.discount ?? 0) || undefined,
    discountType: p.discount_type ?? undefined,
    usage: 'يومي',
    rating: 4,
    stock: qty <= 0 ? 'نفدت الكمية' : qty <= 5 ? 'كمية محدودة' : 'متوفر',
    qtyAvailable: qty,
    image: images[0],
    images,
    brandPhoto: p.brand_jobsheet_photo,
    brandId: typeof p.brand_id === 'number' ? p.brand_id : undefined,
    productId: typeof p.id === 'number' ? p.id : undefined,
    variationId: p.variation_id ?? p.variation?.id,
    categoryId: typeof p.category_id === 'number' ? p.category_id : undefined,
  };
}

/** Detail-page path for a catalog product — batteries/tires keep their dedicated pages */
export function productDetailPath(p: { id: string | number; categoryId?: number; category_id?: number }) {
  const cat = p.categoryId ?? p.category_id;
  const base = cat === 2222 ? '/batteries' : cat === 2217 ? '/tires' : '/products';
  return `${base}/${p.id}`;
}

export function Stars({ n }: { n: number }) {
  const { isAr } = useLang();
  return (
    <span className="flex items-center gap-0.5" aria-label={isAr ? `تقييم ${n} من 5` : `${n} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i < n ? 'fill-brand text-brand-dark' : 'text-border'}`} />
      ))}
    </span>
  );
}

export function TireCard({ tire, detailBase }: { tire: Tire; detailBase?: string }) {
  const { add } = useCart();
  const { t, fmt, num, isAr } = useLang();
  const [qty, setQty] = useState(4);
  const outOfStock = tire.qtyAvailable !== undefined && tire.qtyAvailable <= 0;
  const maxQty = tire.qtyAvailable && tire.qtyAvailable > 0 ? tire.qtyAvailable : 99;
  const detailTo = detailBase ? `${detailBase}/${tire.id}` : productDetailPath({ id: tire.id, categoryId: tire.categoryId });

  return (
    <article className="flex flex-col rounded-2xl border-2 border-border bg-white overflow-hidden hover:border-ink transition-colors">
      <Link to={detailTo} className="relative block aspect-square bg-muted/40 overflow-hidden" aria-label={`${tire.brand} ${tire.model}`}>
        {!!tire.discountValue && (
          <span className="absolute z-10 top-3 start-3 rounded-full px-3 py-1 text-xs font-black bg-red-600 text-white">
            {t('خصم')} {tire.discountType === 'percentage' ? `${num(tire.discountValue)}%` : fmt(tire.discountValue)}
          </span>
        )}
        {!tire.discountValue && tire.badge && (
          <span className={`absolute z-10 top-3 start-3 rounded-full px-3 py-1 text-xs font-black ${badgeStyle[tire.badge]}`}>
            {t(tire.badge)}
          </span>
        )}
        <ProductImage
          images={tire.images?.length ? tire.images : tire.image ? [tire.image] : []}
          alt={`${tire.brand} ${tire.model} tire`}
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-extrabold text-ink-mute">{tire.brand}</p>
          {tire.brandPhoto && (tire.brandId ? (
            <Link
              to={`/products?business_id=1&device_brand_id=${tire.brandId}&brand_name=${encodeURIComponent(tire.brand)}`}
              title={`${t('منتجات')} ${tire.brand}`}
            >
              <img
                src={tire.brandPhoto}
                alt={tire.brand}
                loading="lazy"
                className="h-8 w-8 shrink-0 rounded-full border border-border bg-[#ffffff] object-contain hover:border-ink transition-colors"
              />
            </Link>
          ) : (
            <img
              src={tire.brandPhoto}
              alt={tire.brand}
              loading="lazy"
              className="h-8 w-8 shrink-0 rounded-full border border-border bg-[#ffffff] object-contain"
            />
          ))}
        </div>
        <Link to={detailTo} className="mt-1 text-lg font-black text-ink hover:underline underline-offset-4">
          {tire.model}
        </Link>
        <p className="mt-0.5 text-sm font-bold text-ink-mute">
          {t('المقاس:')} <span className="ltr font-extrabold text-ink">{tire.size}</span>
        </p>

        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-2xl font-black text-ink">{num(tire.price)} <span className="text-sm">{t('جنيه')}</span></p>
            {!!tire.oldPrice && (
              <p className="text-xs font-bold text-ink-mute line-through">{fmt(tire.oldPrice)}</p>
            )}
            <p className="text-xs font-bold text-ink-mute">{t('سعر الإطار الواحد')}</p>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${tire.stock === 'متوفر' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
            {t(tire.stock)}
          </span>
        </div>

        {outOfStock ? (
          <div className="mt-3 rounded-xl bg-amber-50 p-3 text-center">
            <p className="text-sm font-extrabold text-amber-800">{t('المنتج غير متوفر حاليًا')}</p>
          </div>
        ) : (
          <div className="mt-3 rounded-xl bg-muted/70 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1" role="group" aria-label="Tire quantity">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  aria-label={t('قلل الكمية')}
                  className="h-9 w-9 rounded-lg bg-white border border-border text-ink font-black hover:border-ink disabled:opacity-40 transition-colors flex items-center justify-center"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-10 text-center text-base font-black text-ink">{num(qty)}</span>
                <button
                  onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  disabled={qty >= maxQty}
                  aria-label={t('زود الكمية')}
                  className="h-9 w-9 rounded-lg bg-white border border-border text-ink font-black hover:border-ink disabled:opacity-40 transition-colors flex items-center justify-center"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="text-end">
                <p className="text-xs font-bold text-ink-mute">{num(tire.price)} × {num(qty)}</p>
                <p className="text-lg font-black text-ink">{fmt(tire.price * qty)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-auto pt-3">
          {outOfStock ? (
            <NotifyMeButton productId={tire.productId} variationId={tire.variationId} />
          ) : (
            <button
              onClick={() =>
                add({ id: tire.id, title: isAr ? `إطار ${tire.brand} ${tire.model}` : `${tire.brand} ${tire.model} Tire`, subtitle: tire.size, price: tire.price, productId: tire.productId, variationId: tire.variationId }, qty)
              }
              className="w-full rounded-xl bg-brand text-coal h-12 text-base font-black border-2 border-coal shadow-[0_4px_0_#191919] hover:translate-y-[2px] hover:shadow-[0_2px_0_#191919] transition-all"
            >
              {t('أضف للسلة')}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

interface Props {
  limit?: number;
  showHeader?: boolean;
  selectedItemIds?: string;
  categoryId?: number;
}

export default function TireShop({
  limit,
  showHeader = true,
  selectedItemIds,
  categoryId = 2217,
}: Props) {
  const { t } = useLang();

  const hasFilter = !!selectedItemIds;

  const filteredQuery = useEcomProducts(
    hasFilter ? { business_id: 1, selected_item_ids: selectedItemIds, category_id: categoryId } : null
  );
  // when a limit is set (home preview) fetch one page only; otherwise paginate on scroll
  const allQuery = useEcomProductsInfinite(
    { business_id: 1, per_page: limit ?? 24, category_id: categoryId },
    !hasFilter
  );

  const { isLoading, isError, error } = hasFilter ? filteredQuery : allQuery;

  const products = useMemo<EcomProductInfiniteModel[]>(() => {
    if (hasFilter) {
      const raw = (filteredQuery.data as { data?: unknown } | undefined)?.data;
      const arr = Array.isArray(raw) ? raw : (raw as { data?: unknown[] } | null)?.data;
      return (Array.isArray(arr) ? arr : []) as EcomProductInfiniteModel[];
    }
    return ecomProductsFromPages<EcomProductInfiniteModel>(allQuery.data?.pages);
  }, [hasFilter, filteredQuery.data, allQuery.data]);

  const list = useMemo(() => products.map(toTire), [products]);

  // auto-load next page when the sentinel scrolls into view
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = allQuery;
  useEffect(() => {
    if (hasFilter || limit) return;
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
  }, [hasFilter, limit, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <section id="tires" className="bg-paper">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-96 rounded-2xl bg-white border-2 border-border animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section id="tires" className="bg-paper">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16 text-center">
          <p className="text-xl font-black text-red-700">{error instanceof Error ? error.message : t('فشل تحميل المنتجات')}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="tires" className="bg-paper">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16">
        {showHeader && (
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-ink">{t('اختار الإطار المناسب لعربيتك')}</h2>
              <p className="mt-2 text-lg font-semibold text-ink-mute">{t('أسعار واضحة بالجنيه، وتركيب في أقرب فرع.')}</p>
            </div>
          </div>
        )}

        {list.length > 0 ? (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 ${showHeader ? 'mt-8' : ''}`}>
            {list.map((tire) => <TireCard key={tire.id} tire={tire} detailBase="/tires" />)}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border-2 border-dashed border-border bg-white p-10 text-center">
            <p className="text-xl font-black text-ink">{t('مفيش منتجات متاحة')}</p>
          </div>
        )}

        {!hasFilter && !limit && (
          <div ref={sentinelRef} className="h-1" aria-hidden="true" />
        )}
        {isFetchingNextPage && (
          <p className="mt-6 text-center text-sm font-bold text-ink-mute">{t('جاري تحميل المزيد...')}</p>
        )}

        {limit && (
          <div className="mt-8 text-center">
            <Link to="/tires"
              className="inline-flex items-center gap-2 rounded-xl bg-coal text-brand px-8 h-12 text-base font-black hover:bg-coal-soft transition-colors">
              {t('اعرض كل الإطارات')}
              <ArrowLeft className="h-5 w-5 ltr:-scale-x-100" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
