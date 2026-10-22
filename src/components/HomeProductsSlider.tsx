import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useBestSellProducts, useFeaturedProducts } from '@/hooks/use-home-content';
import { toTire, TireCard } from '@/components/TireShop';
import { useLang } from '@/i18n';
import type { EcomProductInfiniteModel } from '@/types/api';

const CARD_STEP = 240; // ~one card (w-56) + gap

function HomeProductsSlider({
  title,
  query,
}: {
  title: string;
  query: UseQueryResult<EcomProductInfiniteModel[]>;
}) {
  const { t, isAr } = useLang();
  const scroller = useRef<HTMLDivElement>(null);

  // section hides itself entirely while loading / on error / when the feed is empty
  if (query.isLoading || query.isError) return null;
  const list = (query.data ?? []).map(toTire);
  if (!list.length) return null;

  // in RTL the scroll axis flips — "next" means negative scrollLeft
  const scroll = (dir: 1 | -1) =>
    scroller.current?.scrollBy({ left: (isAr ? -dir : dir) * CARD_STEP, behavior: 'smooth' });
  const PrevIcon = isAr ? ChevronRight : ChevronLeft;
  const NextIcon = isAr ? ChevronLeft : ChevronRight;

  const arrowCls =
    'flex h-10 w-10 items-center justify-center rounded-full bg-coal text-brand hover:bg-coal-soft transition-colors disabled:opacity-40';

  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-black text-ink">{title}</h2>
          <div className="flex gap-2">
            <button type="button" onClick={() => scroll(-1)} aria-label={t('السابق')} className={arrowCls}>
              <PrevIcon className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => scroll(1)} aria-label={t('التالي')} className={arrowCls}>
              <NextIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div
          ref={scroller}
          className="mt-6 flex gap-4 overflow-x-auto pb-2 snap-x snap-proximity [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {list.map((tire) => (
            <div key={tire.id} className="w-56 shrink-0 snap-start">
              <TireCard tire={tire} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeFeaturedProducts() {
  const { t } = useLang();
  return <HomeProductsSlider title={t('منتجات مميزة')} query={useFeaturedProducts()} />;
}

export function HomeBestSellProducts() {
  const { t } = useLang();
  return <HomeProductsSlider title={t('الأكثر مبيعًا')} query={useBestSellProducts()} />;
}
