import { useProducts } from '@/hooks/use-products';
import { useEcomProducts } from '@/hooks/use-ecom-products';
import { TireCard, toTire } from '@/components/TireShop';
import { useSearchParams } from 'react-router';
import type { Tire } from '@/data';
import { useLang } from '@/i18n';

/** Tolerant extraction: data can be a plain array or a Laravel paginator object */
function extractList(raw: unknown): Tire[] {
  const d = raw as { data?: unknown } | unknown[] | undefined;
  const arr = Array.isArray(d) ? d : ((d as { data?: unknown[] })?.data ?? []);
  return (Array.isArray(arr) ? arr : []).map((p) => toTire(p as any));
}

function ProductGrid({ title, titleSuffix, subtitle, items }: { title: string; titleSuffix?: string; subtitle: string; items: Tire[] }) {
  const { t } = useLang();
  return (
    <div className="bg-paper py-10 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-black text-ink">
          {t(title)}{titleSuffix ? ` ${titleSuffix}` : ''}
        </h1>
        <p className="mt-2 text-lg font-bold text-ink-mute">{t(subtitle)}</p>

        {items.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {items.map((tire) => (
              <TireCard key={tire.id} tire={tire} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border-2 border-dashed border-border bg-white p-10 text-center">
            <p className="text-xl font-black text-ink">{t('مفيش منتجات متاحة')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function EcomProducts({
  businessId,
  carBrandId,
  carModelId,
  carYear,
  categoryId,
  deviceBrandId,
  title,
  titleSuffix,
  subtitle,
}: {
  businessId: number;
  carBrandId?: number;
  carModelId?: number;
  carYear?: number;
  categoryId?: number;
  deviceBrandId?: number;
  title?: string;
  titleSuffix?: string;
  subtitle?: string;
}) {
  const { data, isLoading, isError, error } = useEcomProducts({
    business_id: businessId,
    car_brand_id: carBrandId,
    car_model_id: carModelId,
    car_year: carYear,
    category_id: categoryId,
    device_brand_id: deviceBrandId,
    per_page: 100,
  });

  const { t } = useLang();
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-paper">
        <p className="text-xl font-black text-ink-mute">{t('جاري تحميل المنتجات...')}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-paper px-4">
        <p className="text-center text-lg font-bold text-red-700">
          {error instanceof Error ? error.message : t('خطأ غير معروف')}
        </p>
      </div>
    );
  }

  return (
    <ProductGrid
      title={title ?? 'إطارات تناسب عربيتك'}
      titleSuffix={titleSuffix}
      subtitle={subtitle ?? 'نتائج مباشرة من مخزون الفروع'}
      items={extractList((data as any)?.data ?? data)}
    />
  );
}

function ProductCatalog() {
  const { data, isLoading, isError, error } = useProducts();
  const { t } = useLang();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-paper">
        <p className="text-xl font-black text-ink-mute">{t('جاري تحميل المنتجات...')}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-paper px-4">
        <p className="text-center text-lg font-bold text-red-700">
          {error instanceof Error ? error.message : t('خطأ غير معروف')}
        </p>
      </div>
    );
  }

  return (
    <ProductGrid
      title="منتجاتنا"
      subtitle="قطع غيار وإطارات وبطاريات أصلية"
      items={extractList(data?.data)}
    />
  );
}

export default function ProductsPage() {
  const [params] = useSearchParams();

  const businessId = Number(params.get('business_id'));
  const carBrandId = Number(params.get('car_brand_id'));
  const carModelId = Number(params.get('car_model_id'));
  const carYear = Number(params.get('car_year'));
  const categoryId = Number(params.get('category_id'));
  const deviceBrandId = Number(params.get('device_brand_id'));
  const brandName = params.get('brand_name');

  if (deviceBrandId) {
    return (
      <EcomProducts
        businessId={businessId || 1}
        deviceBrandId={deviceBrandId}
        title="منتجات الماركة"
        titleSuffix={brandName ?? undefined}
        subtitle="نتائج مباشرة من مخزون الفروع"
      />
    );
  }

  if (categoryId) {
    return (
      <EcomProducts
        businessId={businessId || 1}
        categoryId={categoryId}
        title="منتجات القسم"
        subtitle="نتائج مباشرة من مخزون الفروع"
      />
    );
  }

  const isEcom = !!businessId && !!carBrandId && !!carModelId && !!carYear;

  if (isEcom) {
    return (
      <EcomProducts
        businessId={businessId}
        carBrandId={carBrandId}
        carModelId={carModelId}
        carYear={carYear}
      />
    );
  }

  return <ProductCatalog />;
}
