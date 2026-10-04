import { useEffect, useMemo, useRef, useState } from 'react';
import { Layers } from 'lucide-react';
import { useTaxonomy } from '@/hooks/use-taxonomy';
import { ecomProductsFromPages, useEcomProductsInfinite } from '@/hooks/use-ecom-products-infinite';
import { TireCard, toTire } from '@/components/TireShop';
import { useLang } from '@/i18n';
import { storageUrl } from '@/lib/api';
import type { EcomProductInfiniteModel, TaxonomyModel } from '@/types/api';

function Pill({
  active,
  onClick,
  logo,
  children,
}: {
  active: boolean;
  onClick: () => void;
  logo?: string | null;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border-2 px-5 h-11 text-sm font-black transition-colors ${
        active
          ? 'border-coal bg-coal text-brand'
          : 'border-border bg-white text-ink hover:border-ink'
      }`}
    >
      {logo && <img src={logo} alt="" loading="lazy" className="h-6 w-6 rounded-full bg-white object-contain" />}
      {children}
    </button>
  );
}

export default function TaxonomyPage() {
  const { t } = useLang();
  const { data: categories, isLoading: catsLoading } = useTaxonomy({
    type: 'product',
    business_id: 1,
    page: 1,
  });

  const [catId, setCatId] = useState<number | null>(null);
  const [subId, setSubId] = useState<number | null>(null);

  const cats = useMemo(() => categories ?? [], [categories]);
  const selectedCat = cats.find((c) => c.id === catId);
  const subs = selectedCat?.sub_categories ?? [];
  const activeId = subId ?? catId;

  const productsQuery = useEcomProductsInfinite({
    business_id: 1,
    per_page: 24,
    category_id: activeId ?? undefined,
  });
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = productsQuery;

  const list = useMemo(
    () => ecomProductsFromPages<EcomProductInfiniteModel>(data?.pages).map(toTire),
    [data]
  );

  // auto-load the next page when the sentinel scrolls into view
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
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
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const pickCat = (cat: TaxonomyModel | null) => {
    setCatId(cat?.id ?? null);
    setSubId(null);
  };

  return (
    <div className="bg-paper py-10 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-black text-ink">{t('الأقسام')}</h1>
        <p className="mt-2 text-lg font-bold text-ink-mute">{t('اختار القسم والمنتجات هتتغير تحته على طول.')}</p>

        {/* categories slider */}
        <div className="mt-6 -mx-4 sm:mx-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" dir="rtl">
          <div className="flex w-max items-center gap-2.5 px-4 sm:px-0 py-1">
            <Pill active={catId === null} onClick={() => pickCat(null)}>
              {t('كل المنتجات')}
            </Pill>
            {catsLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="h-11 w-28 shrink-0 animate-pulse rounded-xl border-2 border-border bg-white" />
              ))}
            {cats.map((cat) => (
              <Pill
                key={cat.id}
                active={catId === cat.id}
                onClick={() => pickCat(cat)}
                logo={storageUrl(cat.jobsheet_photo) ?? storageUrl(cat.logo)}
              >
                {cat.name}
              </Pill>
            ))}
          </div>
        </div>

        {/* sub-categories slider — only when the picked category has subs */}
        {subs.length > 0 && (
          <div className="mt-3 -mx-4 sm:mx-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" dir="rtl">
            <div className="flex w-max items-center gap-2 px-4 sm:px-0 py-1">
              <Pill active={subId === null} onClick={() => setSubId(null)}>
                {t('كل القسم')}
              </Pill>
              {subs.map((sub) => (
                <Pill key={sub.id} active={subId === sub.id} onClick={() => setSubId(sub.id)}>
                  {sub.name}
                </Pill>
              ))}
            </div>
          </div>
        )}

        {/* products */}
        {isLoading ? (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-96 animate-pulse rounded-2xl border-2 border-border bg-white" />
            ))}
          </div>
        ) : isError ? (
          <div className="mt-8 rounded-2xl border-2 border-dashed border-border bg-white p-10 text-center">
            <p className="text-xl font-black text-red-700">
              {error instanceof Error ? error.message : t('فشل تحميل المنتجات')}
            </p>
          </div>
        ) : list.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {list.map((tire) => (
              <TireCard key={tire.id} tire={tire} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border-2 border-dashed border-border bg-white p-10 text-center">
            <Layers className="mx-auto h-10 w-10 text-ink-mute" />
            <p className="mt-3 text-xl font-black text-ink">{t('مفيش منتجات في القسم ده')}</p>
          </div>
        )}

        <div ref={sentinelRef} className="h-1" aria-hidden="true" />
        {isFetchingNextPage && (
          <p className="mt-6 text-center text-sm font-bold text-ink-mute">{t('جاري تحميل المزيد...')}</p>
        )}
      </div>
    </div>
  );
}
