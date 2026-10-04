import { useState } from 'react';
import { Link } from 'react-router';
import { Clock, LogIn } from 'lucide-react';
import { useWhatsappUrl } from '@/hooks/use-social-media';
import { useLang } from '@/i18n';
import { useAuth } from '@/auth';
import { useServices } from '@/hooks/use-services';
import { useIdleReady } from '@/hooks/use-idle-ready';
import { ServiceIcon, WhatsAppIcon } from './art';
import ServiceBookingDialog, { MAIN_LOCATION_ID } from './ServiceBookingDialog';
import RescueDialog from './RescueDialog';
import type { ServiceModel } from '@/lib/api';

export default function ServicesGrid() {
  const { t, fmt } = useLang();
  const { user, loading: isAuthLoading } = useAuth();
  const idle = useIdleReady();
  const { data: services, isLoading, isError } = useServices(MAIN_LOCATION_ID, !!user && idle);
  const [picked, setPicked] = useState<ServiceModel | null>(null);

  return (
    <section id="services" className="bg-paper">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-ink">{t('خدمة سريعة من غير ما تضيع وقتك')}</h2>
          <p className="mt-2 text-lg font-semibold text-ink-mute">
            {t('احجز الخدمة اللي محتاجها — في الفرع أو في مكانك — والسعر واضح من الأول.')}
          </p>
        </div>

        {isAuthLoading || (user && isLoading) ? (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-52 rounded-2xl bg-white border-2 border-border animate-pulse" />
            ))}
          </div>
        ) : !user ? (
          <div className="mt-10 mx-auto max-w-md rounded-2xl border-2 border-ink bg-white p-8 text-center shadow-[0_8px_0_#f6c744]">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-coal text-brand">
              <LogIn className="h-7 w-7" />
            </span>
            <p className="mt-4 text-xl font-black text-ink">{t('سجّل دخولك عشان تشوف خدماتنا وتحجز')}</p>
            <Link
              to="/login"
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-brand text-coal px-8 h-12 text-base font-black border-2 border-coal shadow-[0_4px_0_#191919] hover:translate-y-[2px] hover:shadow-[0_2px_0_#191919] transition-all"
            >
              {t('تسجيل الدخول')}
            </Link>
          </div>
        ) : isError ? (
          <p className="mt-10 text-center text-lg font-bold text-red-700">{t('فشل تحميل الخدمات')}</p>
        ) : (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(services ?? []).map((s) => (
              <article key={s.id}
                className="group flex flex-col rounded-2xl border-2 border-border bg-white p-5 hover:border-ink transition-colors">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-coal text-brand group-hover:bg-brand group-hover:text-coal transition-colors">
                  <ServiceIcon name={s.icon ?? 'wrench'} className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-black text-ink">{s.name}</h3>
                <div className="mt-3 flex items-center justify-between text-sm font-extrabold">
                  {!!s.duration && (
                    <span className="inline-flex items-center gap-1.5 text-ink-mute">
                      <Clock className="h-4 w-4" /> {s.duration}
                    </span>
                  )}
                  {!!s.priceFrom && <span className="text-ink ms-auto">{t('من')} {fmt(s.priceFrom)}</span>}
                </div>
                <div className="mt-auto pt-4">
                  <button
                    onClick={() => setPicked(s)}
                    className="inline-flex w-full items-center justify-center rounded-xl border-2 border-ink h-11 text-base font-black text-ink hover:bg-coal hover:text-brand transition-colors"
                  >
                    {t('اطلب الآن')}
                  </button>
                </div>
              </article>
            ))}
            {!services?.length && (
              <p className="col-span-full rounded-2xl border-2 border-dashed border-border bg-white p-10 text-center text-xl font-black text-ink">
                {t('مفيش خدمات متاحة دلوقتي')}
              </p>
            )}
          </div>
        )}
      </div>

      <ServiceBookingDialog
        service={picked}
        open={!!picked}
        onOpenChange={(o) => !o && setPicked(null)}
      />
    </section>
  );
}

export function MobileService() {
  const { t, num } = useLang();
  const waUrl = useWhatsappUrl();
  const [rescueOpen, setRescueOpen] = useState(false);
  const steps = [
    { t: 'اطلب الخدمة', d: 'واتساب أو مكالمة — قولنا محتاج إيه وفين' },
    { t: 'نحدد معادك', d: 'نأكد عليك الميعاد والسعر قبل ما نتحرك' },
    { t: 'نوصل لحد عندك', d: 'الفني يجيلك بالعدة والقطع ويخلص في مكانك' },
  ];
  return (
    <section id="mobile-service" className="relative overflow-hidden bg-coal">
      <div aria-hidden className="absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: 'repeating-linear-gradient(65deg, #f6c744 0 10px, transparent 10px 38px)' }} />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-14 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-brand text-coal px-4 py-1.5 text-sm font-black">
              {t('الخدمة المتنقلة')}
            </p>
            <h2 className="mt-4 text-3xl sm:text-5xl font-black text-white leading-tight">
              {t('مش لازم تيجي لنا...')}
              <span className="block text-brand">{t('إحنا نجيلك')}</span>
            </h2>
            <p className="mt-4 text-lg font-semibold text-white/70 leading-relaxed max-w-lg">
              {t('خدمة متنقلة للإطارات والبطاريات والخدمات السريعة في مكانك — في البيت، في الشغل، أو حتى على الطريق.')}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => setRescueOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-brand text-coal px-7 h-14 text-lg font-black shadow-[0_6px_0_#7a5f10] hover:translate-y-[2px] hover:shadow-[0_4px_0_#7a5f10] transition-all">
                {t('اطلب خدمة متنقلة')}
              </button>
              <a href={waUrl} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] text-white px-7 h-14 text-lg font-black hover:opacity-90 transition-opacity">
                <WhatsAppIcon className="h-5 w-5" /> {t('واتساب')}
              </a>
            </div>
          </div>

          {/* Steps */}
          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li key={s.t} className="flex items-start gap-4 rounded-2xl border border-white/15 bg-white/5 p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-coal text-xl font-black">
                  {num(i + 1)}
                </span>
                <div>
                  <p className="text-lg font-black text-white">{t(s.t)}</p>
                  <p className="text-sm font-semibold text-white/60">{t(s.d)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <RescueDialog open={rescueOpen} onOpenChange={setRescueOpen} />
    </section>
  );
}
