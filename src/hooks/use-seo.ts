import { useEffect } from 'react';
import type { BlogSeo } from '@/types/api';

const INJECTED = 'data-seo-injected';

/** Rewrites API-origin URLs to the storefront origin (canonical / og:url) */
function fixOrigin(url: string | undefined): string | undefined {
  if (!url) return url;
  try {
    const u = new URL(url);
    u.protocol = window.location.protocol;
    u.host = window.location.host;
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * Injects a BlogSeo payload into <head> 1:1 — the backend authors the values,
 * we just mirror them. On unmount every injected tag is removed and every
 * pre-existing tag (index.html statics) is restored to its previous content.
 */
export function useSeo(seo: BlogSeo | null | undefined) {
  useEffect(() => {
    if (!seo) return;
    const restore: (() => void)[] = [];

    /** Updates an existing element or creates an injected one; returns a cleanup */
    const upsert = (
      selector: string,
      create: () => HTMLElement,
      apply: (el: HTMLElement) => void,
      attr = 'content',
    ) => {
      const existing = document.head.querySelector<HTMLElement>(selector);
      if (existing) {
        const prev = existing.getAttribute(attr);
        apply(existing);
        restore.push(() => {
          if (prev === null) existing.removeAttribute(attr);
          else existing.setAttribute(attr, prev);
        });
      } else {
        const el = create();
        el.setAttribute(INJECTED, '');
        apply(el);
        document.head.appendChild(el);
        restore.push(() => el.remove());
      }
    };

    const meta = (attrs: Record<string, string>, content: string | undefined) => {
      if (!content) return;
      const selector = Object.entries(attrs)
        .map(([k, v]) => `[${k}="${v}"]`)
        .join('');
      upsert(`meta${selector}`, () => {
        const el = document.createElement('meta');
        for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
        return el;
      }, (el) => el.setAttribute('content', content));
    };

    // <title> — special-cased since it has no attributes
    if (seo.title) {
      const prev = document.title;
      document.title = seo.title;
      restore.push(() => {
        document.title = prev;
      });
    }

    meta({ name: 'description' }, seo.description);
    meta({ name: 'keywords' }, seo.keywords?.length ? seo.keywords.join(', ') : undefined);
    meta({ name: 'robots' }, seo.robots);

    if (seo.canonical) {
      upsert('link[rel="canonical"]', () => {
        const el = document.createElement('link');
        el.setAttribute('rel', 'canonical');
        return el;
      }, (el) => el.setAttribute('href', fixOrigin(seo.canonical)!), 'href');
    }

    if (seo.og) {
      meta({ property: 'og:title' }, seo.og.title);
      meta({ property: 'og:description' }, seo.og.description);
      meta({ property: 'og:image' }, seo.og.image);
      meta({ property: 'og:url' }, fixOrigin(seo.og.url));
      meta({ property: 'og:type' }, seo.og.type);
      meta({ property: 'og:site_name' }, seo.og.site_name);
      meta({ property: 'og:locale' }, seo.og.locale);
      meta({ property: 'og:locale:alternate' }, seo.og.locale_alternate);
    }

    if (seo.twitter) {
      meta({ name: 'twitter:card' }, seo.twitter.card);
      meta({ name: 'twitter:title' }, seo.twitter.title);
      meta({ name: 'twitter:description' }, seo.twitter.description);
      meta({ name: 'twitter:image' }, seo.twitter.image);
    }

    if (seo.article) {
      meta({ property: 'article:published_time' }, seo.article.published_time);
      meta({ property: 'article:modified_time' }, seo.article.modified_time);
      meta({ property: 'article:author' }, seo.article.author);
      meta({ property: 'article:section' }, seo.article.section);
    }

    if (seo.structured_data) {
      const el = document.createElement('script');
      el.type = 'application/ld+json';
      el.setAttribute(INJECTED, '');
      el.textContent = JSON.stringify(seo.structured_data);
      document.head.appendChild(el);
      restore.push(() => el.remove());
    }

    return () => {
      for (const undo of restore) undo();
    };
  }, [seo]);
}
