import { Link } from 'react-router';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { useLang } from '@/i18n';
import { useEcomBlogs } from '@/hooks/use-blogs';
import type { EcomBlogPostModel } from '@/types/api';

export function blogImage(post: EcomBlogPostModel): string {
  return post.image ?? post.image_url ?? '/assets/bgd.png';
}

export function blogDateLabel(date: string | null | undefined, isAr: boolean): string {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function BlogCard({ post, featured = false }: { post: EcomBlogPostModel; featured?: boolean }) {
  const { t, isAr } = useLang();
  const title = (isAr && post.title_ar) || post.title;
  const excerpt = (isAr && post.excerpt_ar) || post.excerpt;
  const date = blogDateLabel(post.blog_date, isAr);

  const inner = (
    <>
      <div className={`relative overflow-hidden ${featured ? 'aspect-[16/9]' : 'aspect-[16/10]'}`}>
        <img
          src={blogImage(post)}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {post.category?.name && (
          <span className="absolute top-3 start-3 rounded-full bg-coal/85 px-3 py-1 text-xs font-black text-brand">
            {post.category.name}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {date && (
          <p className="flex items-center gap-1.5 text-xs font-bold text-ink-mute">
            <CalendarDays className="h-3.5 w-3.5" />
            {date}
          </p>
        )}
        <h3 className={`mt-2 font-black text-ink line-clamp-2 ${featured ? 'text-xl sm:text-2xl' : 'text-lg'}`}>
          {title}
        </h3>
        {excerpt && (
          <p className="mt-2 text-sm font-semibold text-ink-mute line-clamp-2">{excerpt}</p>
        )}
        <span className="mt-auto pt-4 inline-flex items-center gap-1.5 text-sm font-black text-ink group-hover:text-brand transition-colors">
          {t('اقرأ المقال')}
          <ArrowLeft className="h-4 w-4 ltr:-scale-x-100" />
        </span>
      </div>
    </>
  );

  const cls = `group flex flex-col overflow-hidden rounded-2xl border-2 border-ink bg-white shadow-[0_6px_0_#f6c744] transition-all hover:-translate-y-1 hover:shadow-[0_10px_0_#f6c744] ${
    featured ? 'sm:col-span-2' : ''
  }`;

  if (!post.slug) return <article className={cls}>{inner}</article>;
  return (
    <Link to={`/blog/${post.slug}`} className={cls}>
      {inner}
    </Link>
  );
}

/** Home blog strip — latest posts + "view all" to /blog */
export default function BlogsSection({ limit = 3 }: { limit?: number }) {
  const { t } = useLang();
  const query = useEcomBlogs(limit);
  const posts = (query.data?.pages ?? []).flatMap((p) => p.posts).slice(0, limit);

  if (query.isLoading) {
    return (
      <section className="bg-paper">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-white border-2 border-border animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!posts.length) return null;

  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-ink">{t('أحدث المقالات')}</h2>
            <p className="mt-2 text-lg font-semibold text-ink-mute">
              {t('نصايح ومواضيع تهمّك عن عربيتك — من فريق عماد جاد.')}
            </p>
          </div>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 rounded-xl bg-coal text-brand px-6 h-11 text-sm font-black hover:bg-coal-soft transition-colors"
          >
            {t('اعرض الكل')}
            <ArrowLeft className="h-4 w-4 ltr:-scale-x-100" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {posts.map((post, i) => (
            <BlogCard key={post.id} post={post} featured={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}
