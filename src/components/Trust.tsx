import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { ExternalLink, MapPin, Share2, ShieldCheck, Star, Timer, Wallet, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BRANCHES, BRAND_STRIP, REVIEWS } from '@/data';
import { useBusinessLocations } from '@/hooks/use-business-locations';
import { useAvailablePaymentMethods } from '@/hooks/use-available-payment-methods';
import { useEcomProducts } from '@/hooks/use-ecom-products';
import { useLang } from '@/i18n';
import { storageUrl } from '@/lib/api';
import type { EcomProductInfiniteModel } from '@/types/api';

const WHY = [
  { icon: Wallet, title: 'أسعار مناسبة', desc: 'خدمة تناسب ميزانيتك من غير مفاجآت' },
  { icon: Timer, title: 'خدمة سريعة', desc: 'أقل وقت انتظار — معظم الخدمات أقل من ساعة' },
  { icon: ShieldCheck, title: 'منتجات أصلية', desc: 'إطارات وبطاريات من مصادر موثوقة وبالضمان' },
  { icon: Wrench, title: 'فنيين محترفين', desc: 'خبرة حقيقية في خدمة السيارات' },
  { icon: MapPin, title: 'فروع قريبة', desc: 'خليك قريب من الخدمة في محافظتك' },
];

