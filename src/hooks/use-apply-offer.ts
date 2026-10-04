import { useState } from 'react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { useCart } from '@/cart';
import { getEcomProducts, getProduct } from '@/lib/api';
import { useEcomProducts } from '@/hooks/use-ecom-products';
import type { OfferModel, OfferRawModel } from '@/types/api';

type AnyOffer = OfferModel | OfferRawModel;

/** Product shape as it may come from GET /products/{id} or /public/ecom-products — field names vary */
export interface OfferProductInfo {
  id?: number;
  name?: string;
  price?: number | string;
  defaultSellPrice?: number | string;
  default_sell_price?: number | string;
  sell_price_inc_tax?: number | string;
  discounted_price?: number | string;
  product_id?: number;
  variation_id?: number | null;
  variation?: { id?: number; name?: string; sell_price_inc_tax?: number | string; default_sell_price?: number | string } | null;
  variations?: Array<{ sell_price_inc_tax?: number | string; default_sell_price?: number | string }> | null;
  product_variations?: Array<{
    variations?: Array<{ sell_price_inc_tax?: number | string; default_sell_price?: number | string }> | null;
  }> | null;
  [key: string]: unknown;
}

const productKeys = {
  detail: (id: number) => ['product', id] as const,
};

const asRecord = (v: unknown): Record<string, unknown> | null =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;

/** The product payload may be wrapped in data/product, be an array, or the raw object */
export function extractProduct(res: unknown): OfferProductInfo {
  let cur: unknown = res;
  for (let i = 0; i < 4; i++) {
    const r = asRecord(cur);
    if (!r) return {};
    if (r.id != null && (r.name != null || r.sku != null)) return r as OfferProductInfo;
    const next = r.data ?? r.product ?? (Array.isArray(cur) ? (cur as unknown[])[0] : undefined);
    if (next === undefined) return r as OfferProductInfo;
    cur = next;
  }
  return asRecord(cur) ?? {};
}

const priceKeys = ['discounted_price', 'sell_price_inc_tax', 'default_sell_price', 'defaultSellPrice', 'price'] as const;

