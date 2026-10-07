import { Link } from 'react-router';
import { Facebook, Instagram, MapPin, Phone, Youtube } from 'lucide-react';
import { useAuth } from '@/auth';
import { PHONE_NUMBER, SOCIAL, WHATSAPP_URL } from '@/data';
import { useBusinessLocations } from '@/hooks/use-business-locations';
import { useServices } from '@/hooks/use-services';
import { useSocialMedia, useWhatsappUrl } from '@/hooks/use-social-media';
import { useIdleReady } from '@/hooks/use-idle-ready';
import { useLang } from '@/i18n';
import { MAIN_LOCATION_ID } from './ServiceBookingDialog';
import { WhatsAppIcon } from './art';

/** Official App Store + Google Play badges (store links to be added when apps launch) */
export function StoreBadges({ className = 'h-10' }: { className?: string }) {
  const { t } = useLang();
  return (
    <div className="flex items-center gap-3" dir="ltr">
      <span className="inline-flex rounded-lg overflow-hidden ring-1 ring-white/15 cursor-pointer hover:opacity-90 transition-opacity" title={t('تطبيق iOS')}>
        <img src="/assets/appstore.svg" alt="Download on the App Store" width={120} height={40} loading="lazy" className={`${className} w-auto`} />
      </span>
      <span className="inline-flex rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" title={t('تطبيق أندرويد')}>
        <img src="/assets/playstore.svg" alt="Get it on Google Play" width={135} height={40} loading="lazy" className={`${className} w-auto`} />
      </span>
    </div>
  );
}