export function WhyUs() {
  const { t } = useLang();
  return (
    <section id="why" className="bg-paper">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16">
        <h2 className="text-3xl sm:text-4xl font-black text-ink text-center">{t('ليه EmadGad؟')}</h2>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {WHY.map((w) => (
            <div key={w.title} className="rounded-2xl border-2 border-border bg-white p-5 text-center hover:border-ink transition-colors">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-coal">
                <w.icon className="h-6 w-6" />
              </span>
              <p className="mt-3 text-base font-black text-ink">{t(w.title)}</p>
              <p className="mt-1 text-sm font-semibold text-ink-mute leading-relaxed">{t(w.desc)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Auto-scrolling row that stays manually draggable/swipeable.
 * Content must be duplicated by the caller — scroll resets at half-width for a seamless loop.
 */
function AutoScrollRow({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const state = useRef({ dragging: false, hover: false, resumeAt: 0, startX: 0, startScroll: 0, moved: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const s = state.current;
      const dt = Math.min(now - last, 50);
      last = now;
      if (!s.dragging && !s.hover && now >= s.resumeAt) {
        el.scrollLeft += dt * 0.045;
        const half = el.scrollWidth / 2;
        if (half > 0 && el.scrollLeft >= half) el.scrollLeft -= half;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const release = () => {
    state.current.dragging = false;
    state.current.resumeAt = performance.now() + 1500;
  };

  return (
    <div
      ref={ref}
      dir="ltr"
      role="region"
      aria-label={label}
      className="flex w-full items-center overflow-x-auto no-scrollbar select-none"
      onMouseEnter={() => (state.current.hover = true)}
      onMouseLeave={() => {
        state.current.hover = false;
        if (state.current.dragging) release();
      }}
      onPointerDown={(e) => {
        const s = state.current;
        s.dragging = true;
        s.moved = 0;
        s.startX = e.clientX;
        s.startScroll = ref.current?.scrollLeft ?? 0;
      }}
      onPointerMove={(e) => {
        const s = state.current;
        if (!s.dragging || e.pointerType === 'touch') return;
        s.moved = e.clientX - s.startX;
        const el = ref.current;
        if (el) el.scrollLeft = s.startScroll - s.moved;
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onTouchStart={() => (state.current.dragging = true)}
      onTouchEnd={release}
      onDragStart={(e) => e.preventDefault()}
      onClickCapture={(e) => {
        if (Math.abs(state.current.moved) > 8) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      {children}
    </div>
  );
}

export function Brands() {
  const { data } = useEcomProducts({ business_id: 1, per_page: 100 });

  const brands = useMemo(() => {
    const res = data as { data?: unknown } | undefined;
    const items = (Array.isArray(res?.data) ? res.data : []) as EcomProductInfiniteModel[];
    const map = new Map<string, { id?: number; photo: string | null }>();
    for (const p of items) {
      const name = p.brand_name;
      if (name && !map.has(name)) {
        map.set(name, { id: p.brand_id ?? undefined, photo: p.brand_jobsheet_photo ?? null });
      }
    }
    return [...map.entries()].map(([name, v]) => ({ name, id: v.id, photo: v.photo }));
  }, [data]);

  const strip = brands.length
    ? brands
    : BRAND_STRIP.map((name) => ({ name, id: undefined as number | undefined, photo: null as string | null }));

  return (
    <section aria-label="الماركات المتاحة" className="bg-white border-y border-border overflow-hidden">
      <div className="py-4">
        <AutoScrollRow label="الماركات المتاحة">
          {[...strip, ...strip].map((b, i) => {
            const inner = b.photo ? (
              <img
                src={b.photo}
                alt={b.name}
                title={b.name}
                loading="lazy"
                draggable={false}
                className="h-10 sm:h-14 w-auto min-w-10 object-contain transition-transform hover:scale-110"
              />
            ) : (
              <span className="whitespace-nowrap text-lg font-black uppercase tracking-widest text-ink/35">
                {b.name}
              </span>
            );
            return b.id ? (
              <Link
                key={`${b.name}-${i}`}
                to={`/products?business_id=1&device_brand_id=${b.id}&brand_name=${encodeURIComponent(b.name)}`}
                aria-label={b.name}
                className="shrink-0 me-10 sm:me-14"
              >
                {inner}
              </Link>
            ) : (
              <span key={`${b.name}-${i}`} className="shrink-0 me-10 sm:me-14">
                {inner}
              </span>
            );
          })}
        </AutoScrollRow>
      </div>
    </section>
  );
}

/** Admin-configured payment methods (Aman, Vodafone Cash, InstaPay…) as a marquee strip */
export function PaymentMethodsStrip() {
  const { t, isAr } = useLang();
  const { data: methods } = useAvailablePaymentMethods(1);

  if (!methods?.length) return null;

  return (
    <section aria-label={t('طرق الدفع المتاحة')} className="bg-paper overflow-hidden">
      <div className="py-8">
        <p className="text-center text-sm font-extrabold uppercase tracking-[0.2em] text-ink-mute">
          {t('طرق الدفع المتاحة')}
        </p>
        <div className="mt-5">
          <AutoScrollRow label={t('طرق الدفع المتاحة')}>
            {[...methods, ...methods].map((m, i) => (
              <span
                key={`${m.id}-${i}`}
                className="shrink-0 me-10 sm:me-14"
                title={isAr ? (m.name_ar ?? m.name_en ?? m.name) : (m.name_en ?? m.name_ar ?? m.name)}
              >
                {m.image ? (
                  <img
                    src={m.image}
                    alt={isAr ? (m.name_ar ?? m.name_en ?? m.name) : (m.name_en ?? m.name_ar ?? m.name)}
                    loading="lazy"
                    draggable={false}
                    className="h-10 sm:h-14 w-auto min-w-10 object-contain transition-transform hover:scale-110"
                  />
                ) : (
                  <span className="whitespace-nowrap text-lg font-black uppercase tracking-widest text-ink/35">
                    {isAr ? (m.name_ar ?? m.name_en ?? m.name) : (m.name_en ?? m.name_ar ?? m.name)}
                  </span>
                )}
              </span>
            ))}
          </AutoScrollRow>
        </div>
      </div>
    </section>
  );
}

export function BranchFinder() {
  const { t, isAr, num } = useLang();
  const { data: locations, isLoading } = useBusinessLocations();
  const [branchId, setBranchId] = useState<string>('');

  const branches = useMemo(() => {
    const apiList = (locations ?? [])
      .filter((l) => l.website_settings?.is_visible !== false)
      .map((l) => {
        const ws = l.website_settings;
        return {
          id: String(l.id),
          name: isAr ? ws?.title_ar || l.name : ws?.title || l.name,
          subtitle: (isAr ? ws?.subtitle_ar : ws?.subtitle) ?? null,
          address: ws?.address ?? l.address ?? null,
          image: storageUrl(ws?.branch_image) ?? storageUrl(ws?.hero_section_image),
          logo: storageUrl(ws?.logo) ?? storageUrl(ws?.icon),
          lat: l.latitude ?? ws?.latitude ?? null,
          lng: l.longitude ?? ws?.longitude ?? null,
          coverage: l.coverage ?? ws?.coverage ?? null,
          carService: !!ws?.is_car_service,
        };
      });
    if (apiList.length) return apiList;
    return BRANCHES.map((b) => ({
      id: b.id,
      name: b.name,
      subtitle: `${t(b.area)}، ${t(b.gov)}`,
      address: b.address,
      image: null,
      logo: null,
      lat: null,
      lng: null,
      coverage: null,
      carService: true,
    }));
  }, [locations, isAr]);

  useEffect(() => {
    if (branches.length && !branches.some((b) => b.id === branchId)) {
      setBranchId(branches[0].id);
    }
  }, [branches, branchId]);

  const branch = branches.find((b) => b.id === branchId);
  const [mapOpen, setMapOpen] = useState(false);

  const mapsUrl =
    branch?.lat != null && branch?.lng != null
      ? `https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}`
      : `https://maps.google.com/?q=${encodeURIComponent(branch?.name ?? '')}`;
  const embedUrl =
    branch?.lat != null && branch?.lng != null
      ? `https://maps.google.com/maps?q=${branch.lat},${branch.lng}&z=15&hl=${isAr ? 'ar' : 'en'}&output=embed`
      : `https://maps.google.com/maps?q=${encodeURIComponent(branch?.name ?? '')}&hl=${isAr ? 'ar' : 'en'}&output=embed`;

  const shareLocation = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: branch?.name, url: mapsUrl });
      } else {
        await navigator.clipboard.writeText(mapsUrl);
        toast.success(t('تم نسخ رابط الموقع'));
      }
    } catch {
      /* user dismissed the share sheet */
    }
  };

  return (
    <section id="branches" className="bg-paper">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 items-start">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-ink">{t('أقرب EmadGad ليك')}</h2>
            <p className="mt-2 text-lg font-semibold text-ink-mute">
              {t('اختار أقرب فرع ليك وهنوريك تفاصيله وموقعه على الخريطة.')}
            </p>
            <div className="mt-6">
              <Select dir={isAr ? 'rtl' : 'ltr'} value={branchId} onValueChange={setBranchId} disabled={isLoading}>
                <SelectTrigger className="h-12 w-full rounded-xl border-2 border-border bg-white font-bold focus:ring-brand">
                  <SelectValue placeholder={isLoading ? t('جاري تحميل الفروع...') : t('اختار الفرع')} />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id} className="font-bold">{t(b.name)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="mt-4 text-sm font-bold text-ink-mute">
              {isAr
                ? `${num(branches.length)} فروع في محافظات مصر — وبنكبر كل شهر.`
                : `${num(branches.length)} branches across Egypt — growing every month.`}
            </p>
          </div>

          {branch && (
            <>
            <article className="rounded-2xl border-2 border-ink bg-white overflow-hidden shadow-[0_8px_0_#f6c744]">
              {branch.image && (
                <img src={branch.image} alt={branch.name} loading="lazy" className="h-44 w-full object-cover" />
              )}
              <div className="p-6">
                <div className="flex items-center gap-3">
                  {branch.logo && (
                    <img
                      src={branch.logo}
                      alt=""
                      loading="lazy"
                      className="h-12 w-12 shrink-0 rounded-full border border-border bg-white object-contain"
                    />
                  )}
                  <h3 className="text-2xl font-black text-ink">{t(branch.name)}</h3>
                </div>
                {branch.subtitle && (
                  <p className="mt-2 text-base font-bold text-ink-mute">{t(branch.subtitle)}</p>
                )}
                {branch.address && (
                  <p className="mt-2 flex items-center gap-2 text-base font-bold text-ink">
                    <MapPin className="h-5 w-5 shrink-0 text-ink-mute" /> {t(branch.address)}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {branch.carService && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-extrabold text-ink">
                      <Wrench className="h-3.5 w-3.5" /> {t('خدمات سيارات')}
                    </span>
                  )}
                  {branch.coverage != null && branch.coverage > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-extrabold text-ink">
                      <MapPin className="h-3.5 w-3.5" /> {isAr ? `نغطي لحد ${num(branch.coverage)} كم` : `Covers up to ${num(branch.coverage)} km`}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setMapOpen(true)}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-coal text-brand h-12 text-base font-black hover:bg-coal-soft transition-colors"
                >
                  <MapPin className="h-5 w-5" /> {t('الاتجاهات على الخريطة')}
                </button>
              </div>
            </article>

            <Dialog open={mapOpen} onOpenChange={setMapOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black">{branch.name}</DialogTitle>
                </DialogHeader>
                <iframe
                  src={embedUrl}
                  title={`${branch.name} map`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  className="aspect-[4/3] w-full rounded-xl border-2 border-border bg-muted"
                />
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={shareLocation}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-ink bg-white text-ink h-12 text-base font-black hover:bg-muted transition-colors"
                  >
                    <Share2 className="h-5 w-5" /> {t('شارك الموقع')}
                  </button>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-coal text-brand h-12 text-base font-black hover:bg-coal-soft transition-colors"
                  >
                    <ExternalLink className="h-5 w-5" /> {t('افتح في خرائط جوجل')}
                  </a>
                </div>
              </DialogContent>
            </Dialog>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export function Reviews() {
  const { t, num } = useLang();
  return (
    <section id="reviews" className="bg-white border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16">
        <h2 className="text-3xl sm:text-4xl font-black text-ink text-center">{t('عملائنا بيقولوا إيه؟')}</h2>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {REVIEWS.map((r) => (
            <figure key={r.name} className="flex flex-col rounded-2xl border-2 border-border bg-paper p-5">
              <div className="flex items-center gap-0.5" aria-label={`${num(r.stars)} / 5`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < r.stars ? 'fill-brand text-brand-dark' : 'text-border'}`} />
                ))}
              </div>
              <blockquote className="mt-3 flex-1 text-sm font-semibold text-ink leading-relaxed">
                "{t(r.text)}"
              </blockquote>
              <figcaption className="mt-4 border-t border-border pt-3">
                <p className="text-base font-black text-ink">{t(r.name)}</p>
                <p className="text-xs font-bold text-ink-mute">{t(r.service)}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
