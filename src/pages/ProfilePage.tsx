import { useRef, useState, type ReactNode } from 'react';
import {
  Bell,
  BellOff,
  BellRing,
  CalendarClock,
  Camera,
  Car,
  Check,
  ChevronLeft,
  Coins,
  Gauge,
  Gift,
  Hash,
  Loader2,
  LogIn,
  LogOut,
  Package,
  Pencil,
  Phone,
  Plus,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  User,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '@/auth';
import { useLang } from '@/i18n';
import { useUpdateCustomer } from '@/hooks/use-update-customer';
import { useCancelEcomOrder, useEcomOrders } from '@/hooks/use-ecom-orders';
import { useNotifyMeSubscriptions, useToggleNotifyMe } from '@/hooks/use-notify-me';
import { useEcomLoyalty } from '@/hooks/use-ecom-loyalty';
import { useEcomInvoice, useEcomInvoices } from '@/hooks/use-ecom-invoices';
import { useAddCustomerCar } from '@/hooks/use-add-customer-car';
import { useContactKm, useScanContactKm, useUpdateContactKm } from '@/hooks/use-contact-km';
import { useBrands } from '@/hooks/use-brands';
import { useModels } from '@/hooks/use-models';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import type { CustomerCarModel, EcomOrderModel } from '@/types/api';

type Tab = 'info' | 'orders' | 'invoices' | 'alerts';
type OrderFilter = 'ongoing' | 'history';

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'تم التأكيد',
  processing: 'قيد التجهيز',
  out_for_delivery: 'في الطريق',
  delivered: 'تم التوصيل',
  completed: 'مكتمل',
  canceled: 'ملغي',
  failed: 'فشل',
  returned: 'مرتجع',
  payment_failed: 'فشل الدفع',
};

const ORDER_STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-300',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
  processing: 'bg-blue-100 text-blue-800 border-blue-300',
  out_for_delivery: 'bg-violet-100 text-violet-800 border-violet-300',
  delivered: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  canceled: 'bg-red-100 text-red-800 border-red-300',
  failed: 'bg-red-100 text-red-800 border-red-300',
  returned: 'bg-red-100 text-red-800 border-red-300',
  payment_failed: 'bg-red-100 text-red-800 border-red-300',
};

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  unpaid: 'غير مدفوع',
  paid: 'مدفوع',
  partially_paid: 'مدفوع جزئيًا',
  refunded: 'مسترد',
};

const inputCls =
  'w-full h-12 rounded-xl border-2 border-border bg-white px-4 font-bold text-ink focus:outline-none focus:border-ink transition-colors';

const cardCls = 'rounded-2xl border-2 border-ink bg-white p-5 sm:p-6 shadow-[0_8px_0_#f6c744]';

const primaryBtn =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-brand text-coal px-5 h-12 font-black border-2 border-coal shadow-[0_4px_0_#191919] hover:translate-y-[2px] hover:shadow-[0_2px_0_#191919] disabled:opacity-40 transition-all';

const ghostBtn =
  'inline-flex items-center justify-center gap-2 rounded-xl border-2 border-border px-5 h-12 font-black text-ink hover:border-ink disabled:opacity-40 transition-colors';

const dangerBtn =
  'inline-flex items-center justify-center gap-2 rounded-xl border-2 border-red-300 px-4 h-10 text-sm font-black text-red-700 hover:bg-red-50 disabled:opacity-40 transition-colors';

function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <ul className="mt-5 space-y-3" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="rounded-2xl border-2 border-border bg-muted/50 p-4 animate-pulse">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-border" />
              <div className="h-3 w-20 rounded bg-border" />
            </div>
            <div className="h-6 w-20 rounded-full bg-border" />
          </div>
          <div className="mt-4 flex gap-2">
            <div className="h-12 w-12 rounded-lg bg-border" />
            <div className="h-12 w-12 rounded-lg bg-border" />
            <div className="h-12 w-12 rounded-lg bg-border" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({
  icon: Icon,
  title,
  hint,
  action,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  action?: { label: string; to: string };
}) {
  const { t } = useLang();
  return (
    <div className="mt-6 rounded-2xl border-2 border-dashed border-border bg-muted/40 px-6 py-10 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white border-2 border-border">
        <Icon className="h-8 w-8 text-ink-mute" />
      </span>
      <p className="mt-4 text-base font-black text-ink">{title}</p>
      {hint && <p className="mt-1 text-sm font-bold text-ink-mute">{hint}</p>}
      {action && (
        <Link to={action.to} className={`${primaryBtn} mt-5 h-11 px-6 text-sm`}>
          {t(action.label)}
        </Link>
      )}
    </div>
  );
}

/* ------------------------------ Orders ------------------------------ */

function OrderCard({ order }: { order: EcomOrderModel }) {
  const { t, isAr, num, fmt } = useLang();
  const cancelMutation = useCancelEcomOrder();
  const [error, setError] = useState<string | null>(null);

  const cancel = async () => {
    setError(null);
    try {
      await cancelMutation.mutateAsync({ id: order.id });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('فشل إلغاء الطلب'));
    }
  };

  const items = order.items ?? [];
  const shown = items.slice(0, 4);
  const extra = items.length - shown.length;
  const isDelivery = order.order_type === 'delivery';
  const TypeIcon = isDelivery ? Truck : Store;

  return (
    <li className="rounded-2xl border-2 border-border bg-white p-4 sm:p-5 transition-colors hover:border-ink">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-black text-ink">
            <Hash className="h-4 w-4 text-ink-mute" />
            <span className="ltr">{order.order_no}</span>
          </p>
          {order.created_at && (
            <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-ink-mute">
              <CalendarClock className="h-3.5 w-3.5" />
              <span className="ltr">{order.created_at}</span>
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-black ${
              ORDER_STATUS_STYLE[order.order_status] ?? 'bg-muted text-ink border-border'
            }`}
          >
            {t(ORDER_STATUS_LABEL[order.order_status] ?? order.order_status)}
          </span>
          <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-black text-ink-mute">
            {t(PAYMENT_STATUS_LABEL[order.payment_status] ?? order.payment_status)}
          </span>
        </div>
      </div>

      {items.length > 0 && (
        <div className="mt-4 flex items-center gap-2">
          {shown.map((it) => (
            <span
              key={it.id}
              title={isAr ? it.product_name : it.product_name}
              className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted"
            >
              {it.product_image ? (
                <img src={it.product_image} alt="" loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center">
                  <Package className="h-5 w-5 text-ink-mute" />
                </span>
              )}
            </span>
          ))}
          {extra > 0 && (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-xs font-black text-ink">
              +{num(extra)}
            </span>
          )}
          <p className="ms-2 min-w-0 truncate text-sm font-bold text-ink-mute">
            {num(items.reduce((s, i) => s + (i.quantity ?? 0), 0))} {t('قطعة')}
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <p className="flex items-center gap-1.5 text-sm font-bold text-ink-mute">
          <TypeIcon className="h-4 w-4" />
          {isDelivery
            ? order.delivery_area_name ?? t('توصيل')
            : order.location_name ?? t('استلام من الفرع')}
        </p>
        <p className="text-lg font-black text-ink">{fmt(order.final_total)}</p>
      </div>

      {order.order_status === 'pending' && (
        <button onClick={cancel} disabled={cancelMutation.isPending} className={`${dangerBtn} mt-3 w-full sm:w-auto`}>
          {cancelMutation.isPending ? t('جاري الإلغاء...') : t('إلغاء الطلب')}
        </button>
      )}
      {error && <p className="mt-2 text-xs font-bold text-red-700">{error}</p>}
    </li>
  );
}

function OrdersTab() {
  const { t } = useLang();
  const [filter, setFilter] = useState<OrderFilter>('ongoing');
  const { data, isLoading } = useEcomOrders({ order_filter: filter, per_page: 20 });
  const orders = data?.data ?? [];

  return (
    <section className={cardCls}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-black text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-coal text-brand">
            <Package className="h-5 w-5" />
          </span>
          {t('طلباتي')}
        </h2>
        <div className="flex rounded-xl border-2 border-ink bg-white p-1">
          {(['ongoing', 'history'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-4 h-9 text-sm font-black transition-colors ${
                filter === f ? 'bg-coal text-brand' : 'text-ink-mute hover:text-ink'
              }`}
            >
              {f === 'ongoing' ? t('جارية') : t('سابقة')}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <SkeletonList />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title={t('مفيش طلبات هنا لسّه.')}
          hint={filter === 'ongoing' ? t('أي طلب جديد هيظهر هنا أول ما تعمله') : t('طلباتك القديمة هتظهر هنا')}
          action={filter === 'ongoing' ? { label: t('تصفح المنتجات'), to: '/tires' } : undefined}
        />
      ) : (
        <ul className="mt-5 space-y-3">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </ul>
      )}
    </section>
  );
}

