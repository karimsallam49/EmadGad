import { Link } from 'react-router';
import { Home, LayoutGrid, MapPin, Minus, Plus, ShoppingCart, Trash2, User } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useCart } from '@/cart';
import { itemDisplay, useLang } from '@/i18n';
import { useWhatsappUrl } from '@/hooks/use-social-media';
import { WhatsAppIcon } from './art';

export function MobileBottomNav() {
  const { count, setOpen } = useCart();
  const { t, num } = useLang();

  const ITEMS = [
    { label: t('الرئيسية'), to: '/', icon: Home },
    { label: t('الأقسام'), to: '/taxonomy', icon: LayoutGrid },
    { label: t('الفروع'), to: '/branches', icon: MapPin },
    { label: t('الخدمات'), to: '/booking', icon: User },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 lg:hidden border-t border-border bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)] will-change-transform"
      aria-label={t('تنقل الموبايل')}
    >
      <div className="grid grid-cols-5">
        {ITEMS.slice(0, 2).map((item) => (
          <Link key={item.label} to={item.to} className="flex flex-col items-center gap-1 py-2.5 text-ink">
            <item.icon className="h-5 w-5" />
            <span className="text-[11px] font-extrabold">{item.label}</span>
          </Link>
        ))}
        <button onClick={() => setOpen(true)} className="relative flex flex-col items-center gap-1 py-2.5 text-ink" aria-label={t('السلة')}>
          <span className="relative">
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-2 -end-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand text-coal text-[10px] font-black px-1 border border-white">
                {num(count)}
              </span>
            )}
          </span>
          <span className="text-[11px] font-extrabold">{t('السلة')}</span>
        </button>
        {ITEMS.slice(2).map((item) => (
          <Link key={item.label} to={item.to} className="flex flex-col items-center gap-1 py-2.5 text-ink">
            <item.icon className="h-5 w-5" />
            <span className="text-[11px] font-extrabold">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function WhatsAppFloat() {
  const waUrl = useWhatsappUrl();
  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-20 lg:bottom-6 start-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_6px_20px_rgba(37,211,102,0.45)] hover:scale-105 transition-transform will-change-transform"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}

export function CartDrawer() {
  const { items, open, setOpen, setQty, remove, total } = useCart();
  const { t, isAr, num, fmt } = useLang();
  const waUrl = useWhatsappUrl();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side={isAr ? "left" : "right"} className="w-[360px] max-w-[92vw] p-0 flex flex-col bg-white dark:bg-[#1c1c1c]">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle className="text-xl font-black text-ink">{t('سلة المشتريات')}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center gap-3 py-10">
              <ShoppingCart className="h-12 w-12 text-border" />
              <p className="text-lg font-black text-ink">{t('السلة فاضية')}</p>
              <p className="text-sm font-semibold text-ink-mute">{t('اختار إطارات أو بطارية وهتظهر هنا.')}</p>
              <Link to="/tires" onClick={() => setOpen(false)}
                className="mt-2 rounded-xl bg-coal text-brand px-6 h-11 inline-flex items-center font-black">
                {t('تصفح الإطارات')}
              </Link>
            </div>
          ) : (
            items.map((item) => {
              const d = itemDisplay(item.id, item.title, item.subtitle ?? '', t, num);
              return (
                <div key={item.id} className="rounded-xl border-2 border-border bg-white p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-black text-ink">{d.title}</p>
                      <p className="text-xs font-bold text-ink-mute ltr">{d.sub}</p>
                    </div>
                    <button onClick={() => remove(item.id)} aria-label={t('حذف')} className="text-ink-mute hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setQty(item.id, item.qty + 1)} aria-label={t('زيادة')}
                        className="h-8 w-8 rounded-lg bg-muted inline-flex items-center justify-center hover:bg-border"><Plus className="h-4 w-4" /></button>
                      <span className="w-6 text-center font-black">{num(item.qty)}</span>
                      <button onClick={() => setQty(item.id, item.qty - 1)} aria-label={t('تقليل')}
                        className="h-8 w-8 rounded-lg bg-muted inline-flex items-center justify-center hover:bg-border"><Minus className="h-4 w-4" /></button>
                    </div>
                    <p className="text-base font-black text-ink">{fmt(item.price * item.qty)}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border p-4 space-y-3">
            <div className="flex items-center justify-between text-lg font-black text-ink">
              <span>{t('الإجمالي')}</span>
              <span>{fmt(total)}</span>
            </div>
            <p className="text-xs font-bold text-ink-mute">{t('التركيب في الفرع مجانًا مع الإطارات. الدفع عند الاستلام أو في الفرع.')}</p>
            <Link to="/checkout" onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl bg-brand text-coal h-12 text-base font-black border-2 border-coal shadow-[0_4px_0_#191919] hover:translate-y-[2px] hover:shadow-[0_2px_0_#191919] transition-all">
              {t('إتمام الطلب')}
            </Link>
            <a href={waUrl} target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-border h-11 text-sm font-black text-ink hover:border-ink transition-colors">
              <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> {t('أو أكد الطلب واتساب')}
            </a>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
