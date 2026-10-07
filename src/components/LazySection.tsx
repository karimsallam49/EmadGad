import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Defers mounting a below-the-fold section until it's near the viewport.
 * Because children never mount up front, their lazy() chunks AND API calls
 * only fire when the user actually scrolls close — keeps the initial load light.
 */
export default function LazySection({
  children,
  minH = 320,
}: {
  children: ReactNode;
  /** Placeholder height in px so layout doesn't jump when the section mounts */
  minH?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (show) return;
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) {
      setShow(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: '500px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [show]);

  const placeholder = <div aria-hidden style={{ minHeight: minH }} />;

  return <div ref={ref}>{show ? <Suspense fallback={placeholder}>{children}</Suspense> : placeholder}</div>;
}