/* ------------------------------ Alerts ------------------------------ */

function AlertsTab() {
  const { t } = useLang();
  const subs = useNotifyMeSubscriptions();
  const toggle = useToggleNotifyMe();
  const alerts = subs.data ?? [];

  const unsubscribe = (productId: number, variationId?: number) => {
    toggle.mutate(
      { productId, variationId, subscribed: true },
      {
        onSuccess: () => toast.success(t('اتلغى التنبيه')),
        onError: (e) => toast.error(e instanceof Error ? e.message : t('حصلت مشكلة — جرب تاني')),
      },
    );
  };

  return (
    <section className={cardCls}>
      <h2 className="flex items-center gap-2 text-xl font-black text-ink">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-coal text-brand">
          <Bell className="h-5 w-5" />
        </span>
        {t('تنبيهات المخزون')}
      </h2>
      <p className="mt-1 text-sm font-bold text-ink-mute">
        {t('هننبهك أول ما أي منتج من دول يرجع في المخزون')}
      </p>

      {subs.isLoading ? (
        <SkeletonList rows={2} />
      ) : alerts.length === 0 ? (
        <EmptyState
          icon={BellRing}
          title={t('مفيش تنبيهات لسّه')}
          hint={t('لو منتج نافد دوس على "نبهني لما يرجع" وهيظهر هنا')}
          action={{ label: t('تصفح المنتجات'), to: '/tires' }}
        />
      ) : (
        <ul className="mt-5 space-y-3">
          {alerts.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-4 rounded-2xl border-2 border-border bg-white p-3 sm:p-4 transition-colors hover:border-ink"
            >
              {a.product_image ? (
                <img
                  src={a.product_image}
                  alt=""
                  loading="lazy"
                  className="h-16 w-16 shrink-0 rounded-xl border border-border object-cover"
                />
              ) : (
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted border border-border">
                  <Package className="h-7 w-7 text-ink-mute" />
                </span>
              )}
              <div className="flex-1 min-w-0">
                <p className="truncate font-black text-ink">{a.product_name ?? `#${a.product_id}`}</p>
                {a.created_at && <p className="mt-0.5 text-xs font-bold text-ink-mute ltr">{a.created_at}</p>}
              </div>
              <button
                onClick={() => unsubscribe(a.product_id, a.variation_id)}
                disabled={toggle.isPending}
                aria-label={t('إلغاء التنبيه')}
                className={`${dangerBtn} shrink-0`}
              >
                <BellOff className="h-4 w-4" />
                <span className="hidden sm:inline">{t('إلغاء')}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ------------------------------ KM (odometer) ------------------------------ */

function KmDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { t, num } = useLang();
  const { data: km } = useContactKm();
  const update = useUpdateContactKm();
  const scan = useScanContactKm();

  const [value, setValue] = useState('');
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const current = km?.value ?? null;

  const onScan = async (file: File) => {
    setError(null);
    setWarning(null);
    try {
      const res = await scan.mutateAsync(file);
      if (res.detected_km != null) {
        setValue(String(res.detected_km));
      }
      if (!res.is_greater && res.current_km != null) {
        setWarning(
          `${t('القراءة المكتشفة')} (${num(res.detected_km ?? 0)}) ${t('أقل من آخر قراءة')} (${num(res.current_km)}) — ${t('تأكد من وضوح الصورة')}`,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('مقدرناش نقرا العداد من الصورة'));
    }
  };

  const save = async () => {
    const kmNum = Number(value);
    if (!Number.isFinite(kmNum) || kmNum <= 0) {
      setError(t('ادخل رقم صحيح'));
      return;
    }
    setError(null);
    try {
      await update.mutateAsync(kmNum);
      toast.success(t('اتحدث عداد الكيلو'));
      onOpenChange(false);
      setValue('');
      setWarning(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('فشل تحديث العداد');
      setError(current != null ? `${msg} — ${t('آخر قراءة')}: ${num(current)}` : msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-2 border-ink bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black text-ink">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-coal text-brand">
              <Gauge className="h-5 w-5" />
            </span>
            {t('عداد الكيلومترات')}
          </DialogTitle>
          <DialogDescription className="text-sm font-bold text-ink-mute">
            {current != null
              ? `${t('آخر قراءة مسجلة')}: ${num(current)} ${t('كم')} — ${t('الرقم الجديد لازم يكون أكبر')}`
              : t('مفيش قراءة سابقة — ادخل قراءة عداد عربيتك')}
          </DialogDescription>
        </DialogHeader>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onScan(f);
            e.target.value = '';
          }}
        />

        <div>
          <label className="mb-1.5 block text-sm font-extrabold text-ink">{t('قراءة العداد')}</label>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, ''))}
            inputMode="numeric"
            placeholder={current != null ? String(current + 1) : '45000'}
            className={`${inputCls} ltr text-center text-xl tracking-widest`}
          />
        </div>

        <button
          onClick={() => fileRef.current?.click()}
          disabled={scan.isPending}
          className={`${ghostBtn} w-full`}
        >
          {scan.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> {t('بنقرا العداد...')}
            </>
          ) : (
            <>
              <Camera className="h-4 w-4" /> {t('صوّر العداد وهنقراه')}
            </>
          )}
        </button>

        {warning && (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">{warning}</p>
        )}
        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}

        <DialogFooter>
          <button onClick={save} disabled={update.isPending || !value} className={primaryBtn}>
            {update.isPending ? (
              t('جاري الحفظ...')
            ) : (
              <>
                <Check className="h-4 w-4" /> {t('حفظ')}
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function KmDisplay() {
  const { t } = useLang();
  const { data: km, isLoading } = useContactKm();
  const [open, setOpen] = useState(false);

  if (isLoading) {
    return (
      <div
        className="mt-5 flex animate-pulse items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5"
        aria-hidden
      >
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-white/10" />
          <div className="flex gap-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 w-6 rounded-md bg-white/10" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const digits = km?.value != null ? String(Math.floor(km.value)).split('') : null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group mt-5 flex w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5 text-start transition-colors hover:border-brand/30"
        aria-label={t('تحديث عداد الكيلومترات')}
      >
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/45">
            <Gauge className="h-3.5 w-3.5 text-brand" />
            {t('عداد الكيلومترات')}
            {km?.source && (
              <span className="font-bold normal-case tracking-normal text-white/30">
                — {km.source === 'contact' ? t('من سجلك') : km.source === 'jobsheet' ? t('من آخر أمر عمل') : ''}
              </span>
            )}
          </p>
          <div className="mt-2 flex items-end gap-1.5" dir="ltr">
            {digits ? (
              digits.map((d, i) => (
                <span
                  key={i}
                  className="flex h-12 min-w-9 items-center justify-center rounded-lg border border-white/10 px-1.5 font-mono text-2xl font-black leading-none text-brand sm:h-14 sm:min-w-11 sm:text-3xl"
                  style={{
                    background: 'linear-gradient(180deg, #202020 0%, #0d0d0d 55%, #161616 100%)',
                    boxShadow: 'inset 0 2px 0 #ffffff14, inset 0 -8px 12px #00000099, 0 3px 8px #00000066',
                  }}
                >
                  {d}
                </span>
              ))
            ) : (
              <span className="flex h-12 items-center rounded-lg border border-dashed border-white/25 px-4 text-sm font-bold text-white/50 transition-colors group-hover:border-brand/40 group-hover:text-brand sm:h-14">
                <Plus className="me-1 h-4 w-4" /> {t('ضيف قراءة العداد')}
              </span>
            )}
            <span className="ms-1 pb-1 text-xs font-extrabold text-white/40">KM</span>
          </div>
          {km?.date && <p className="mt-1.5 text-[10px] font-bold text-white/35 ltr">{km.date}</p>}
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/50 transition-colors group-hover:border-brand/40 group-hover:text-brand">
          <Pencil className="h-4 w-4" />
        </span>
      </button>
      <KmDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

/* ------------------------------ Cars ------------------------------ */

function CarChip({ car }: { car: CustomerCarModel }) {
  const { t } = useLang();
  const img = car.car_logo || car.car_image || car.model_image;
  const brand = car.device ?? car.brand_name ?? car.car_brand ?? car.make;
  const title = [brand, car.model, car.manufacturing_year].filter(Boolean).join(' ') || t('عربية');
  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border-2 border-ink bg-white py-1.5 pe-5 ps-1.5 shadow-[0_3px_0_#f6c744]">
      <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
        {img ? (
          <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <Car className="h-5 w-5 text-ink-mute" />
        )}
      </span>
      <span className="whitespace-nowrap text-sm font-black text-ink ltr">{title}</span>
    </div>
  );
}

function CarsStrip({ cars }: { cars: CustomerCarModel[] }) {
  const { isAr } = useLang();
  return (
    <div className="mb-5 flex items-center gap-2.5">
      <Carousel
        opts={{ align: 'start', dragFree: true, containScroll: 'trimSnaps', direction: isAr ? 'rtl' : 'ltr' }}
        className="min-w-0 flex-1"
      >
        <CarouselContent className="-ml-2.5 items-center">
          {cars.map((car) => (
            <CarouselItem key={car.id} className="basis-auto pl-2.5">
              <CarChip car={car} />
            </CarouselItem>
          ))}
          <CarouselItem className="basis-auto pl-2.5">
            <AddCarDialog fab />
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </div>
  );
}

function AddCarDialog({ fab = false }: { fab?: boolean }) {
  const { t } = useLang();
  const { user, refreshUser } = useAuth();
  const addCar = useAddCustomerCar();

  const [open, setOpen] = useState(false);
  const [brandId, setBrandId] = useState('');
  const [modelId, setModelId] = useState('');
  const [year, setYear] = useState('');
  const [plate, setPlate] = useState('');
  const [color, setColor] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: brands, isLoading: brandsLoading } = useBrands();
  const { data: models, isLoading: modelsLoading } = useModels(brandId ? Number(brandId) : null);

  const reset = () => {
    setBrandId('');
    setModelId('');
    setYear('');
    setPlate('');
    setColor('');
    setError(null);
  };

  const submit = async () => {
    if (!user) return;
    setError(null);
    try {
      await addCar.mutateAsync({
        plate_number: plate.trim() || 'بدون لوحة',
        brand_id: parseInt(brandId, 10),
        model_id: parseInt(modelId, 10),
        manufacturing_year: year.trim(),
        color: color.trim() || 'غير محدد',
        chassis_number: '-',
        car_type: 'ملاكي',
      });
      await refreshUser();
      toast.success(t('اتضافت العربية'));
      setOpen(false);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('فشل إضافة العربية'));
    }
  };

  const selectCls =
    'w-full h-12 rounded-xl border-2 border-border bg-white px-3 font-bold text-ink focus:outline-none focus:border-ink transition-colors';

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        {fab ? (
          <button
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-coal border-2 border-coal shadow-[0_3px_0_#191919] transition-all hover:translate-y-[2px] hover:shadow-none"
            aria-label={t('أضف عربية')}
          >
            <Plus className="h-5 w-5" strokeWidth={3} />
          </button>
        ) : (
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink text-ink transition-colors hover:bg-coal hover:text-brand"
            aria-label={t('أضف عربية')}
          >
            <Plus className="h-5 w-5" />
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="rounded-2xl border-2 border-ink bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black text-ink">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-coal text-brand">
              <Car className="h-5 w-5" />
            </span>
            {t('أضف عربية')}
          </DialogTitle>
          <DialogDescription className="text-sm font-bold text-ink-mute">
            {t('اختار الماركة والموديل واكتب اللوحة والسنة')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-extrabold text-ink">{t('الماركة')}</label>
            <select
              value={brandId}
              onChange={(e) => {
                setBrandId(e.target.value);
                setModelId('');
              }}
              className={selectCls}
            >
              <option value="">{brandsLoading ? t('جاري التحميل...') : t('اختار الماركة')}</option>
              {brands?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-extrabold text-ink">{t('الموديل')}</label>
            <select
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              disabled={!brandId}
              className={`${selectCls} disabled:opacity-40`}
            >
              <option value="">
                {!brandId ? t('اختار الماركة الأول') : modelsLoading ? t('جاري التحميل...') : t('اختار الموديل')}
              </option>
              {models?.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-extrabold text-ink">{t('سنة الصنع')}</label>
            <input
              value={year}
              onChange={(e) => setYear(e.target.value)}
              inputMode="numeric"
              placeholder="2019"
              className={`${inputCls} ltr text-right`}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-extrabold text-ink">{t('رقم اللوحة')}</label>
            <input
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              placeholder={t('أ ب ج 1234')}
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-extrabold text-ink">{t('اللون')} <span className="font-bold text-ink-mute">({t('اختياري')})</span></label>
            <input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder={t('أسود')}
              className={inputCls}
            />
          </div>
        </div>

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}

        <DialogFooter>
          <button
            onClick={submit}
            disabled={addCar.isPending || !brandId || !modelId || !year.trim()}
            className={primaryBtn}
          >
            {addCar.isPending ? t('جاري الإضافة...') : (
              <>
                <Check className="h-4 w-4" /> {t('إضافة')}
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------ Loyalty ------------------------------ */

const EXPIRY_TYPE_LABEL: Record<string, string> = {
  day: 'يوم',
  week: 'أسبوع',
  month: 'شهر',
  year: 'سنة',
};

function LoyaltyStat({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-xs font-extrabold text-white/80">
      <Icon className="h-4 w-4 shrink-0 text-brand" />
      {children}
    </p>
  );
}

function LoyaltyCard() {
  const { t, num, fmt } = useLang();
  const { user } = useAuth();
  const { data: loyalty, isLoading } = useEcomLoyalty(!!user);

  if (isLoading) {
    return (
      <section className="mt-5 animate-pulse rounded-3xl bg-coal p-5 shadow-[0_8px_0_#f6c744]" aria-hidden>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-white/15" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-28 rounded bg-white/15" />
            <div className="h-8 w-24 rounded bg-white/15" />
          </div>
        </div>
      </section>
    );
  }

  if (!loyalty?.enabled) return null;

  const earnRate = loyalty.earn?.amount_per_point;
  const redeem = loyalty.redeem;
  const noPoints = !loyalty.balance;
  const lockedRedeem =
    !noPoints &&
    loyalty.redeemable_points <= 0 &&
    ((redeem?.min_points ?? 0) > 0 || (redeem?.min_order_total ?? 0) > 0);

  return (
    <section
      className="relative mt-5 overflow-hidden rounded-3xl border-2 border-ink shadow-[0_8px_0_#191919]"
      style={{
        background: 'linear-gradient(135deg, #2a2a2a 0%, #191919 45%, #241d08 75%, #3a2f10 100%)',
      }}
    >
      {/* gold glow blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -end-16 h-64 w-64 rounded-full opacity-25 blur-3xl"
        style={{ background: 'radial-gradient(circle, #f6c744 0%, transparent 70%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-28 -start-14 h-56 w-56 rounded-full opacity-15 blur-3xl"
        style={{ background: 'radial-gradient(circle, #f6c744 0%, transparent 70%)' }}
      />
      {/* subtle diagonal stripes */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: 'repeating-linear-gradient(115deg, #f6c744 0 10px, transparent 10px 36px)' }}
      />
      {/* moving shine sweep */}
      <div
        aria-hidden
        className="animate-loyalty-shine pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />
      {/* decorative coins */}
      <Coins
        aria-hidden
        className="pointer-events-none absolute -bottom-9 -end-7 h-40 w-40 text-brand opacity-[0.12] rtl:-scale-x-100"
      />
      <Sparkles aria-hidden className="pointer-events-none absolute top-5 end-5 h-5 w-5 text-brand/40" />

      {/* card top row: program + chip */}
      <div className="relative flex items-center justify-between px-5 pt-5 sm:px-7 sm:pt-6">
        <p className="flex items-center gap-2 text-sm font-extrabold text-brand/90">
          <Sparkles className="h-4 w-4" />
          {t(loyalty.points_name ?? 'نقاط المكافآت')}
        </p>
        {/* gold chip */}
        <span aria-hidden className="relative h-9 w-12 overflow-hidden rounded-md bg-gradient-to-br from-[#fde08a] via-[#f6c744] to-[#b8860b] shadow-[inset_0_1px_0_#ffffffaa,0_1px_2px_#00000066]">
          <span className="absolute inset-x-0 top-1/2 h-px bg-coal/40" />
          <span className="absolute inset-y-0 left-1/2 w-px bg-coal/40" />
          <span className="absolute left-1/2 top-1/2 h-4 w-5 -translate-x-1/2 -translate-y-1/2 rounded-sm border border-coal/40" />
        </span>
      </div>

      {/* balance row */}
      <div className="relative flex flex-wrap items-end gap-4 px-5 pb-5 pt-3 sm:px-7 sm:pb-7">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/40">
            {t('رصيدك الحالي')}
          </p>
          <p className="mt-1.5 flex items-baseline gap-3">
            <span
              className="bg-gradient-to-b from-white via-[#fdf3d0] to-[#f6c744] bg-clip-text text-5xl font-black leading-none tracking-tight text-transparent sm:text-6xl"
              style={{ filter: 'drop-shadow(0 2px 6px rgba(246,199,68,0.25))' }}
            >
              {num(loyalty.balance)}
            </span>
            <span className="text-sm font-black text-brand/70">{t('نقطة')}</span>
          </p>

          {/* member line */}
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-extrabold uppercase tracking-widest text-white/45">
            <span className="ltr tracking-[0.25em]">{user?.name ?? ''}</span>
            {user?.mobile && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3 w-3" />
                <span className="ltr">{user.mobile}</span>
              </span>
            )}
          </p>
        </div>

        {loyalty.redeemable_amount > 0 ? (
          <div className="rounded-2xl border border-brand/40 bg-gradient-to-br from-[#fde08a] via-[#f6c744] to-[#d9a91f] px-5 py-3 text-center shadow-[0_4px_0_#00000088,inset_0_1px_0_#ffffffaa]">
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-coal/70">{t('بتساوي')}</p>
            <p className="text-2xl font-black leading-tight text-coal">{fmt(loyalty.redeemable_amount)}</p>
            {loyalty.redeemable_points > 0 && (
              <p className="mt-0.5 text-[11px] font-bold text-coal/60">
                {t('لحد')} {num(loyalty.redeemable_points)} {t('نقطة للأوردر')}
              </p>
            )}
          </div>
        ) : (
          <Link
            to="/tires"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-br from-[#fde08a] via-[#f6c744] to-[#d9a91f] px-4 text-sm font-black text-coal shadow-[0_3px_0_#00000088,inset_0_1px_0_#ffffffaa] transition-all hover:translate-y-[2px] hover:shadow-[0_1px_0_#00000088]"
          >
            <Gift className="h-4 w-4" /> {t('اطلب واكسب')}
          </Link>
        )}
      </div>

      {/* bottom strip */}
      <div className="relative flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-brand/15 bg-black/50 px-5 py-3.5 backdrop-blur-sm sm:px-7">
        {!!earnRate && (
          <LoyaltyStat icon={Gift}>
            {t('بتكسب نقطة لكل')} {fmt(earnRate)}
            {!!loyalty.earn?.max_points_per_order && (
              <span className="text-white/40">
                ({t('لحد')} {num(loyalty.earn.max_points_per_order)} {t('للأوردر')})
              </span>
            )}
          </LoyaltyStat>
        )}
        {loyalty.redeemable_points > 0 && (
          <LoyaltyStat icon={Coins}>
            {t('استبدل لحد')} {num(loyalty.redeemable_points)} {t('نقطة في الأوردر')}
          </LoyaltyStat>
        )}
        {!!loyalty.expiry?.period && (
          <LoyaltyStat icon={CalendarClock}>
            {t('بتنتهي خلال')} {num(loyalty.expiry.period)}{' '}
            {t(EXPIRY_TYPE_LABEL[loyalty.expiry.type ?? 'month'] ?? loyalty.expiry.type ?? 'شهر')}
          </LoyaltyStat>
        )}
        {noPoints && <LoyaltyStat icon={Sparkles}>{t('اطلب واكسب نقاط على كل أوردر')}</LoyaltyStat>}
        {lockedRedeem && (
          <LoyaltyStat icon={Coins}>
            {(redeem?.min_points ?? 0) > 0
              ? `${t('أقل استبدال')} ${num(redeem!.min_points!)} ${t('نقطة')}`
              : `${t('الاستبدال بيشتغل على أوردرات فوق')} ${fmt(redeem?.min_order_total ?? 0)}`}
          </LoyaltyStat>
        )}
      </div>
    </section>
  );
}

/* ------------------------------ Info ------------------------------ */

function InfoRow({ icon: Icon, label, value, ltr }: { icon: LucideIcon; label: string; value?: string | null; ltr?: boolean }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
        <Icon className="h-5 w-5 text-ink-mute" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold text-ink-mute">{label}</p>
        <p className={`truncate font-black text-ink ${ltr ? 'ltr text-right' : ''}`}>{value || '—'}</p>
      </div>
    </div>
  );
}

function InfoTab({
  user,
}: {
  user: NonNullable<ReturnType<typeof useAuth>['user']>;
}) {
  const { t, isAr } = useLang();
  const { refreshUser } = useAuth();
  const updateMutation = useUpdateCustomer();

  const [edit, setEdit] = useState(false);
  const [firstName, setFirstName] = useState(user.first_name ?? user.name?.split(' ')[0] ?? '');
  const [lastName, setLastName] = useState(user.last_name ?? user.name?.split(' ').slice(1).join(' ') ?? '');
  const [mobile, setMobile] = useState(user.mobile ?? '');
  const [error, setError] = useState<string | null>(null);

  const startEdit = () => {
    setFirstName(user.first_name ?? user.name?.split(' ')[0] ?? '');
    setLastName(user.last_name ?? user.name?.split(' ').slice(1).join(' ') ?? '');
    setMobile(user.mobile ?? '');
    setError(null);
    setEdit(true);
  };

  const handleSave = async () => {
    setError(null);
    try {
      await updateMutation.mutateAsync({
        id: user.id,
        body: { first_name: firstName, last_name: lastName, mobile },
      });
      await refreshUser();
      setEdit(false);
      toast.success(t('اتحفظت البيانات'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('فشل تحديث البيانات'));
    }
  };

  return (
    <section className={cardCls}>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-black text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-coal text-brand">
            <User className="h-5 w-5" />
          </span>
          {t('بياناتي الشخصية')}
        </h2>
        {!edit && (
          <button onClick={startEdit} className={`${ghostBtn} h-10 px-4 text-sm`}>
            <Pencil className="h-4 w-4" /> {t('تعديل')}
          </button>
        )}
      </div>

      {edit ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-extrabold text-ink">{t('الاسم الأول')}</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-extrabold text-ink">{t('الاسم الأخير')}</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-extrabold text-ink">{t('رقم الموبايل')}</label>
            <input
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              inputMode="tel"
              className={`${inputCls} ltr ${isAr ? 'text-right' : 'text-left'}`}
            />
          </div>
        </div>
      ) : (
        <div className="mt-3 divide-y divide-border">
          <InfoRow
            icon={User}
            label={t('الاسم')}
            value={`${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || user.name}
          />
          <InfoRow icon={Phone} label={t('رقم الموبايل')} value={user.mobile} ltr />
        </div>
      )}

      {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}

      {edit && (
        <div className="mt-5 flex items-center justify-end gap-3">
          <button onClick={() => setEdit(false)} className={ghostBtn}>
            <X className="h-4 w-4" /> {t('إلغاء')}
          </button>
          <button onClick={handleSave} disabled={updateMutation.isPending} className={primaryBtn}>
            {updateMutation.isPending ? (
              t('جاري الحفظ...')
            ) : (
              <>
                <Check className="h-4 w-4" /> {t('حفظ')}
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}

/* ------------------------------ Invoices ------------------------------ */

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cash: 'نقدي',
  card: 'بطاقة',
  bank_transfer: 'تحويل بنكي',
  cheque: 'شيك',
};

const INVOICE_PAY_STATUS: Record<string, { label: string; cls: string }> = {
  paid: { label: 'مدفوعة', cls: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
  partial: { label: 'مدفوعة جزئيًا', cls: 'bg-amber-50 text-amber-800 border-amber-300' },
  due: { label: 'مستحقة', cls: 'bg-red-50 text-red-700 border-red-300' },
};

const WARRANTY_DURATION_LABEL: Record<string, string> = {
  days: 'يوم',
  months: 'شهر',
  years: 'سنة',
};

const INVOICE_TYPE_META: Record<string, { label: string; stripe: string; badge: string }> = {
  pos: {
    label: 'نقطة بيع',
    stripe: 'border-s-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-300',
  },
  jobsheet: {
    label: 'أوامر الشغل',
    stripe: 'border-s-amber-500',
    badge: 'bg-amber-50 text-amber-800 border-amber-300',
  },
  ecommerce: {
    label: 'أونلاين',
    stripe: 'border-s-sky-500',
    badge: 'bg-sky-50 text-sky-700 border-sky-300',
  },
};

function InvoiceDetails({ id }: { id: number }) {
  const { t, num, fmt } = useLang();
  const { data: inv, isLoading } = useEcomInvoice(id);

  if (isLoading) {
    return <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-ink-mute" /></div>;
  }
  if (!inv) {
    return <p className="py-8 text-center text-sm font-bold text-ink-mute">{t('مش قادرين نجيب تفاصيل الفاتورة')}</p>;
  }

  const items = inv.items ?? [];
  const payments = inv.payments ?? [];

  const totalRow = (label: string, value: number | undefined, strong = false) => (
    <p className={`flex items-center justify-between ${strong ? 'text-base font-black text-ink' : 'text-sm font-bold text-ink-mute'}`}>
      <span>{label}</span>
      <span className="ltr">{fmt(value ?? 0)}</span>
    </p>
  );

  return (
    <div className="space-y-5">
      {/* summary */}
      <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
        {[
          { l: t('الإجمالي'), v: inv.final_total },
          { l: t('المدفوع'), v: inv.total_paid },
          { l: t('المتبقي'), v: inv.total_due },
        ].map((c) => (
          <div key={c.l} className="rounded-xl bg-muted/70 px-3 py-2.5">
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-ink-mute">{c.l}</p>
            <p className="mt-0.5 font-black text-ink">{fmt(c.v ?? 0)}</p>
          </div>
        ))}
        <div className="rounded-xl bg-muted/70 px-3 py-2.5">
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-ink-mute">{t('الفرع')}</p>
          <p className="mt-0.5 truncate font-black text-ink">{inv.location_name ?? '—'}</p>
        </div>
      </div>

      {/* items */}
      {items.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-black text-ink">{t('الأصناف')}</h3>
          <ul className="divide-y divide-border rounded-xl border-2 border-border">
            {items.map((it) => (
              <li key={it.id} className="flex items-center gap-3 p-3">
                {it.product_image ? (
                  <img src={it.product_image} alt="" loading="lazy" className="h-11 w-11 shrink-0 rounded-lg border border-border object-cover" />
                ) : (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Package className="h-5 w-5 text-ink-mute" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-ink">{it.product_name ?? `#${it.product_id}`}</p>
                  <p className="text-xs font-bold text-ink-mute">
                    {it.variation_name && <span>{it.variation_name} · </span>}
                    <span className="ltr">{num(it.quantity ?? 0)} × {fmt(it.unit_price_inc_tax ?? it.unit_price ?? 0)}</span>
                  </p>
                  {(it.warranty || it.warranty_months) && (
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-brand/50 bg-brand/10 px-2 py-0.5 text-[10px] font-extrabold text-ink">
                      <ShieldCheck className="h-3 w-3 text-amber-600" />
                      {it.warranty?.name ?? t('ضمان')}
                      {!!(it.warranty?.duration ?? it.warranty_months) && (
                        <span className="font-black">
                          — <span className="ltr">{num(it.warranty?.duration ?? it.warranty_months ?? 0)}</span>{' '}
                          {t(WARRANTY_DURATION_LABEL[it.warranty?.duration_type ?? 'months'] ?? it.warranty?.duration_type ?? 'شهر')}
                        </span>
                      )}
                    </span>
                  )}
                </div>
                <p className="shrink-0 text-sm font-black text-ink ltr">
                  {fmt((it.quantity ?? 0) * (it.unit_price_inc_tax ?? it.unit_price ?? 0))}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* totals breakdown */}
      <div className="space-y-1.5 rounded-xl bg-muted/70 p-4">
        {totalRow(t('قبل الضريبة'), inv.total_before_tax)}
        {!!inv.tax_amount && totalRow(t('الضريبة'), inv.tax_amount)}
        {!!inv.discount_amount && totalRow(
          `${t('الخصم')}${inv.discount_type === 'percentage' ? ' %' : ''}`,
          -Math.abs(inv.discount_amount),
        )}
        {!!inv.shipping_charges && totalRow(t('الشحن'), inv.shipping_charges)}
        {!!inv.round_off_amount && totalRow(t('تقريب'), inv.round_off_amount)}
        <div className="border-t border-border pt-1.5">{totalRow(t('الإجمالي'), inv.final_total, true)}</div>
      </div>

      {/* payments */}
      {payments.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-black text-ink">{t('المدفوعات')}</h3>
          <ul className="space-y-2">
            {payments.map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm font-bold">
                <span className="flex items-center gap-2 text-ink">
                  <span className={`h-2 w-2 rounded-full ${p.is_return ? 'bg-red-400' : 'bg-emerald-500'}`} />
                  {t(PAYMENT_METHOD_LABEL[p.method ?? ''] ?? p.method ?? 'نقدي')}
                  {p.is_return && <span className="text-red-600">({t('مرتجع')})</span>}
                </span>
                <span className="flex items-center gap-3">
                  {p.paid_on && <span className="text-xs text-ink-mute ltr">{p.paid_on}</span>}
                  <span className="font-black ltr">{fmt(p.amount ?? 0)}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* links */}
      <div className="flex flex-wrap gap-2">
        {!!inv.invoice_url && (
          <a
            href={inv.invoice_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-xl border-2 border-ink px-4 text-sm font-black text-ink transition-colors hover:bg-muted"
          >
            <ReceiptText className="h-4 w-4" /> {t('عرض الفاتورة')}
          </a>
        )}
        {!!inv.payment_link && (
          <a
            href={inv.payment_link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-coal px-4 text-sm font-black text-brand shadow-[0_3px_0_#00000055] transition-all hover:translate-y-[1px] hover:shadow-none"
          >
            <Gift className="h-4 w-4" /> {t('ادفع المتبقي')}
          </a>
        )}
      </div>
    </div>
  );
}

function InvoicesTab() {
  const { t, fmt } = useLang();
  const [typeFilter, setTypeFilter] = useState<'all' | 'pos' | 'jobsheet' | 'ecommerce'>('all');
  const [openId, setOpenId] = useState<number | null>(null);
  const { data, isLoading } = useEcomInvoices({
    per_page: 20,
    invoice_type: typeFilter === 'all' ? undefined : typeFilter,
  });
  const invoices = data?.data ?? [];

  const openInv = invoices.find((i) => i.id === openId);

  return (
    <section className={cardCls}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-black text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-coal text-brand">
            <ReceiptText className="h-5 w-5" />
          </span>
          {t('فواتيري')}
        </h2>
        <div className="flex w-full rounded-xl border-2 border-ink bg-white p-1">
          {(['all', 'pos', 'jobsheet', 'ecommerce'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`flex-1 rounded-lg px-3 sm:px-4 h-9 text-xs sm:text-sm font-black transition-colors ${
                typeFilter === f ? 'bg-coal text-brand' : 'text-ink-mute hover:text-ink'
              }`}
            >
              {f === 'all' ? t('الكل') : t(INVOICE_TYPE_META[f].label)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <SkeletonList />
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title={t('مفيش فواتير هنا لسّه.')}
          hint={t('فواتير مشترياتك من الفروع هتظهر هنا')}
        />
      ) : (
        <ul className="mt-5 space-y-3">
          {invoices.map((inv) => {
            const pay = INVOICE_PAY_STATUS[inv.payment_status ?? ''] ?? { label: inv.payment_status ?? '', cls: 'bg-muted text-ink border-border' };
            const type = inv.invoice_type ? INVOICE_TYPE_META[inv.invoice_type] : undefined;
            return (
              <li key={inv.id}>
                <button
                  onClick={() => setOpenId(inv.id)}
                  className={`w-full rounded-2xl border-2 border-border bg-white p-4 text-start transition-colors hover:border-ink ${
                    type ? `border-s-4 ${type.stripe}` : ''
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="flex items-center gap-2 font-black text-ink">
                        <Hash className="h-4 w-4 text-ink-mute" />
                        <span className="ltr">{inv.invoice_no ?? `#${inv.id}`}</span>
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-ink-mute">
                        {inv.transaction_date && (
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarClock className="h-3.5 w-3.5" />
                            <span className="ltr">{inv.transaction_date}</span>
                          </span>
                        )}
                        {inv.location_name && (
                          <span className="inline-flex items-center gap-1.5">
                            <Store className="h-3.5 w-3.5" />
                            {inv.location_name}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {type && (
                        <span className={`rounded-full border px-3 py-1 text-xs font-black ${type.badge}`}>
                          {t(type.label)}
                        </span>
                      )}
                      <span className={`rounded-full border px-3 py-1 text-xs font-black ${pay.cls}`}>
                        {t(pay.label)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                    <p className="text-sm font-bold text-ink-mute">
                      {t('الإجمالي')} <span className="font-black text-ink ltr">{fmt(inv.final_total ?? 0)}</span>
                      {(inv.total_due ?? 0) > 0 && (
                        <span className="ms-3 text-red-600">
                          {t('متبقي')} <span className="ltr">{fmt(inv.total_due!)}</span>
                        </span>
                      )}
                    </p>
                    <span className="text-xs font-black text-ink underline">{t('التفاصيل')}</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={openId !== null} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ReceiptText className="h-5 w-5" />
              {t('فاتورة')} <span className="ltr">{openInv?.invoice_no ?? ''}</span>
            </DialogTitle>
            <DialogDescription className="sr-only">{t('تفاصيل الفاتورة')}</DialogDescription>
          </DialogHeader>
          {openId !== null && <InvoiceDetails id={openId} />}
        </DialogContent>
      </Dialog>
    </section>
  );
}

/* ------------------------------ Page ------------------------------ */

const TABS: { key: Tab; label: string; icon: LucideIcon }[] = [
  { key: 'info', label: 'بياناتي', icon: User },
  { key: 'orders', label: 'طلباتي', icon: Package },
  { key: 'invoices', label: 'فواتيري', icon: ReceiptText },
  { key: 'alerts', label: 'التنبيهات', icon: Bell },
];

export default function ProfilePage() {
  const { t } = useLang();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('info');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="bg-paper min-h-screen">
        <div className="mx-auto max-w-xl px-4 sm:px-6 py-24 text-center">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted border-2 border-border">
            <User className="h-10 w-10 text-ink-mute" />
          </span>
          <h1 className="mt-6 text-3xl sm:text-4xl font-black text-ink">{t('حسابي')}</h1>
          <p className="mt-3 text-lg font-bold text-ink-mute">{t('مش مسجّل دخول.')}</p>
          <Link to="/login" className={`${primaryBtn} mt-6 px-8`}>
            <LogIn className="h-5 w-5" /> {t('سجّل دخول')}
          </Link>
        </div>
      </div>
    );
  }

  const fullName = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || user.name || t('عميلنا');
  const initial = fullName.trim().charAt(0) || '؟';

  return (
    <div className="bg-paper min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 lg:py-12">
        <CarsStrip cars={user.cars ?? []} />

        {/* Profile hero */}
        <section className="relative overflow-hidden rounded-3xl bg-coal border-2 border-ink shadow-[0_8px_0_#191919]">
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.08]"
            style={{ backgroundImage: 'repeating-linear-gradient(115deg, #f6c744 0 12px, transparent 12px 40px)' }}
          />
          <div className="relative p-5 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4 sm:gap-6">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand text-3xl font-black text-coal shadow-[0_4px_0_#00000055] sm:h-24 sm:w-24 sm:text-5xl">
                  {initial}
                </span>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-black text-white sm:text-4xl leading-tight">
                    {fullName}
                  </h1>
                  <p className="mt-1 flex items-center gap-2 text-sm font-bold text-white/50 sm:text-base">
                    <Phone className="h-4 w-4 text-brand" />
                    <span className="ltr">{user.mobile}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/booking"
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-black text-coal border-2 border-coal shadow-[0_4px_0_#00000055] hover:translate-y-[2px] hover:shadow-none transition-all sm:flex-initial sm:h-14 sm:text-base"
                >
                  <CalendarClock className="h-5 w-5" />
                  <span>{t('احجز خدمة')}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-white/20 text-white/90 hover:bg-white/10 transition-colors sm:h-14 sm:w-auto sm:px-5 sm:gap-2"
                  title={t('تسجيل الخروج')}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden sm:inline">{t('تسجيل الخروج')}</span>
                </button>
              </div>
            </div>

            <KmDisplay />
          </div>
        </section>

        <LoyaltyCard />

        {/* Tabs + content */}
        <div className="mt-6 grid items-start gap-5 lg:grid-cols-[230px_1fr]">
          <nav className="flex gap-1 overflow-x-auto no-scrollbar rounded-2xl border-2 border-ink bg-white p-1.5 shadow-[0_6px_0_#f6c744] lg:sticky lg:top-24 lg:flex-col lg:overflow-visible">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex shrink-0 items-center gap-2.5 rounded-xl px-4 h-11 text-sm font-black transition-colors lg:justify-between lg:w-full ${
                  activeTab === key ? 'bg-coal text-brand' : 'text-ink hover:bg-muted'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-5 w-5" />
                  {t(label)}
                </span>
                <ChevronLeft
                  className={`hidden h-4 w-4 lg:block transition-opacity ltr:rotate-180 ${
                    activeTab === key ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </button>
            ))}
          </nav>

          <div className="min-w-0">
            {activeTab === 'info' && <InfoTab user={user} />}
            {activeTab === 'orders' && <OrdersTab />}
            {activeTab === 'invoices' && <InvoicesTab />}
            {activeTab === 'alerts' && <AlertsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
