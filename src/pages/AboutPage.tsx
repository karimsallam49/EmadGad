import { Link } from 'react-router';
import { Store } from 'lucide-react';
import { useLang } from '@/i18n';
import { useAboutUs } from '@/hooks/use-about-us';
import { ContentBlocks } from '@/pages/LegalPage';

const FALLBACK = {
  ar: 'EmadGad — وجهتك الأولى لإطارات وبطاريات وخدمات السيارات. منتجات أصلية بالضمان، فنيين محترفين، وفروع قريبة منك.',
  en: 'EmadGad — your first stop for tires, batteries, and car services. Genuine warranted products, expert technicians, and branches near you.',
};

export default function AboutPage() {
  const { t, isAr } = useLang();
  const { data, isLoading } = useAboutUs();

  const content = (isAr ? data?.ar : data?.en)?.trim() || (isAr ? data?.en : data?.ar)?.trim();
  const isHtml = !!content && /<\/?[a-z][\s\S]*>/i.test(content);

  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 lg:py-14">
        <nav aria-label="breadcrumb" className="text-sm font-bold text-ink-mute">
          <Link to="/" className="hover:text-ink">{t('الرئيسية')}</Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{t('من نحن')}</span>
        </nav>

        <div className="mt-6 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-coal">
            <Store className="h-6 w-6" />
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-ink">{t('من نحن')}</h1>
        </div>

        {isLoading ? (
          <div className="mt-8 space-y-5" aria-hidden>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border-2 border-border bg-white p-6">
                <div className="h-5 w-40 rounded bg-border" />
                <div className="mt-4 space-y-2.5">
                  <div className="h-3.5 w-full rounded bg-muted" />
                  <div className="h-3.5 w-11/12 rounded bg-muted" />
                  <div className="h-3.5 w-4/5 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : isHtml ? (
          <div
            className="blog-content mt-8 rounded-2xl border-2 border-border bg-white p-6 text-ink"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : content ? (
          <ContentBlocks text={content} />
        ) : (
          <div className="mt-8 rounded-2xl border-2 border-border bg-white p-6">
            <p className="text-sm font-semibold text-ink leading-relaxed">{isAr ? FALLBACK.ar : FALLBACK.en}</p>
          </div>
        )}
      </div>
    </div>
  );
}