function firstFinitePrice(rec: Record<string, unknown> | null | undefined): number {
  if (!rec) return 0;
  for (const k of priceKeys) {
    const n = Number(rec[k]);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
}

export function productPrice(p: OfferProductInfo | null | undefined): number {
  if (!p) return 0;
  const direct = firstFinitePrice(p as Record<string, unknown>);
  if (direct > 0) return direct;
  const fromVariation = firstFinitePrice(asRecord(p.variation));
  if (fromVariation > 0) return fromVariation;
  for (const v of p.variations ?? []) {
    const n = firstFinitePrice(v as Record<string, unknown>);
    if (n > 0) return n;
  }
  for (const pv of p.product_variations ?? []) {
    for (const v of pv.variations ?? []) {
      const n = firstFinitePrice(v as Record<string, unknown>);
      if (n > 0) return n;
    }
  }
  return 0;
}

export function productName(p: OfferProductInfo | null | undefined): string | undefined {
  const v = p?.name;
  return typeof v === 'string' && v ? v : undefined;
}

/** Fetches product info for each id — merges GET /products/{id} with the ecom-products selected_item_ids lookup */
export function useOfferProducts(ids: number[], opts?: { enabled?: boolean }) {
  const enabled = opts?.enabled !== false;
  const details = useQueries({
    queries: ids.map((id) => ({
      queryKey: productKeys.detail(id),
      queryFn: async () => extractProduct(await getProduct(id)),
      staleTime: 60_000,
      enabled,
    })),
  });

  const ecomQuery = useEcomProducts(
    enabled && ids.length ? { business_id: 1, selected_item_ids: ids.join(',') } : null,
  );
  const ecomRows = (() => {
    const raw = (ecomQuery.data as Record<string, unknown> | undefined)?.data ?? ecomQuery.data;
    const arr = Array.isArray(raw) ? raw : (raw as Record<string, unknown> | null)?.data;
    return (Array.isArray(arr) ? arr : []) as OfferProductInfo[];
  })();

  return ids.map((id, i) => {
    const a = details[i]?.data;
    const b = ecomRows.find((r) => Number(r.id) === id || Number(r.product_id) === id);
    const best = a && productPrice(a) > 0 ? a : (b ?? a);
    return {
      data: best,
      isLoading: (details[i]?.isLoading ?? false) || (ids.length > 0 && ecomQuery.isLoading),
    };
  });
}

/**
 * Applies an offer to the cart:
 * - combo → adds every combo_items entry with its required quantity (all are needed to trigger it)
 * - buy_x_* → adds the trigger product with min_trigger_quantity
 * Then navigates to checkout — the order API validates the offer server-side.
 */
export function useApplyOffer(offer: AnyOffer | null | undefined, opts?: { fetchProducts?: boolean }) {
  const { add, setOpen } = useCart();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [applying, setApplying] = useState(false);
  const fetchProducts = opts?.fetchProducts !== false;

  const isCombo = offer?.trigger_type === 'combo';
  const comboItems = isCombo ? offer?.combo_items ?? [] : [];
  const triggerProductId =
    !isCombo && (offer?.trigger_type === 'buy_x_get_same' || offer?.trigger_type === 'buy_x_get_other')
      ? offer?.trigger_product_id
      : null;

  const wantedIds = isCombo
    ? comboItems.map((ci) => ci.product_id)
    : triggerProductId
      ? [triggerProductId]
      : [];

  const details = useOfferProducts(wantedIds, { enabled: fetchProducts });
  const loading = applying || (fetchProducts && details.some((d) => d.isLoading));

  /** Product details, fetched lazily on click when fetchProducts is off */
  const resolveProducts = async (): Promise<(OfferProductInfo | undefined)[]> => {
    const eager = details.map((d) => d.data);
    if (!wantedIds.length || !eager.some((d) => !d || !productPrice(d))) return eager;

    const [fetched, ecomRows] = await Promise.all([
      Promise.all(
        wantedIds.map((id) =>
          qc.ensureQueryData({
            queryKey: productKeys.detail(id),
            queryFn: async () => extractProduct(await getProduct(id)),
            staleTime: 60_000,
          }),
        ),
      ),
      getEcomProducts({ business_id: 1, selected_item_ids: wantedIds.join(',') })
        .then((res) => {
          const raw = (res as Record<string, unknown> | undefined)?.data ?? res;
          const arr = Array.isArray(raw) ? raw : (raw as Record<string, unknown> | null)?.data;
          return (Array.isArray(arr) ? arr : []) as OfferProductInfo[];
        })
        .catch(() => [] as OfferProductInfo[]),
    ]);

    return wantedIds.map((id, i) => {
      const a = fetched[i];
      const b = ecomRows.find((r) => Number(r.id) === id || Number(r.product_id) === id);
      return a && productPrice(a) > 0 ? a : (b ?? a);
    });
  };

  const apply = async () => {
    if (!offer || applying) return;
    setApplying(true);
    try {
      const resolved = await resolveProducts();
      if (isCombo) {
        comboItems.forEach((ci, i) => {
          const p = resolved[i];
          const nested = Number(
            ci.variation?.sell_price_inc_tax ??
              ci.variation?.default_sell_price ??
              ci.product?.default_sell_price ??
              ci.product?.sell_price,
          );
          const price = Number.isFinite(nested) && nested > 0 ? nested : productPrice(p);
          add(
            {
              id: ci.variation_id ? `${ci.product_id}-${ci.variation_id}` : String(ci.product_id),
              title: ci.product?.name ?? ci.product_name ?? productName(p) ?? `#${ci.product_id}`,
              subtitle: ci.variation_name ?? ci.variation?.name ?? '',
              price,
              productId: ci.product_id,
              variationId: ci.variation_id ?? p?.variation_id ?? p?.variation?.id ?? undefined,
            },
            Number(ci.quantity) || 1,
          );
        });
      } else if (triggerProductId) {
        const p = resolved[0];
        add(
          {
            id: String(triggerProductId),
            title: productName(p) ?? `#${triggerProductId}`,
            subtitle: '',
            price: productPrice(p),
            productId: triggerProductId,
            variationId: p?.variation_id ?? p?.variation?.id ?? undefined,
          },
          Number(offer.min_trigger_quantity ?? 1) || 1,
        );
      }
      setOpen(false);
      navigate('/checkout', { state: { offerId: offer.id } });
    } finally {
      setApplying(false);
    }
  };

  return {
    apply,
    loading,
    canApply: !!offer && (isCombo ? comboItems.length > 0 : !!triggerProductId),
    /** product details fetched for the trigger/combo items — index-aligned with combo_items */
    products: details.map((d) => d.data),
  };
}
