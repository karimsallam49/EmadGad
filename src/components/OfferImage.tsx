import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { IMG } from '@/data';
import { useLang } from '@/i18n';
import { useOffers } from '@/hooks/use-offers';
import { useIdleReady } from '@/hooks/use-idle-ready';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import InstagramEmbed from './InstagramEmbed';
import type { OfferModel } from '@/types/api';

import { Image as ImageIcon, Play, Video } from 'lucide-react';

const isVideoUrl = (u?: string | null) => !!u && /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i.test(u);
const isInstagramUrl = (u?: string | null) => !!u && /instagram\.com\/(reel|p|tv)\//i.test(u);

const toEmbedUrl = (url: string) => {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]+)/);
  return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1&mute=1&loop=1&playlist=${m[1]}` : url;
};

function OfferSlide({ offer, active }: { offer: OfferModel; active: boolean }) {
  const { t, isAr } = useLang();
  const idle = useIdleReady();
  const [showImageFirst, setShowImageFirst] = useState(false);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const video = isAr ? offer.video_ar : offer.video_en;
  const legacy = isAr ? offer.media_ar : offer.media_en;
  const image = isAr ? offer.image_ar : offer.image_en;

  const videoCandidate =
    typeof video === 'string'
      ? video
      : video?.url ?? (isVideoUrl(legacy) ? legacy : null);
  // layout is stable based on whether a video exists; the <video>/iframe itself
  // mounts only for the visible slide and only once the browser is idle so the
  // multi-MB media stays out of the initial render path
  const hasVideo = !!videoCandidate;
  const videoUrl = active && idle ? videoCandidate : null;
  const isLink =
    offer.media_type === 'link' || (typeof video === 'object' && video?.type === 'link');
  const isDirectVideo = isVideoUrl(videoUrl);
  const isIg = isInstagramUrl(videoUrl);

  const title = (isAr ? offer.name_ar : offer.name) ?? offer.name;
  const desc = (isAr ? offer.description_ar : offer.description) ?? offer.description;
  const imageUrl = image ?? (isVideoUrl(legacy) ? null : legacy) ?? IMG.hero;

  const VideoEl = videoUrl ? (
    <div className="relative h-full w-full bg-black">
      {isIg && isLink ? (
        <InstagramEmbed url={videoUrl} className="h-full w-full" />
      ) : isLink && !isDirectVideo ? (
        <iframe
          src={toEmbedUrl(videoUrl)}
          title={title ?? 'EmadGad offer'}
          className="h-full w-full"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <video
          src={videoUrl}
          poster={imageUrl}
          className="h-full w-full object-cover"
          loop
          playsInline
          muted
          autoPlay
          preload="auto"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          ref={(el) => {
            videoRef.current = el;
            if (el) el.play().catch(() => {});
          }}
        />
      )}
      {!isLink && !isIg && !playing && (
        <button
          type="button"
          onClick={() => {
            setPlaying(true);
            videoRef.current?.play().catch(() => {});
          }}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 transition hover:bg-black/10"
          aria-label={t('تشغيل الفيديو')}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-coal shadow-lg backdrop-blur">
            <Play className="h-6 w-6 fill-current" />
          </span>
        </button>
      )}
    </div>
  ) : null;

  const ImageEl = ({ eager = false } = {}) => (
    <img
      src={imageUrl}
      alt={title ?? 'EmadGad offer'}
      className="h-full w-full object-cover"
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'auto'}
      decoding="async"
    />
  );

  if (hasVideo) {
    return (
      <div className="group relative flex flex-col bg-white sm:grid sm:aspect-[3/2] sm:max-h-[400px] sm:grid-cols-2">
        {/* Mobile Media Swap Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowImageFirst(!showImageFirst);
          }}
          className="absolute z-30 top-4 end-4 sm:hidden flex h-12 w-12 items-center justify-center rounded-full bg-brand text-coal shadow-[0_4px_0_#7a5f10] border-2 border-coal hover:translate-y-[1px] hover:shadow-[0_2px_0_#7a5f10] active:scale-95 transition-all"
          title={showImageFirst ? t('عرض الفيديو') : t('عرض الصورة')}
        >
          {showImageFirst ? <Video className="h-6 w-6" /> : <ImageIcon className="h-6 w-6" />}
        </button>

        {/* Media Side (Desktop: Left, Mobile: Top) */}
        <div className="relative aspect-square sm:aspect-auto overflow-hidden bg-black sm:h-full">
          <div className={`h-full w-full transition-all duration-700 ease-in-out ${
            showImageFirst ? 'translate-x-full opacity-0 sm:translate-x-0 sm:opacity-100' : 'translate-x-0 opacity-100'
          }`}>
            {VideoEl ?? <ImageEl eager />}
          </div>
          
          {/* Mobile Image Overlay (only visible when toggled) */}
          <div className={`absolute inset-0 h-full w-full transition-all duration-700 ease-in-out sm:hidden ${
            showImageFirst ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
          }`}>
            <ImageEl eager />
          </div>
        </div>

        {/* Content Side (Desktop: Right, Mobile: Bottom) */}
        <div className="flex flex-col min-h-0 bg-white p-4 sm:p-6">
          {/* Desktop Preview Image / Mobile Secondary Media */}
          <div className={`hidden sm:block relative mb-4 h-32 w-full overflow-hidden rounded-xl border-2 border-ink/5 bg-muted shadow-inner`}>
            <ImageEl />
          </div>

          <div className="flex flex-1 flex-col justify-center">
            {title && (
              <h3 className="text-xl font-black leading-tight text-ink sm:text-2xl">
                {title}
              </h3>
            )}
            {desc && (
              <p className="mt-2 line-clamp-3 text-sm font-bold leading-relaxed text-ink-mute sm:text-base">
                {desc}
              </p>
            )}
            <div className="mt-6">
              <Link
                to={`/offers/${offer.id}`}
                className="inline-flex items-center justify-center rounded-xl border-2 border-coal bg-brand px-6 h-12 text-sm font-extrabold text-coal shadow-[0_4px_0_#191919] transition-all hover:translate-y-[2px] hover:shadow-[0_2px_0_#191919] hover:bg-brand-dark"
              >
                {t('عرض تفاصيل العرض')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-square sm:aspect-[3/2] h-full bg-muted">
      <ImageEl eager />

      {title && (
        <div className="absolute top-3 start-3 rotate-[-4deg] rounded-xl bg-coal text-white px-4 py-2 shadow-lg">
          <p className="text-base font-black text-brand">{title}</p>
        </div>
      )}
      {desc && (
        <div className="absolute bottom-3 end-3 rotate-[2deg] rounded-xl bg-white px-4 py-2 shadow-lg border-2 border-coal">
          <p className="text-sm font-black text-ink">{desc}</p>
          <Link
            to={`/offers/${offer.id}`}
            className="mx-auto mt-2 flex w-fit items-center justify-center rounded-lg border-2 border-coal bg-brand px-4 py-1.5 text-xs font-black text-coal shadow-[0_3px_0_#191919] transition-all hover:translate-y-[1px] hover:bg-brand-dark hover:shadow-[0_2px_0_#191919]"
          >
            {t('عرض المزيد')}
          </Link>
        </div>
      )}
    </div>
  );
}

export default function OfferImage() {
  const { t, num, isAr } = useLang();
  const { data: offers, isLoading } = useOffers({ business_id: 1 });
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [snapCount, setSnapCount] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelectedIndex(api.selectedScrollSnap());
    const onReInit = () => {
      setSnapCount(api.scrollSnapList().length);
      onSelect();
    };
    onReInit();
    api.on('select', onSelect);
    api.on('reInit', onReInit);
    return () => {
      api.off('select', onSelect);
      api.off('reInit', onReInit);
    };
  }, [api]);

  if (isLoading) {
    return (
      <div className="relative">
        <div className="relative overflow-hidden rounded-2xl border-2 border-coal shadow-[0_12px_0_#191919]">
          <img
            src={IMG.hero}
            alt="New tires from EmadGad"
            className="w-full h-full object-cover aspect-[3/2]"
            loading="eager"
            fetchPriority="high"
          />
        </div>
      </div>
    );
  }

  if (!offers?.length) {
    return (
      <div className="relative">
        <div className="relative overflow-hidden rounded-2xl border-2 border-coal shadow-[0_12px_0_#191919]">
          <img
            src={IMG.hero}
            alt="New tires from EmadGad"
            className="w-full h-full object-cover aspect-[3/2]"
            loading="eager"
            fetchPriority="high"
          />
        </div>
        <div className="absolute -top-3 -start-2 rotate-[-6deg] rounded-xl bg-coal text-white px-4 py-2 shadow-lg">
          <p className="text-xs font-bold opacity-80">{t('٤ إطارات ابتداءً من')}</p>
          <p className="text-xl font-black text-brand">{num(12600)} <span className="text-sm">{t('جنيه')}</span></p>
        </div>
        <div className="absolute -bottom-3 end-3 rotate-[2deg] rounded-xl bg-white px-4 py-2 shadow-lg border-2 border-coal">
          <p className="text-sm font-black text-ink">{t('تركيب مجاني مع كل ٤ إطارات')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-2xl border-2 border-coal shadow-[0_12px_0_#191919]">
        <Carousel
          opts={{ loop: true, direction: isAr ? 'rtl' : 'ltr' }}
          setApi={setApi}
          className="w-full"
        >
          <CarouselContent className="ml-0">
            {offers.map((offer, i) => (
              <CarouselItem key={offer.id} className="pl-0">
                <OfferSlide offer={offer} active={i === selectedIndex} />
              </CarouselItem>
            ))}
          </CarouselContent>
          {offers.length > 1 && (
            <>
              <CarouselPrevious className="left-2 top-1/2 -translate-y-1/2 size-9 rounded-full border-2 border-coal bg-coal text-brand hover:bg-coal-soft" />
              <CarouselNext className="right-2 top-1/2 -translate-y-1/2 size-9 rounded-full border-2 border-coal bg-coal text-brand hover:bg-coal-soft" />
            </>
          )}
        </Carousel>
      </div>

      {snapCount > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {Array.from({ length: snapCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => api?.scrollTo(i)}
              aria-label={`${t('عرض')} ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === selectedIndex
                  ? 'w-8 bg-coal shadow-[0_2px_0_#19191933]'
                  : 'w-2.5 bg-coal/20 hover:bg-coal/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
