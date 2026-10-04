import { useMemo, useState } from 'react';
import { BadgeCheck, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CARS, YEARS } from '@/data';
import { useBrands } from '@/hooks/use-brands';
import { useModels } from '@/hooks/use-models';
import { useLang } from '@/i18n';

export interface BatteryCarFilter {
  car_brand_id?: number;
  car_model_id?: number;
  car_year?: number;
}

interface Props {
  /** called whenever the car selection changes — parent filters the products grid */
  onFilter?: (f: BatteryCarFilter) => void;
}

/** "اختار عربيتك واعرف بطاريتك" — API-driven make/model/year picker that filters batteries */
export default function BatteryFinder({ onFilter }: Props) {
  const { t, num, isAr } = useLang();
  const [brandId, setBrandId] = useState('');
  const [modelId, setModelId] = useState('');
  const [year, setYear] = useState('');

  const { data: brands, isLoading: brandsLoading } = useBrands();
  const { data: models, isLoading: modelsLoading } = useModels(brandId ? Number(brandId) : null);

  const brandName = brands?.find((b) => String(b.id) === brandId)?.name;
  const modelName = models?.find((m) => String(m.id) === modelId)?.name;

  // Ah hint — only when the picked names exist in the static CARS table
  const needed = useMemo(
    () => CARS.find((c) => c.make === brandName)?.models.find((m) => m.model === modelName)?.batteryAh,
    [brandName, modelName],
  );

  const apply = () =>
    onFilter?.({
      car_brand_id: brandId ? Number(brandId) : undefined,
      car_model_id: modelId ? Number(modelId) : undefined,
      car_year: year ? Number(year) : undefined,
    });

  const canApply = !!(brandId && modelId);
  const hasFilter = !!(brandId || modelId || year);
  const clear = () => {
    setBrandId('');
    setModelId('');
    setYear('');
    onFilter?.({});
  };

  const selCls = 'h-12 w-full rounded-xl border-2 border-border bg-white font-bold focus:ring-brand';

  return (
    <div className="rounded-2xl border-2 border-ink bg-paper p-5 shadow-[0_8px_0_#f6c744]">
      <div className="flex items-center justify-between gap-2">
        <p className="text-base font-black text-ink">{t('اختار عربيتك واعرف بطاريتك')}</p>
        {hasFilter && (
          <button
            onClick={clear}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-extrabold text-ink-mute hover:text-ink hover:bg-muted transition-colors"
          >
            <X className="h-3.5 w-3.5" /> {t('مسح')}
          </button>
        )}
      </div>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Select
          dir={isAr ? 'rtl' : 'ltr'}
          value={brandId}
          onValueChange={(v) => {
            setBrandId(v);
            setModelId('');
          }}
          disabled={brandsLoading}
        >
          <SelectTrigger className={selCls}><SelectValue placeholder={brandsLoading ? t('جاري التحميل...') : t('العربية')} /></SelectTrigger>
          <SelectContent className="max-h-72">
            {(brands ?? []).map((b) => (
              <SelectItem key={b.id} value={String(b.id)} className="font-bold">{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          dir={isAr ? 'rtl' : 'ltr'}
          value={modelId}
          onValueChange={setModelId}
          disabled={!brandId || modelsLoading}
        >
          <SelectTrigger className={selCls}>
            <SelectValue placeholder={modelsLoading ? t('جاري التحميل...') : t('الموديل')} />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {(models ?? []).map((m) => (
              <SelectItem key={m.id} value={String(m.id)} className="font-bold">{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          dir={isAr ? 'rtl' : 'ltr'}
          value={year}
          onValueChange={setYear}
          disabled={!modelId}
        >
          <SelectTrigger className={selCls}><SelectValue placeholder={t('السنة')} /></SelectTrigger>
          <SelectContent position="popper" className="max-h-60">
            {YEARS.map((y) => (
              <SelectItem key={y} value={String(y)} className="font-bold ltr">{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <button
        onClick={apply}
        disabled={!canApply}
        className="mt-4 w-full rounded-xl bg-coal text-brand h-12 text-base font-black shadow-[0_6px_0_#00000055] hover:translate-y-[2px] hover:shadow-[0_4px_0_#00000055] transition-all disabled:opacity-40 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed"
      >
        {t('اعرض البطاريات المناسبة')}
      </button>
      {needed && (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-brand px-4 py-3 text-base font-extrabold text-coal">
          <BadgeCheck className="h-5 w-5 shrink-0" />
          {isAr ? (
            <>عربيتك محتاجة بطارية من <span className="font-black">{num(needed)} أمبير</span> أو أكتر</>
          ) : (
            <>Your car needs at least a <span className="font-black">{num(needed)} Ah</span> battery</>
          )}
        </p>
      )}
    </div>
  );
}