export function FinalCTA() {
  const { t } = useLang();
  return (
    <section className="relative overflow-hidden bg-coal">
      <div aria-hidden className="absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: 'repeating-linear-gradient(115deg, #f6c744 0 10px, transparent 10px 38px)' }} />
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-14 lg:py-20 text-center">
        <h2 className="text-3xl sm:text-5xl font-black text-white">{t('جاهز تظبط عربيتك؟')}</h2>
        <p className="mt-3 text-lg font-semibold text-white/70">
          {t('اختار الخدمة أو المنتج اللي محتاجه وابدأ دلوقتي.')}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/tires" className="inline-flex items-center rounded-xl bg-brand text-coal px-7 h-14 text-lg font-black shadow-[0_6px_0_#7a5f10] hover:translate-y-[2px] hover:shadow-[0_4px_0_#7a5f10] transition-all">
            {t('اشتري إطارات')}
          </Link>
          <Link to="/batteries" className="inline-flex items-center rounded-xl bg-white text-ink px-7 h-14 text-lg font-black hover:bg-muted transition-colors">
            {t('اشتري بطارية')}
          </Link>
          <Link to="/booking" className="inline-flex items-center rounded-xl border-2 border-white/40 text-white px-7 h-14 text-lg font-black hover:border-brand hover:text-brand transition-colors">
            {t('احجز خدمة')}
          </Link>
        </div>
        <div className="mt-10 flex flex-col items-center gap-3">
          <p className="text-sm font-bold text-white/60">{t('وقريبًا… حمل تطبيق EmadGad')}</p>
          <StoreBadges className="h-11" />
        </div>
      </div>
    </section>
  );
}

export default function Footer() {
  const { t, isAr, num } = useLang();
  const { user } = useAuth();
  const { data: locations } = useBusinessLocations();
  const { data: socials } = useSocialMedia();
  const whatsappUrl = useWhatsappUrl();
  const idle = useIdleReady();
  const { data: services } = useServices(MAIN_LOCATION_ID, !!user && idle);

  const branchNames = (locations ?? [])
    .filter((l) => l.website_settings?.is_visible !== false)
    .map((l) => (isAr ? l.website_settings?.title_ar || l.name : l.website_settings?.title || l.name))
    .slice(0, 6);

  const serviceLinks = (services ?? []).slice(0, 6).map((s) => ({ l: s.name, to: '/services' }));
  if (!serviceLinks.length) {
    serviceLinks.push({ l: t('كل خدماتنا'), to: '/services' }, { l: t('خدمة متنقلة'), to: '/rescue' });
  }

  const COLS: { title: string; links: { l: string; to?: string; h?: string }[] }[] = [
    { title: 'EmadGad', links: [{ l: t('من نحن'), to: '/#why' }, { l: t('فروعنا'), to: '/branches' }, { l: t('تواصل معنا'), h: whatsappUrl }] },
    { title: t('المنتجات'), links: [{ l: t('الإطارات'), to: '/tires' }, { l: t('البطاريات'), to: '/batteries' }, { l: t('العروض'), to: '/offers' }] },
    { title: t('الخدمات'), links: serviceLinks },
    {
      title: t('فروعنا'),
      links: branchNames.length
        ? branchNames.map((n) => ({ l: n, to: '/branches' }))
        : [{ l: t('كل فروعنا'), to: '/branches' }],
    },
  ];

  return (
    <footer className="bg-coal-soft text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-24 lg:pb-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 lg:grid-cols-5 lg:gap-8">
          <div className="col-span-2 flex flex-col items-center text-center sm:items-start sm:text-start md:col-span-4 lg:col-span-1">
            <span className="inline-flex items-center bg-brand rounded-md px-3 py-2">
              <img src="/assets/logo-dark.webp" alt="EmadGad" width={290} height={64} loading="lazy" className="h-8 w-auto" />
            </span>
            <p className="mt-4 max-w-xs text-sm font-semibold text-white/60 leading-relaxed">
              {t('إطارات وبطاريات وخدمات سيارات سريعة — بأسعار مناسبة وخدمة عندك أو في أقرب فرع.')}
            </p>
            <div className="mt-4 flex items-center justify-center sm:justify-start gap-2">
              {(socials ?? []).map((s) => {
                const Icon = /face/i.test(s.name) ? Facebook
                  : /insta/i.test(s.name) ? Instagram
                  : /youtu/i.test(s.name) ? Youtube
                  : /whats/i.test(s.name) || /wa\.me|whatsapp/i.test(s.link) ? WhatsAppIcon
                  : null;
                return (
                  <a key={s.id} href={s.link} target="_blank" rel="noreferrer" aria-label={s.name}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-brand hover:text-coal transition-colors">
                    {s.icon_url ? (
                      <img src={s.icon_url} alt="" loading="lazy" className="h-5 w-5 object-contain" />
                    ) : Icon ? (
                      <Icon className="h-5 w-5" />
                    ) : (
                      <span className="text-xs font-black">{s.name.slice(0, 2)}</span>
                    )}
                  </a>
                );
              })}
              {!(socials ?? []).length && (
                <>
                  <a href={SOCIAL.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-brand hover:text-coal transition-colors"><Facebook className="h-5 w-5" /></a>
                  <a href={SOCIAL.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-brand hover:text-coal transition-colors"><Instagram className="h-5 w-5" /></a>
                  <a href={SOCIAL.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-brand hover:text-coal transition-colors"><Youtube className="h-5 w-5" /></a>
                  <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-brand hover:text-coal transition-colors"><WhatsAppIcon className="h-5 w-5" /></a>
                </>
              )}
            </div>
            <div className="mt-5">
              <p className="mb-2 text-xs font-extrabold text-white/50">{t('حمل التطبيق')}</p>
              <StoreBadges className="h-9" />
            </div>
          </div>

          {COLS.map((col) => (
            <nav key={col.title} aria-label={col.title} className="min-w-0">
              <h3 className="text-sm font-black text-brand sm:text-base">{col.title}</h3>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.l}>
                    {link.to ? (
                      <Link to={link.to} className="text-[13px] font-semibold text-white/70 hover:text-brand transition-colors sm:text-sm">
                        {link.l}
                      </Link>
                    ) : (
                      <a href={link.h} className="text-[13px] font-semibold text-white/70 hover:text-brand transition-colors sm:text-sm">
                        {link.l}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 pt-6 text-sm font-semibold text-white/50">
          <p>© {new Date().getFullYear()} EmadGad — {t('كل الحقوق محفوظة')}</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5"><Phone className="h-4 w-4" /> <span className="ltr">{t(PHONE_NUMBER)}</span></span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {isAr ? `${num(branchNames.length || 8)} فروع في مصر` : `${num(branchNames.length || 8)} branches in Egypt`}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
