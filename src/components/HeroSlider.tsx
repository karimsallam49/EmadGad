import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { useEcomSliders } from '@/hooks/use-home-content';
import { storageUrl } from '@/lib/api';
import type { EcomSliderModel } from '@/types/api';

const AUTO_ADVANCE_MS = 6000;

function slideTarget(s: EcomSliderModel): string | null {
  const link = s.link;
  if (!link?.id) return null;
  if (link.type === 'product') return `/products/${link.id}`;
  if (link.type === 'category') return `/products?business_id=1&category_id=${link.id}`;
  return null;
}

/** banner video — autoplays muted+looped, paused while its slide isn't active */
function BannerVideo({ src, active }: { src: string; active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active) void v.play().catch(() => {});
    else v.pause();
  }, [active]);
  return <video ref={ref} src={src} muted loop playsInline preload="metadata" className="h-full w-full object-cover" />;
}

/** Hero banner slider fed by GET /public/ecom-sliders — shows `fallback` while
 *  loading, on error, or when the business has no banners. */
export function HeroSlider({ fallback }: { fallback: ReactNode }) {
  const { data } = useEcomSliders();
  const slides = data ?? [];
  const [index, setIndex] = useState(0);
  const n = slides.length;

  useEffect(() => {
    if (n < 2) return;
    const id = setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % n);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [n]);

  if (!n) return <>{fallback}</>;
  const active = index % n;

  return (
    <div className="relative mx-auto w-full">
      <div
        dir="ltr"
        className="relative h-56 sm:h-64 lg:h-80 overflow-hidden rounded-2xl border-2 border-coal shadow-[0_8px_0_#00000033]"
      >
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(${-active * 100}%)` }}
        >
          {slides.map((s, i) => {
            const to = slideTarget(s);
            const media =
              s.media_type === 'video' ? (
                <BannerVideo src={storageUrl(s.media_url) ?? ''} active={i === active} />
              ) : (
                <img
                  src={storageUrl(s.media_url) ?? ''}
                  alt={s.link?.name ?? ''}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  className="h-full w-full object-cover"
                />
              );
            return (
              <div key={s.id} className="h-full w-full shrink-0">
                {to ? (
                  <Link to={to} className="block h-full w-full" aria-label={s.link?.name ?? `banner ${i + 1}`}>
                    {media}
                  </Link>
                ) : (
                  media
                )}
              </div>
            );
          })}
        </div>
        {n > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-coal/40 px-2.5 py-1.5 backdrop-blur-sm">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`banner ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-6 bg-brand' : 'w-1.5 bg-white/70'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
