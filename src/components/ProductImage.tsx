import { useEffect, useRef, useState } from 'react';

interface Props {
  /** Product images — the first renders normally, the rest swap in on hover */
  images: (string | null | undefined)[];
  alt: string;
  className?: string;
}

const PLACEHOLDER = '/assets/product-placeholder.webp';

/** Renders only the first product image; extra images mount on hover and cycle with a crossfade */
export default function ProductImage({ images, alt, className }: Props) {
  const list = images.filter((s): s is string => !!s);
  const [idx, setIdx] = useState(0);
  const [hovering, setHovering] = useState(false);
  const timer = useRef<number | null>(null);

  const start = () => {
    if (list.length < 2) return;
    setHovering(true);
    if (timer.current !== null) return;
    timer.current = window.setInterval(() => setIdx((i) => (i + 1) % list.length), 1100);
  };
  const stop = () => {
    if (timer.current !== null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
    setHovering(false);
    setIdx(0);
  };
  useEffect(
    () => () => {
      if (timer.current !== null) window.clearInterval(timer.current);
    },
    [],
  );

  const rendered = list.length ? (hovering ? list : list.slice(0, 1)) : [PLACEHOLDER];

  return (
    <div onMouseEnter={start} onMouseLeave={stop} className={`relative h-full w-full bg-[#ffffff] ${className ?? ''}`}>
      {rendered.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            if (e.currentTarget.src !== PLACEHOLDER) e.currentTarget.src = PLACEHOLDER;
          }}
          className={`absolute inset-0 h-full w-full object-contain mix-blend-multiply p-4 transition-all duration-500 ${
            i === idx ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
          }`}
        />
      ))}
    </div>
  );
}
