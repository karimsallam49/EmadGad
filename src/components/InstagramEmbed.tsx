import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    instgrm?: {
      Embeds: { process: () => void };
    };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadInstagramScript() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve) => {
    if (window.instgrm) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://www.instagram.com/embed.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Renders an Instagram reel via the official embed, then scales & crops it
 * so only the video itself covers the container — chrome is clipped out.
 */
export default function InstagramEmbed({ url, className = '' }: { url: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadInstagramScript().then(() => {
      if (cancelled) return;
      setReady(true);
      window.instgrm?.Embeds.process();
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  useEffect(() => {
    if (ready) window.instgrm?.Embeds.process();
  }, [ready, url]);

  // Measure the iframe instagram renders and scale/crop it like object-fit: cover on the video area
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !ready) return;

    const apply = () => {
      const iframe = container.querySelector('iframe');
      if (!iframe) return;
      const cw = container.offsetWidth;
      const ch = container.offsetHeight;
      // instagram may report a huge/odd iframe width — clamp it to the container
      const iw = Math.min(iframe.offsetWidth || cw, cw);
      const ih = iframe.offsetHeight;
      if (!iw || !ih || !cw || !ch) return;
    };

    apply();
    const mo = new MutationObserver(apply);
    mo.observe(container, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
    const ro = new ResizeObserver(apply);
    ro.observe(container);
    return () => {
      mo.disconnect();
      ro.disconnect();
    };
  }, [ready, url]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden bg-black ${className}`}>
      <div
        style={{
          
          transformOrigin: 'top left',
          width: '100%',
          height: '100%',
          
          
        }}
      >
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={url}
          data-instgrm-version="14"
          style={{ margin: 0 }}
        />
      </div>
    </div>
  );
}
