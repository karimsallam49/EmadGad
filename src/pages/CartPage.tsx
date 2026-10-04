import { Link } from 'react-router';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '@/cart';
import { itemDisplay, useLang } from '@/i18n';

export default function CartPage() {
  const { items, setQty, remove, total } = useCart();
  const { t, num, fmt } = useLang();

  if (items.length === 0) {
    return (
      <div className="bg-paper">
        <div className="mx-auto max-w-xl px-4 sm:px-6 py-24 text-center">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <ShoppingCart className="h-10 w-10 text-ink-mute" />
          </span>
          <h1 className="mt-6 text-3xl font-black text-ink">{t('السلة فاضية')}</h1>
          <p className="mt-2 text-lg font-semibold text-ink-mute">{t('اختار إطارات أو بطارية لعربيتك وهتظهر هنا.')}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/tires" className="rounded-xl bg-coal text-brand px-6 h-12 inline-flex items-center font-black">{t('تصفح الإطارات')}</Link>
            <Link to="/batteries" className="rounded-xl border-2 border-ink px-6 h-12 inline-flex items-center font-black text-ink hover:bg-coal hover:text-brand transition-colors">{t('تصفح البطاريات')}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 lg:py-14">
        <h1 className="text-3xl sm:text-4xl font-black text-ink">{t('سلة المشتريات')}</h1>

        <div className="mt-8 grid lg:grid-cols-[1.4fr_0.6fr] gap-6 items-start">
          <ul className="space-y-3">
            {items.map((item) => {
              const d = itemDisplay(item.id, item.title, item.subtitle, t, num);
              return (
                <li key={item.id} className="rounded-2xl border-2 border-border bg-white p-4 flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-40">
                    <p className="text-base font-black text-ink">{d.title}</p>
                    <p className="text-sm font-bold text-ink-mute ltr">{d.sub}</p>
                    <p className="text-sm font-bold text-ink-mute">{fmt(item.price)} {t('للقطعة')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setQty(item.id, item.qty + 1)} aria-label={t('زيادة')}
                      className="h-9 w-9 rounded-lg bg-muted inline-flex items-center justify-center hover:bg-border"><Plus className="h-4 w-4" /></button>
                    <span className="w-7 text-center text-lg font-black">{num(item.qty)}</span>
                    <button onClick={() => setQty(item.id, item.qty - 1)} aria-label={t('تقليل')}
                      className="h-9 w-9 rounded-lg bg-muted inline-flex items-center justify-center hover:bg-border"><Minus className="h-4 w-4" /></button>
                  </div>
                  <p className="w-28 text-end text-lg font-black text-ink">{fmt(item.price * item.qty)}</p>
                  <button onClick={() => remove(item.id)} aria-label={t('حذف')} className="text-ink-mute hover:text-red-600">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </li>
              );
            })}
          </ul>

          <aside className="rounded-2xl border-2 border-ink bg-white p-5 shadow-[0_8px_0_#f6c744] lg:sticky lg:top-24">
            <h2 className="text-xl font-black text-ink">{t('ملخص الطلب')}</h2>
            <div className="mt-4 space-y-2 text-sm font-bold text-ink">
              <div className="flex justify-between">
                <span className="text-ink-mute">{t('عدد القطع')}</span>
                <span>{num(items.reduce((s, i) => s + i.qty, 0))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-mute">{t('التركيب في الفرع')}</span>
                <span className="text-emerald-700">{t('مجاني')}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-lg font-black">
                <span>{t('الإجمالي')}</span>
                <span>{fmt(total)}</span>
              </div>
            </div>
            <Link to="/checkout"
              className="mt-5 flex items-center justify-center rounded-xl bg-brand text-coal h-12 text-base font-black border-2 border-coal shadow-[0_4px_0_#191919] hover:translate-y-[2px] hover:shadow-[0_2px_0_#191919] transition-all">
              {t('إتمام الطلب')}
            </Link>
            <Link to="/tires" className="mt-3 block text-center text-sm font-extrabold text-ink-mute hover:text-ink">
              {t('أكمل التسوق')}
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
