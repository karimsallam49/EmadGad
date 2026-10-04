import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowRight, Minus, Plus, ShieldCheck, type LucideIcon } from 'lucide-react';
import { useCart } from '@/cart';
import { useLang } from '@/i18n';
import { useWhatsappUrl } from '@/hooks/use-social-media';
import { useProduct } from '@/hooks/use-product';
import { useEcomProducts } from '@/hooks/use-ecom-products';
import { WhatsAppIcon } from '@/components/art';
import ProductImage from '@/components/ProductImage';
import { NotifyMeButton } from '@/components/NotifyMeButton';
import { ProductOffers } from '@/components/ProductOffers';
import type { EcomProductInfiniteModel } from '@/types/api';

export interface ProductDetailConfig {
  /** breadcrumb middle link + label, e.g. /batteries + 'البطاريات' */
  listPath: string;
  listLabel: string;
  allLabel: string;
  backLabel: string;
  notFoundLabel: string;
  priceLabel: string;
  cartTitle: (name: string, isAr: boolean) => string;
  features: { icon: LucideIcon; text: string }[];
  whatsappText: string;
  relatedTitle: string;
  /** fallback category used to fetch related products when the product has no category_id */
  relatedCategoryId?: number;
  /** renders the related-products card */
  renderRelatedCard: (p: EcomProductInfiniteModel) => React.ReactNode;
}

