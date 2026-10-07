import { Link } from 'react-router';
import { ArrowLeft, Car, MapPin, Wrench } from 'lucide-react';
import { IMG } from '@/data';
import { useLang } from '@/i18n';

const NEEDS = [
  {
    title: 'كاوتش',
    sub: 'اختار مقاس الإطار',
    href: '/tires?category_id=2217',
    art: <img src={IMG.tire1} alt="" width={64} height={64} loading="lazy" decoding="async" className="h-16 w-16 rounded-2xl object-cover" />,
    primary: true,
  },
  {
    title: 'بطارية',
    sub: 'اعرف البطارية المناسبة',
    href: '/batteries?category_id=2222',
    art: <img src={IMG.battery} alt="" width={64} height={64} loading="lazy" decoding="async" className="h-16 w-16 rounded-2xl object-cover" />,
  },
  {
    title: 'خدمة سريعة',
    sub: 'خدمة الإنقاذ السريع',
    href: '/rescue',
    art: (
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-coal text-brand">
        <Wrench className="h-8 w-8" />
      </span>
    ),
  },
  {
    title: 'خدمة عندي',
    sub: 'احجز موعد في الفرع',
    href: '/booking',
    art: (
      <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-coal">
        <Car className="h-8 w-8" />
        <MapPin className="absolute -top-1.5 -end-1.5 h-5 w-5 text-ink" />
      </span>
    ),
  },
];

export default function NeedEntry() {
  const { t } = useLang();
  return (
    <section id="need" className="relative z-10 -mt-0 bg-paper">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-ink">{t('إنت محتاج إيه؟')}</h2>
          <p className="mt-2 text-lg font-semibold text-ink-mute">
            {t('قولنا عربيتك محتاجة إيه… وإحنا نسهلهالك')}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {NEEDS.map((n) => (
            <Link
              key={n.title}
              to={n.href}
              className={`group relative flex flex-col items-center gap-3 rounded-2xl border-2 p-5 sm:p-7 text-center transition-all hover:-translate-y-1 ${
                n.primary
                  ? 'bg-coal text-white border-ink shadow-[0_8px_0_#f6c744]'
                  : 'bg-white border-border hover:border-ink hover:shadow-[0_8px_0_#191919]'
              }`}
            >
              {n.art}
              <div>
                <p className={`text-xl sm:text-2xl font-black ${n.primary ? 'text-brand' : 'text-ink'}`}>
                  {t(n.title)}
                </p>
                <p className={`mt-1 text-sm font-semibold ${n.primary ? 'text-white/70' : 'text-ink-mute'}`}>
                  {t(n.sub)}
                </p>
              </div>
              <span
                className={`mt-1 inline-flex items-center gap-1 text-sm font-extrabold transition-transform rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1 ${
                  n.primary ? 'text-brand' : 'text-ink'
                }`}
              >
                {t('ابدأ من هنا')}
                <ArrowLeft className="h-4 w-4 ltr:-scale-x-100" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
