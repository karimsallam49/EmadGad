import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowRight, BadgeCheck, MapPin, ShieldCheck, Truck } from 'lucide-react';
import { TIRES, tireImg, type Tire } from '@/data';
import { useWhatsappUrl } from '@/hooks/use-social-media';
import { useCart } from '@/cart';
import { useLang } from '@/i18n';
import { WhatsAppIcon } from '@/components/art';
import { Stars, TireCard, toTire } from '@/components/TireShop';
import { NotifyMeButton } from '@/components/NotifyMeButton';
import { ProductOffers } from '@/components/ProductOffers';
import { useProduct } from '@/hooks/use-product';
import { useEcomProducts } from '@/hooks/use-ecom-products';

export default function TireDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { t, num, fmt, isAr } = useLang();
  const waUrl = useWhatsappUrl();
  const [qty, setQty] = useState(4);

  const productId = Number(id);
  const { data: productRes, isLoading: isProductLoading } = useProduct(
    Number.isFinite(productId) ? productId : null
  );
  const apiTire = useMemo<Tire | undefined>(() => {
    const raw = (productRes as { data?: { product?: unknown } | unknown } | undefined)?.data;
    const p = (raw && typeof raw === 'object' && 'product' in raw ? (raw as { product?: unknown }).product : raw) as
      | Record<string, unknown>
      | undefined;
    return p && typeof p === 'object' ? toTire(p as any) : undefined;
  }, [productRes]);
  const tire = apiTire ?? TIRES.find((tr) => tr.id === id);

  const { data: relatedRes } = useEcomProducts({ business_id: 1, category_id: 2217, per_page: 100 });
  const related = useMemo(() => {
    if (!tire) return [];
    const raw = (relatedRes as { data?: unknown } | undefined)?.data;
    const arr = (Array.isArray(raw) ? raw : ((raw as { data?: unknown[] })?.data ?? [])) as any[];
    const apiRelated = arr.map((p) => toTire(p)).filter((tr) => tr.id !== tire.id && tr.size === tire.size);
    if (apiRelated.length) return apiRelated.slice(0, 4);
    return TIRES.filter((tr) => tr.id !== tire.id && tr.size === tire.size).slice(0, 4);
  }, [relatedRes, tire]);

  if (isProductLoading && !tire) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="text-xl font-black text-ink-mute">{t('جاري التحميل...')}</p>
      </div>
    );
  }

  if (!tire) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="text-2xl font-black text-ink">{t('الإطار ده مش موجود')}</p>
        <Link to="/tires" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-coal text-brand px-6 h-12 font-black">
          {t('ارجع لمتجر الإطارات')}
        </Link>
      </div>
    );
  }

  const total = tire.price * qty;
  const cartTitle = isAr ? `إطار ${tire.brand} ${tire.model}` : `${tire.brand} ${tire.model} Tire`;
  const outOfStock = tire.qtyAvailable !== undefined && tire.qtyAvailable <= 0;

  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="text-sm font-bold text-ink-mute">
          <Link to="/" className="hover:text-ink">{t('الرئيسية')}</Link>
          <span className="mx-2">/</span>
          <Link to="/tires" className="hover:text-ink">{t('الإطارات')}</Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{tire.brand} {tire.model}</span>
        </nav>

        <div className="mt-6 grid lg:grid-cols-2 gap-8 lg:gap-14">
          {/* Visual */}
          <div className="rounded-2xl border-2 border-border bg-[#ffffff] overflow-hidden flex items-center justify-center">
            <img
              src={tireImg(tire)}
              alt={`${tire.brand} ${tire.model} ${tire.size}`}
              className="w-full aspect-square object-contain mix-blend-multiply p-6"
            />
          </div>

          {/* Info */}
          <div>
            <Link to="/tires" className="inline-flex items-center gap-1 text-sm font-bold text-ink-mute hover:text-ink">
              <ArrowRight className="h-4 w-4 rtl:-scale-x-100" /> {t('كل الإطارات')}
            </Link>
            <div className="mt-2 flex items-center gap-3">
              <p className="text-lg font-extrabold text-ink-mute">{tire.brand}</p>
              <Stars n={tire.rating} />
            </div>
            <h1 className="mt-1 text-3xl sm:text-4xl font-black text-ink">{tire.model}</h1>
            <p className="mt-2 text-lg font-bold text-ink-mute">
              {t('المقاس:')} <span className="ltr font-black text-ink">{tire.size}</span> • {t('مناسب للاستخدام')} {tire.usage === 'SUV' ? 'SUV' : t(tire.usage)}
            </p>

            <div className="mt-5 rounded-2xl border-2 border-ink bg-white p-5 shadow-[0_8px_0_#f6c744]">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-black text-ink">{num(tire.price)} <span className="text-base">{t('جنيه')}</span></p>
                  <p className="text-sm font-bold text-ink-mute">{t('سعر الإطار الواحد')}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${tire.stock === 'متوفر' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {t(tire.stock)}
                </span>
              </div>

              {outOfStock ? (
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl bg-amber-50 border-2 border-amber-200 p-3 text-center">
                    <p className="text-sm font-extrabold text-amber-800">{t('المنتج غير متوفر حاليًا — سجّل تنبيه وهنقولك أول ما يرجع')}</p>
                  </div>
                  <NotifyMeButton productId={tire.productId} variationId={tire.variationId} />
                </div>
              ) : (
                <>
                  <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="quantity">
                    {[1, 2, 4].map((q) => (
                      <button key={q} onClick={() => setQty(q)}
                        className={`h-11 rounded-xl px-5 text-base font-black transition-colors ${qty === q ? 'bg-coal text-brand' : 'bg-muted text-ink hover:bg-border'}`}>
                        {q === 1 ? t('إطار واحد') : `${num(q)} ${t('إطارات')}`}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/70 px-4 py-3">
                    <p className="text-sm font-bold text-ink-mute">
                      {num(tire.price)} × {num(qty)}
                    </p>
                    <p className="text-2xl font-black text-ink">{fmt(total)}</p>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => add({ id: tire.id, title: cartTitle, subtitle: tire.size, price: tire.price, productId: tire.productId, variationId: tire.variationId }, qty)}
                      className="rounded-xl bg-white text-ink h-12 text-base font-black border-2 border-ink hover:bg-muted transition-colors"
                    >
                      {t('أضف للسلة')}
                    </button>
                    <button
                      onClick={() => {
                        add({ id: tire.id, title: cartTitle, subtitle: tire.size, price: tire.price, productId: tire.productId, variationId: tire.variationId }, qty);
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
              {[
                { icon: BadgeCheck, text: 'تركيب مجاني في أقرب فرع عند شراء ٤ إطارات' },
                { icon: Truck, text: 'متاح خدمة تركيب متنقلة لحد مكانك' },
                { icon: ShieldCheck, text: 'إطار أصلي بالضمان من مصادر موثوقة' },
                { icon: MapPin, text: 'الدفع عند الاستلام أو في الفرع' },
              ].map((f) => (
                <li key={f.text} className="flex items-center gap-3 text-base font-bold text-ink">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-light text-ink">
                    <f.icon className="h-5 w-5" />
                  </span>
                  {t(f.text)}
                </li>
              ))}
            </ul>

            <ProductOffers productId={tire.productId} variationId={tire.variationId} />

            <a href={waUrl} target="_blank" rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-base font-black text-ink underline underline-offset-8 decoration-brand decoration-2 hover:decoration-4">
              <WhatsAppIcon className="h-5 w-5 text-[#25D366]" /> {t('محتاج مساعدة في المقاس؟ كلمنا واتساب')}
            </a>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl sm:text-3xl font-black text-ink">{t('إطارات تانية بنفس المقاس')} <span className="ltr">{tire.size}</span></h2>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((tr) => <TireCard key={tr.id} tire={tr} detailBase="/tires" />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
