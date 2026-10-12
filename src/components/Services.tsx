import { useState } from 'react';
import { useWhatsappUrl } from '@/hooks/use-social-media';
import { useLang } from '@/i18n';
import { WhatsAppIcon } from './art';
import RescueDialog from './RescueDialog';

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