/** Generic ecom product show page — driven by GET /connector/api/products/{id} */
export function ProductDetail({ cfg }: { cfg: ProductDetailConfig }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { t, num, fmt, isAr } = useLang();
  const waUrl = useWhatsappUrl();
  const [qty, setQty] = useState(1);

  const productId = Number(id);
  const { data: productRes, isLoading: isProductLoading } = useProduct(
    Number.isFinite(productId) ? productId : null,
  );
  const product = useMemo<EcomProductInfiniteModel | undefined>(() => {
    const raw = (productRes as { data?: { product?: unknown } | unknown } | undefined)?.data;
    const p = (raw && typeof raw === 'object' && 'product' in raw ? (raw as { product?: unknown }).product : raw) as
      | EcomProductInfiniteModel
      | undefined;
    return p && typeof p === 'object' ? p : undefined;
  }, [productRes]);

  const categoryId = product?.category_id ?? cfg.relatedCategoryId;
  const { data: relatedRes } = useEcomProducts(
    categoryId ? { business_id: 1, category_id: categoryId, per_page: 100 } : null,
  );
  const related = useMemo(() => {
    if (!product) return [];
    const raw = (relatedRes as { data?: unknown } | undefined)?.data;
    const arr = (Array.isArray(raw) ? raw : ((raw as { data?: unknown[] })?.data ?? [])) as EcomProductInfiniteModel[];
    return arr.filter((p) => p.id !== product.id).slice(0, 4);
  }, [relatedRes, product]);

  if (isProductLoading && !product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="text-xl font-black text-ink-mute">{t('جاري التحميل...')}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="text-2xl font-black text-ink">{t(cfg.notFoundLabel)}</p>
        <Link to={cfg.listPath} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-coal text-brand px-6 h-12 font-black">
          {t(cfg.backLabel)}
        </Link>
      </div>
    );
  }

  const base = Number(product.default_sell_price ?? product.variation?.sell_price_inc_tax ?? 0);
  const disc = Number(product.discounted_price ?? 0);
  const price = disc > 0 && disc < base ? disc : base;
  const discount = Number(product.discount ?? 0);
  const images =
    Array.isArray(product.images) && product.images.length
      ? product.images.filter(Boolean)
      : product.image_url
        ? [product.image_url]
        : [];
  const qtyAvailable = product.qty_available != null ? Number(product.qty_available) : undefined;
  const outOfStock = qtyAvailable !== undefined && qtyAvailable <= 0;
  const maxQty = qtyAvailable && qtyAvailable > 0 ? qtyAvailable : 99;
  const variationId = product.variation_id ?? product.variation?.id;
  const variationName = product.variation?.name && product.variation.name !== 'DUMMY' ? product.variation.name : '';
  const cartItem = {
    id: `${product.id}-${variationId ?? 0}`,
    title: cfg.cartTitle(product.name, isAr),
    subtitle: variationName,
    price,
    productId: product.id,
    variationId,
  };
  const warrantyMonths = Number(
    (product as { warranty_months?: number }).warranty_months ??
      (product as { warranty?: { duration?: number } }).warranty?.duration ??
      0,
  );

  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="text-sm font-bold text-ink-mute">
          <Link to="/" className="hover:text-ink">{t('الرئيسية')}</Link>
          <span className="mx-2">/</span>
          <Link to={cfg.listPath} className="hover:text-ink">{t(cfg.listLabel)}</Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="mt-6 grid lg:grid-cols-2 gap-8 lg:gap-14">
          {/* Visual */}
          <div className="rounded-2xl border-2 border-border bg-[#ffffff] overflow-hidden aspect-square">
            <ProductImage images={images} alt={product.name} />
          </div>

          {/* Info */}
          <div>
            <Link to={cfg.listPath} className="inline-flex items-center gap-1 text-sm font-bold text-ink-mute hover:text-ink">
              <ArrowRight className="h-4 w-4 rtl:-scale-x-100" /> {t(cfg.allLabel)}
            </Link>
            <div className="mt-2 flex items-center gap-3">
              {product.brand_name && <p className="text-lg font-extrabold text-ink-mute">{product.brand_name}</p>}
              {product.brand_jobsheet_photo && (
                <img
                  src={product.brand_jobsheet_photo}
                  alt={product.brand_name ?? ''}
                  loading="lazy"
                  className="h-9 w-9 rounded-full border border-border bg-[#ffffff] object-contain"
                />
              )}
            </div>
            <h1 className="mt-1 text-3xl sm:text-4xl font-black text-ink">{product.name}</h1>
            {variationName && <p className="mt-2 text-lg font-bold text-ink-mute">{variationName}</p>}
            {product.sku && (
              <p className="mt-1 text-sm font-bold text-ink-mute">
                SKU: <span className="ltr font-extrabold text-ink">{product.sku}</span>
              </p>
            )}
            {!!product.description && (
              <p className="mt-3 text-base font-semibold text-ink-mute leading-relaxed">{product.description}</p>
            )}

            <div className="mt-5 rounded-2xl border-2 border-ink bg-white p-5 shadow-[0_8px_0_#f6c744]">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-black text-ink">{fmt(price)}</p>
                  {disc > 0 && disc < base && (
                    <p className="text-sm font-bold text-ink-mute line-through">{fmt(base)}</p>
                  )}
                  <p className="text-sm font-bold text-ink-mute">{t(cfg.priceLabel)}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {discount > 0 && (
                    <span className="rounded-full px-3 py-1 text-xs font-black bg-red-600 text-white">
                      {t('خصم')} {product.discount_type === 'percentage' ? `${num(discount)}%` : fmt(discount)}
                    </span>
                  )}
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                      outOfStock
                        ? 'bg-red-50 text-red-700'
                        : qtyAvailable !== undefined && qtyAvailable <= 5
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {outOfStock ? t('نفدت الكمية') : qtyAvailable !== undefined && qtyAvailable <= 5 ? t('كمية محدودة') : t('متوفر')}
                  </span>
                </div>
              </div>

              {warrantyMonths > 0 && (
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-xs font-extrabold text-ink">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                  {t('ضمان')} <span className="ltr font-black">{num(warrantyMonths)} {t('شهر')}</span>
                </p>
              )}

              {outOfStock ? (
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl bg-amber-50 border-2 border-amber-200 p-3 text-center">
                    <p className="text-sm font-extrabold text-amber-800">
                      {t('المنتج غير متوفر حاليًا — سجّل تنبيه وهنقولك أول ما يرجع')}
                    </p>
                  </div>
                  <NotifyMeButton productId={product.id} variationId={variationId} />
                </div>
              ) : (
                <>
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/70 px-4 py-3">
                    <div className="flex items-center gap-1" role="group" aria-label={t('الكمية')}>
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
                      <p className="text-xs font-bold text-ink-mute">{fmt(price)} × {num(qty)}</p>
                      <p className="text-2xl font-black text-ink">{fmt(price * qty)}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => add(cartItem, qty)}
                      className="rounded-xl bg-white text-ink h-12 text-base font-black border-2 border-ink hover:bg-muted transition-colors"
                    >
                      {t('أضف للسلة')}
                    </button>
                    <button
                      onClick={() => {
                        add(cartItem, qty);
                        navigate('/checkout');
                      }}
                      className="rounded-xl bg-brand text-coal h-12 text-base font-black border-2 border-coal shadow-[0_4px_0_#191919] hover:translate-y-[2px] hover:shadow-[0_2px_0_#191919] transition-all"
                    >
                      {t('اشتري الآن')}
                    </button>
                  </div>
                </>
              )}
            </div>

            <ul className="mt-6 space-y-3">
              {cfg.features.map((f) => (
                <li key={f.text} className="flex items-center gap-3 text-base font-bold text-ink">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-light text-ink">
                    <f.icon className="h-5 w-5" />
                  </span>
                  {t(f.text)}
                </li>
              ))}
            </ul>

            <ProductOffers productId={product.id} variationId={variationId} />

            <a href={waUrl} target="_blank" rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-base font-black text-ink underline underline-offset-8 decoration-brand decoration-2 hover:decoration-4">
              <WhatsAppIcon className="h-5 w-5 text-[#25D366]" /> {t(cfg.whatsappText)}
            </a>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl sm:text-3xl font-black text-ink">{t(cfg.relatedTitle)}</h2>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p) => cfg.renderRelatedCard(p))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
