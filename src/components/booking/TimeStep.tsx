import { useLang } from '@/i18n';

export function TimeStep({
  day,
  setDay,
  slot,
  setSlot,
}: {
  day: string;
  setDay: (v: string) => void;
  slot: string;
  setSlot: (v: string) => void;
}) {
  const { t } = useLang();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <h2 className="text-xl font-black text-ink">{t('اختار الميعاد المناسب ليك')}</h2>
      <div className="mt-5">
        <label className="block text-sm font-extrabold text-ink mb-1.5">{t('اليوم')}</label>
        <input
          type="date"
          min={today}
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="w-full h-12 rounded-xl border-2 border-border bg-white px-4 font-bold focus:outline-none focus:border-ink ltr"
        />
      </div>
      <div className="mt-5">
        <label className="block text-sm font-extrabold text-ink mb-1.5">{t('الساعة')}</label>
        <input
          type="time"
          value={slot}
          onChange={(e) => setSlot(e.target.value)}
          className="w-full h-12 rounded-xl border-2 border-border bg-white px-4 font-bold focus:outline-none focus:border-ink ltr"
        />
      </div>
    </div>
  );
}
