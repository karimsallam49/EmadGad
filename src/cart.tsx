import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth';
import {
  cartKeys,
  useAddCartItem,
  useClearServerCart,
  useDeleteCartItem,
  useServerCart,
  useUpdateCartItem,
} from '@/hooks/use-cart';
import { addEcomCartItem, storageUrl } from '@/lib/api';

export interface CartItem {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  qty: number;
  /** Backend product id — set when the item comes from the API catalog */
  productId?: number;
  /** Backend variation id — optional; the server falls back to the first variation */
  variationId?: number;
  /** Server cart line id — present only on items that live in the backend cart */
  cartItemId?: number;
  image?: string;
  note?: string;
  /** false when the product/variation was deleted server-side */
  available?: boolean;
}

interface CartCtx {
  items: CartItem[];
  add: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  total: number;
  count: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  clear: () => void;
}

const Ctx = createContext<CartCtx | null>(null);

const CART_STORAGE_KEY = 'emadgad-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const loggedIn = !!user?.id;
  const queryClient = useQueryClient();

  // guest cart — persisted so it survives the login redirect; merged into the
  // server cart on first login
  const [localItems, setLocalItems] = useState<CartItem[]>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(localItems));
    } catch { /* private mode / quota — cart just won't survive reloads */ }
  }, [localItems]);

  // server cart — live prices from the backend, shared across the customer's devices
  const serverCart = useServerCart(loggedIn);
  const addItem = useAddCartItem();
  const updateItem = useUpdateCartItem();
  const deleteItem = useDeleteCartItem();
  const clearServer = useClearServerCart();

  // push the guest cart into the server cart once per login
  const syncedUserRef = useRef<number | null>(null);
  useEffect(() => {
    const uid = user?.id;
    if (!uid) {
      syncedUserRef.current = null;
      return;
    }
    if (syncedUserRef.current === uid) return;
    syncedUserRef.current = uid;
    const pending = localItems.filter((i) => i.productId);
    if (pending.length === 0) return;
    const keep = localItems.filter((i) => !i.productId);
    (async () => {
      const failed: CartItem[] = [];
      for (const i of pending) {
        try {
          await addEcomCartItem({
            product_id: i.productId!,
            variation_id: i.variationId,
            quantity: i.qty,
            note: i.note,
          });
        } catch {
          failed.push(i);
        }
      }
      setLocalItems([...keep, ...failed]);
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // logged in → server lines first (authoritative prices), local leftovers after
  const items = useMemo<CartItem[]>(() => {
    if (!loggedIn) return localItems;
    const remote = (serverCart.data?.items ?? []).map<CartItem>((i) => ({
      id: `cart-${i.id}`,
      cartItemId: i.id,
      title: i.product_name ?? '',
      subtitle: i.variation_name && i.variation_name !== 'DUMMY' ? i.variation_name : '',
      price: i.final_unit_price ?? i.unit_price ?? 0,
      qty: Number(i.quantity) || 1,
      productId: i.product_id,
      variationId: i.variation_id ?? undefined,
      image: storageUrl(i.product_image) ?? undefined,
      note: i.note ?? undefined,
      available: i.is_available !== false,
    }));
    return [...remote, ...localItems];
  }, [loggedIn, serverCart.data, localItems]);

  const add = useCallback(
    (item: Omit<CartItem, 'qty'>, qty = 1) => {
      if (loggedIn && item.productId) {
        addItem.mutate({
          product_id: item.productId,
          variation_id: item.variationId,
          quantity: qty,
          note: item.note,
        });
        setOpen(true);
        return;
      }
      setLocalItems((prev) => {
        const found = prev.find((i) => i.id === item.id);
        if (found) return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + qty } : i));
        return [...prev, { ...item, qty }];
      });
      setOpen(true);
    },
    [loggedIn, addItem],
  );

  const setQty = useCallback(
    (id: string, qty: number) => {
      const line = items.find((i) => i.id === id);
      if (loggedIn && line?.cartItemId) {
        const q = Math.max(1, qty);
        if (q !== line.qty) updateItem.mutate({ id: line.cartItemId, quantity: q });
        return;
      }
      setLocalItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)));
    },
    [loggedIn, items, updateItem],
  );

  const remove = useCallback(
    (id: string) => {
      const line = items.find((i) => i.id === id);
      if (loggedIn && line?.cartItemId) {
        deleteItem.mutate(line.cartItemId);
        return;
      }
      setLocalItems((prev) => prev.filter((i) => i.id !== id));
    },
    [loggedIn, items, deleteItem],
  );

  const clear = useCallback(() => {
    setLocalItems([]);
    if (loggedIn) clearServer.mutate();
  }, [loggedIn, clearServer]);

  const total = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);
  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);

  const value = useMemo(
    () => ({ items, add, remove, setQty, total, count, open, setOpen, clear }),
    [items, add, remove, setQty, total, count, open, clear],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
