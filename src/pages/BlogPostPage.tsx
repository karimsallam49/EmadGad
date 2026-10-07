import { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowRight, CalendarDays, Tag } from 'lucide-react';
import { useLang } from '@/i18n';
import { useEcomBlog } from '@/hooks/use-blogs';
import { useSeo } from '@/hooks/use-seo';
import { blogDateLabel, blogImage } from '@/components/BlogsSection';
import type { BlogSeo } from '@/types/api';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, isAr, lang } = useLang();
  const { data: post, isLoading, isError } = useEcomBlog(slug);

  // Backend seo payload wins — post fields only fill in what it leaves empty
  const seo = useMemo<BlogSeo | null>(() => {
    if (!post) return null;
    const base = ((lang === 'ar' && post.seo_ar) || post.seo) ?? {};
    const title = (isAr && post.title_ar) || post.title;
    const desc = (isAr && post.excerpt_ar) || post.excerpt;
    const img = post.image ?? post.image_url ?? undefined;
    const url = window.location.href;
    const pubTs = post.blog_date ? Date.parse(post.blog_date) : NaN;
    const published = Number.isNaN(pubTs) ? undefined : new Date(pubTs).toISOString();
    return {
      title: base.title ?? `${title} | EmadGad`,
      description: base.description ?? desc ?? undefined,
      keywords: base.keywords,
      canonical: base.canonical ?? url,
      robots: base.robots,
      og: {
        type: 'article',
        site_name: 'EmadGad',
        locale: isAr ? 'ar_EG' : 'en_US',
        locale_alternate: isAr ? 'en_US' : 'ar_EG',
        url,
        title,
        description: desc ?? undefined,
        image: img,
        ...base.og,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: desc ?? undefined,
        image: img,
        ...base.twitter,
      },
      article: {
        published_time: published,
        section: post.category?.name,
        ...base.article,
      },
      structured_data: base.structured_data,
    };
  }, [post, lang, isAr]);
  useSeo(seo);

  if (isLoading) {
    return (
      <div className="bg-paper min-h-screen">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 lg:py-14">
          <div className="h-8 w-1/3 rounded-xl bg-white border-2 border-border animate-pulse" />
          <div className="mt-4 h-12 rounded-xl bg-white border-2 border-border animate-pulse" />
          <div className="mt-6 aspect-[16/9] rounded-2xl bg-white border-2 border-border animate-pulse" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 rounded bg-white animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="bg-paper min-h-[60vh] flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-2xl font-black text-ink">{t('المقال غير موجود')}</h1>
          <p className="mt-2 text-base font-semibold text-ink-mute">
            {t('المقال ده مش متاح — ممكن اتمسح أو اللينك غلط.')}
          </p>
          <Link
            to="/blog"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-coal text-brand px-8 h-11 text-sm font-black hover:bg-coal-soft transition-colors"
          >
            <ArrowRight className="h-4 w-4 ltr:-scale-x-100" />
            {t('ارجع للمقالات')}
          </Link>
        </div>
      </div>
    );
  }

  const title = (isAr && post.title_ar) || post.title;
  const content = (isAr && post.content_ar) || post.content;
  const date = blogDateLabel(post.blog_date, isAr);

  return (
    <div className="bg-paper min-h-screen">
      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-10 lg:py-14">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm font-black text-ink-mute hover:text-ink transition-colors"
        >
          <ArrowRight className="h-4 w-4 ltr:-scale-x-100" />
          {t('كل المقالات')}
        </Link>

        <header className="mt-5">
          {(post.category?.name || post.sub_category?.name) && (
            <div className="flex flex-wrap items-center gap-2">
              {post.category?.name && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-coal px-3 py-1 text-xs font-black text-brand">
                  <Tag className="h-3 w-3" />
                  {post.category.name}
                </span>
              )}
              {post.sub_category?.name && (
                <span className="rounded-full bg-brand/20 border border-ink px-3 py-1 text-xs font-black text-ink">
                  {post.sub_category.name}
                </span>
              )}
            </div>
          )}
          <h1 className="mt-3 text-3xl sm:text-4xl font-black text-ink leading-snug">{title}</h1>
          {date && (
            <p className="mt-3 flex items-center gap-1.5 text-sm font-bold text-ink-mute">
              <CalendarDays className="h-4 w-4" />
              {date}
            </p>
          )}
        </header>

        <div className="mt-6 overflow-hidden rounded-2xl border-2 border-ink shadow-[0_8px_0_#f6c744]">
          <img src={blogImage(post)} alt={title} decoding="async" fetchPriority="high" className="w-full aspect-[16/9] object-cover" />
        </div>

        {content && (
          <div
            className="blog-content mt-8 text-ink"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}

      </article>
    </div>
  );
}
