import { useInfiniteQuery } from '@tanstack/react-query';
import { getEcomProducts } from '@/lib/api';

interface EcomProductsInfiniteQuery {
  business_id: number;
  per_page?: number;
  page?: number;
  category_id?: number;
  device_brand_id?: number;
  level_id?: number;
  selected_item_ids?: string;
}

export const ecomProductsInfiniteKeys = {
  all: ['ecom-products-infinite'] as const,
  filtered: (query: EcomProductsInfiniteQuery) => [...ecomProductsInfiniteKeys.all, query] as const,
};

export function useEcomProductsInfinite(
  query: EcomProductsInfiniteQuery = { business_id: 1 },
  enabled = true,
) {
  const { page: initialPage, ...rest } = query;
  return useInfiniteQuery({
    queryKey: ecomProductsInfiniteKeys.filtered(rest),
    queryFn: ({ pageParam }) => getEcomProducts({ ...rest, page: pageParam }),
    initialPageParam: initialPage ?? 1,
    getNextPageParam: (res, allPages) => {
      const r = res as Record<string, unknown> | undefined;
      // paginator can sit at the root ({current_page, last_page, data:[…]})
      // or wrapped ({data: {current_page, last_page, data:[…]}})
      const paginator =
        r?.data && typeof r.data === 'object' && !Array.isArray(r.data)
          ? (r.data as Record<string, unknown>)
          : r;
      const current = Number(paginator?.current_page);
      const last = Number(paginator?.last_page);
      if (Number.isFinite(current) && Number.isFinite(last) && last > 0) {
        return current < last ? current + 1 : undefined;
      }
      // plain array — keep going while full pages of fresh items come back
      const items = (
        Array.isArray(r?.data) ? r.data : Array.isArray(paginator?.data) ? (paginator.data as unknown[]) : []
      ) as unknown[];
      const per = rest.per_page ?? 24;
      if (items.length < per) return undefined;
      const seen = new Set<unknown>();
      for (const pg of allPages.slice(0, -1)) {
        const pd = (pg as { data?: unknown })?.data;
        const arr = Array.isArray(pd) ? pd : ((pd as { data?: unknown[] })?.data ?? []);
        for (const p of arr) {
          seen.add((p as { id?: unknown; variation_id?: unknown })?.id ?? (p as { variation_id?: unknown })?.variation_id);
        }
      }
      return items.some(
        (p) => !seen.has((p as { id?: unknown })?.id ?? (p as { variation_id?: unknown })?.variation_id)
      )
        ? allPages.length + 1
        : undefined;
    },
    enabled,
  });
}

/** Flattens the infinite-query pages into a plain, deduplicated product list */
export function ecomProductsFromPages<T>(pages: { data?: unknown }[] | undefined): T[] {
  const seen = new Set<unknown>();
  return (pages ?? [])
    .flatMap((pg) => {
      const d = pg.data as { data?: T[] } | T[] | undefined;
      if (Array.isArray(d)) return d;
      return d?.data ?? [];
    })
    .filter((p) => {
      const k =
        p && typeof p === 'object'
          ? ((p as { id?: unknown }).id ?? (p as { variation_id?: unknown }).variation_id)
          : p;
      if (k != null && seen.has(k)) return false;
      if (k != null) seen.add(k);
      return true;
    });
}
