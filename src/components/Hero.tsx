import { Link } from 'react-router';
import { MapPin, ShieldCheck, Timer, Zap } from 'lucide-react';
import { useLang } from '@/i18n';
import { TireFinderForm } from './TireFinder';
import OfferImage from './OfferImage';

const TRUST = [
  { icon: Timer, label: 'خدمة من ٣٠ دقيقة' },
  { icon: MapPin, label: 'فروع في كل مكان' },
  { icon: ShieldCheck, label: 'منتجات أصلية بالضمان' },
];

export default function Hero({ onSearch }: { onSearch: (size: string) => void }) {
  const { t } = useLang();

  return (
    <section id="top" className="relative overflow-hidden bg-brand">
      <div aria-hidden className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: 'repeating-linear-gradient(115deg, #191919 0 14px, transparent 14px 42px)' }} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-12 lg:pt-14 lg:pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <p className="inline-flex items-center gap-2 rounded-full bg-coal text-brand px-4 py-1.5 text-sm font-extrabold">
              {t('إطارات • بطاريات • خدمة سريعة')}
            </p>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white text-ink px-4 py-1.5 text-sm font-extrabold border-2 border-coal shadow-[0_3px_0_#191919]">
              <Zap className="h-4 w-4 fill-brand text-ink" />
              {t('أسرع خدمة في مصر')}
            </p>
          </div>
          <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.15] lg:leading-[1.2] text-coal">
            {t('كل اللي عربيتك محتاجاه..')}
            <span className="block mt-1">{t('أسرع وأسهل')}</span>
          </h1>
          <p className="mt-3 text-lg sm:text-xl font-semibold text-coal/75 leading-relaxed">
            {t('إطارات، بطاريات وخدمات سريعة لعربيتك — بأسعار مناسبة، وخدمة عندك أو في أقرب فرع.')}
          </p>
        </div>

        <div className="mt-8 grid lg:grid-cols-[1.05fr_0.95fr] gap-6 lg:gap-10 items-center">
          {/* Tire finder inside the banner */}
          <TireFinderForm onSearch={onSearch} />

          {/* Real tire photo */}
          <OfferImage />
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <Link to="/batteries"
              className="inline-flex items-center gap-2 rounded-xl bg-white text-ink px-6 h-12 text-base font-black border-2 border-coal shadow-[0_5px_0_#191919] hover:translate-y-[2px] hover:shadow-[0_3px_0_#191919] transition-all">
              {t('اشتري بطارية')}
            </Link>
            <Link to="/booking"
              className="inline-flex items-center gap-2 rounded-xl bg-coal text-brand px-6 h-12 text-base font-black shadow-[0_5px_0_#00000055] hover:translate-y-[2px] hover:shadow-[0_3px_0_#00000055] transition-all">
              {t('احجز خدمتك')}
            </Link>
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {TRUST.map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-sm font-bold text-coal/80">
                <item.icon className="h-5 w-5" />
                {t(item.label)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
