import { useMemo } from 'react';
import { useLang } from '@/i18n';
import { useEcomBlogs } from '@/hooks/use-blogs';
import { useSeo } from '@/hooks/use-seo';
import { BlogCard } from '@/components/BlogsSection';
import type { BlogSeo } from '@/types/api';

export default function BlogListPage() {
  const { t, isAr } = useLang();
  const query = useEcomBlogs(12);
  const posts = (query.data?.pages ?? []).flatMap((p) => p.posts);
  const total = query.data?.pages?.[0]?.total ?? 0;

  const seo = useMemo<BlogSeo>(() => {
    const title = isAr ? 'المقالات | EmadGad' : 'Articles | EmadGad';
    const description = isAr
      ? 'نصايح ومواضيع تهمّك عن عربيتك — صيانة، إطارات، بطاريات، وأكتر من فريق عماد جاد.'
      : 'Car tips & topics that matter — maintenance, tires, batteries and more from the EmadGad team.';
    const url = window.location.href;
    return {
      title,
      description,
      canonical: url,
      og: {
        type: 'website',
        site_name: 'EmadGad',
        locale: isAr ? 'ar_EG' : 'en_US',
        locale_alternate: isAr ? 'en_US' : 'ar_EG',
        url,
        title,
        description,
      },
      twitter: { card: 'summary_large_image', title, description },
    };
  }, [isAr]);
  useSeo(seo);

  return (
    <div className="bg-paper min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 lg:py-14">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-black text-ink">{t('المقالات')}</h1>
          <p className="mt-2 text-lg font-semibold text-ink-mute">
            {t('نصايح ومواضيع تهمّك عن عربيتك — من فريق عماد جاد.')}
          </p>
        </div>

        {query.isLoading ? (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-white border-2 border-border animate-pulse" />
            ))}
          </div>
        ) : !posts.length ? (
          <p className="mt-14 text-center text-lg font-bold text-ink-mute">
            {t('مفيش مقالات لسه — تابعنا قريب.')}
          </p>
        ) : (
          <>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map((post, i) => (
                <BlogCard key={post.id} post={post} featured={i === 0} />
              ))}
            </div>

            {query.hasNextPage && (
              <div className="mt-10 text-center">
                <button
                  onClick={() => query.fetchNextPage()}
                  disabled={query.isFetchingNextPage}
                  className="inline-flex items-center justify-center rounded-xl bg-coal px-10 h-12 text-base font-black text-brand shadow-[0_6px_0_#00000055] hover:translate-y-[2px] hover:shadow-[0_4px_0_#00000055] transition-all disabled:opacity-40 disabled:translate-y-0 disabled:shadow-none"
                >
                  {query.isFetchingNextPage ? t('جاري التحميل...') : t('عرض المزيد')}
                </button>
                {total > 0 && (
                  <p className="mt-3 text-sm font-bold text-ink-mute">
                    {posts.length} / {total}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
