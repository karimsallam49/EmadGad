import { useMemo } from 'react';
import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { useLang } from '@/i18n';
import { ecomProductsFromPages, useEcomProductsInfinite } from '@/hooks/use-ecom-products-infinite';
import { ApiProductCard } from '@/components/BatterySection';
import type { EcomProductInfiniteModel } from '@/types/api';

interface Props {
  categoryId: number;
  title: string;
  subtitle?: string;
  limit?: number;
  tone?: 'paper' | 'white';
}

/** Home/category product grid — pulls from /public/ecom-products-infinite by category */
export default function CategoryProducts({ categoryId, title, subtitle, limit = 8, tone = 'paper' }: Props) {
  const { t } = useLang();
  const query = useEcomProductsInfinite({ business_id: 1, category_id: categoryId, per_page: limit });
  const products = useMemo(
    () => ecomProductsFromPages<EcomProductInfiniteModel>(query.data?.pages).slice(0, limit),
    [query.data, limit],
  );

  if (query.isLoading) {
    return (
      <section className={tone === 'white' ? 'bg-white border-y border-border' : 'bg-paper'}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-white border-2 border-border animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className={tone === 'white' ? 'bg-white border-y border-border' : 'bg-paper'}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-ink">{t(title)}</h2>
            {subtitle && <p className="mt-2 text-lg font-semibold text-ink-mute">{t(subtitle)}</p>}
          </div>
          <Link
            to={`/products?business_id=1&category_id=${categoryId}`}
            className="inline-flex items-center gap-2 rounded-xl bg-coal text-brand px-6 h-11 text-sm font-black hover:bg-coal-soft transition-colors"
          >
            {t('اعرض الكل')}
            <ArrowLeft className="h-4 w-4 ltr:-scale-x-100" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((p) => (
            <ApiProductCard key={`${p.id}-${p.variation_id ?? 0}`} p={p} ctaLabel="أضف للسلة" />
          ))}
        </div>
      </div>
    </section>
  );
}
