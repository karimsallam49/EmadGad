import { getEcomTracking } from './api';

export const BUSINESS_ID = Number(import.meta.env.VITE_BUSINESS_ID ?? 1) || 1;

type Fbq = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  loaded: boolean;
  version: string;
  push: unknown;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

let gaId: string | null = null;
let pixelId: string | null = null;
let pendingPageView: string | null = null;
let bootPromise: Promise<void> | null = null;

/**
 * Fetch tracking IDs once at boot and inject gtag.js / fbevents.js for the
 * configured ones. Never throws — tracking must not break the storefront.
 */
export function initTracking(businessId: number = BUSINESS_ID) {
  if (!bootPromise) {
    bootPromise = (async () => {
      try {
        const data = await getEcomTracking(businessId);
        if (data?.ga_measurement_id) initGA(data.ga_measurement_id);
        if (data?.facebook_pixel_id) initFbPixel(data.facebook_pixel_id);
        if (pendingPageView) {
          const path = pendingPageView;
          pendingPageView = null;
          sendPageView(path);
        }
      } catch (e) {
        console.warn('tracking init skipped', e);
      }
    })();
  }
  return bootPromise;
}

/** Fire a page view on SPA route changes (initial view is sent by the init snippets). */
export function trackPageView(path: string) {
  // Trackers haven't loaded yet — remember and flush once init finishes.
  if (!gaId && !pixelId) {
    pendingPageView = path;
    return;
  }
  sendPageView(path);
}

/** Forward an event to whichever trackers are active (ViewContent, AddToCart, Purchase…). */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (window.gtag) window.gtag('event', name, params);
  if (window.fbq) window.fbq('track', name, params);
}

function sendPageView(path: string) {
  if (gaId && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
  }
  if (pixelId && window.fbq) {
    window.fbq('track', 'PageView');
  }
}

function initGA(id: string) {
  gaId = id;
  if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${id}"]`)) {
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(s);
  }
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag ?? ((...args: unknown[]) => { window.dataLayer!.push(args); });
  window.gtag('js', new Date());
  window.gtag('config', id); // sends the initial page_view automatically
}

function initFbPixel(id: string) {
  pixelId = id;
  if (!window.fbq) {
    const n = function (...args: unknown[]) {
      if (n.callMethod) n.callMethod(...args);
      else n.queue.push(args);
    } as Fbq;
    if (!window._fbq) window._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    window.fbq = n;
    const t = document.createElement('script');
    t.async = true;
    t.src = 'https://connect.facebook.net/en_US/fbevents.js';
    const s = document.getElementsByTagName('script')[0];
    s.parentNode?.insertBefore(t, s);
  }
  window.fbq('init', id);
  window.fbq('track', 'PageView');
}
