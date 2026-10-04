import { useMemo, useState } from 'react';
import { BadgeCheck, CarFront, Ruler, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CARS, YEARS } from '@/data';
import { useBrands } from '@/hooks/use-brands';
import { useModels } from '@/hooks/use-models';
import { useTaxonomy } from '@/hooks/use-taxonomy';
import { useNextLevelItems } from '@/hooks/use-next-level-items';
import { useLang } from '@/i18n';
import type { CategoryLevelItemModel, CategoryLevelNameModel } from '@/types/api';

interface Props {
  onSearch: (to: string) => void;
}

const labelCls = 'block text-sm font-extrabold text-ink mb-1.5';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

const selectCls = 'h-12 w-full rounded-xl border-2 border-border bg-white font-bold text-base focus:ring-brand';

interface LevelSelectProps {
  level: CategoryLevelNameModel;
  parentItemId?: number;
  selectedItemId?: number;
  disabledHint?: string;
  onSelect: (item: CategoryLevelItemModel, levelId: number) => void;
}

/** A single taxonomy level select. Loads its items lazily from the previous level's selected item. */
function LevelSelect({ level, parentItemId, selectedItemId, disabledHint, onSelect }: LevelSelectProps) {
  const { t, isAr } = useLang();
  const { data, isLoading } = useNextLevelItems(parentItemId);

  const waitingForParent = parentItemId == null && level.items.length === 0;
  const items = parentItemId != null ? (data?.items ?? []) : level.items;
  const resolvedLevelName = data?.level?.name ?? level.name;

  return (
    <Field label={resolvedLevelName}>
      <Select
        dir={isAr ? 'rtl' : 'ltr'}
        value={selectedItemId ? String(selectedItemId) : ''}
        onValueChange={(v) => {
          const item = items.find((i) => String(i.id) === v);
          if (item) onSelect(item, level.level_id);
        }}
        disabled={waitingForParent}
      >
        <SelectTrigger className={selectCls}>
          <SelectValue placeholder={t('اختار')} />
        </SelectTrigger>
        <SelectContent position="popper" className="max-h-72 w-56">
          {isLoading ? (
            <SelectItem value="loading" disabled className="font-bold text-ink-mute">
              {t('جاري التحميل...')}
            </SelectItem>
          ) : items.length > 0 ? (
            items.map((item: CategoryLevelItemModel) => (
              <SelectItem key={item.id} value={String(item.id)} className="font-bold ltr">
                {item.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="empty" disabled className="font-bold text-ink-mute">
              {waitingForParent ? (disabledHint ?? t('اختار المستوى اللي قبله الأول')) : t('لا توجد قيم')}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </Field>
  );
}

/** The actual finder form — reused in the hero and standalone sections */
export function TireFinderForm({ onSearch }: Props) {
  const { t, isAr } = useLang();

  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const defaultYear = YEARS.find((y) => y === new Date().getFullYear()) ?? YEARS[0];
  const [year, setYear] = useState<string>(String(defaultYear));

  const [selectedByLevel, setSelectedByLevel] = useState<Record<number, { id: number; name: string }>>({});

  const { data: brandsData, isLoading: isBrandsLoading, isError: isBrandsError, error: brandsError } = useBrands();
  // /brands needs auth — anonymous users fall back to the static car list
  const usingApiBrands = !!brandsData?.length;
  const selectedBrandId = usingApiBrands && selectedBrand ? Number(selectedBrand) : null;
  const { data: modelsData, isLoading: isModelsLoading, isError: isModelsError, error: modelsError } = useModels(
    Number.isFinite(selectedBrandId) ? selectedBrandId : null
  );
  const { data: taxonomyData } = useTaxonomy({ type: 'product', page: 1 });

  if (isBrandsError) console.error('getBrands failed:', brandsError);
  if (isModelsError) console.error('getModels failed:', modelsError);

  const brandOptions = usingApiBrands
    ? brandsData.map((b) => ({ value: String(b.id), label: b.name }))
    : CARS.map((c) => ({ value: c.make, label: c.make }));
  const modelOptions = usingApiBrands
    ? (modelsData ?? []).map((m) => ({ value: String(m.id), label: m.name }))
    : (CARS.find((c) => c.make === selectedBrand)?.models ?? []).map((m) => ({ value: m.model, label: m.model }));

  const brandName = usingApiBrands
    ? brandsData?.find((b) => String(b.id) === selectedBrand)?.name
    : selectedBrand || undefined;
  const modelName = usingApiBrands
    ? modelsData?.find((m) => String(m.id) === selectedModel)?.name
    : selectedModel || undefined;

  const tireCategory = useMemo(
    () => taxonomyData?.find((c: any) => c.infinite_levels === 1),
    [taxonomyData]
  );
  const levelNames: CategoryLevelNameModel[] = (tireCategory as any)?.category_level_names ?? [];

  const selectedNames = levelNames
    .map((l) => selectedByLevel[l.level_id]?.name)
    .filter(Boolean)
    .join(' / ');

  const carSize = useMemo(() => {
    if (!brandName || !modelName) return undefined;
    return CARS.find((c) => c.make === brandName)?.models.find((m) => m.model === modelName)?.tireSize;
  }, [brandName, modelName]);

  const canSearch = (selectedBrand && selectedModel && year) || Object.keys(selectedByLevel).length > 0;

  const handleBrandChange = (value: string) => {
    setSelectedBrand(value);
    setSelectedModel('');
    setYear('');
  };

  const handleLevelSelect = (levelIndex: number, item: CategoryLevelItemModel, levelId: number) => {
    const next: Record<number, { id: number; name: string }> = {};
    levelNames.slice(0, levelIndex).forEach((l) => {
      if (selectedByLevel[l.level_id]) next[l.level_id] = selectedByLevel[l.level_id];
    });
    next[levelId] = { id: item.id, name: item.name };
    setSelectedByLevel(next);
  };

  const searchBySize = () => {
    const ids = levelNames.map((l) => selectedByLevel[l.level_id]?.id).filter(Boolean).join(',');
    if (ids) onSearch(`/tires?selected_item_ids=${ids}`);
  };

  return (
    <div className="rounded-2xl border-2 border-ink bg-white p-5 sm:p-6 shadow-[0_10px_0_#f6c744]">
      <Tabs defaultValue="size" dir={isAr ? 'rtl' : 'ltr'}>
        <TabsList className="grid w-full grid-cols-2 h-12 rounded-xl bg-muted p-1">
          <TabsTrigger value="size" className="rounded-lg text-sm sm:text-base font-extrabold data-[state=active]:bg-coal data-[state=active]:text-brand">
            <Ruler className="h-5 w-5 me-2" /> {t('دخل مقاس الإطار')}
          </TabsTrigger>
          <TabsTrigger value="car" className="rounded-lg text-sm sm:text-base font-extrabold data-[state=active]:bg-coal data-[state=active]:text-brand">
            <CarFront className="h-5 w-5 me-2" /> {t('اختار عربيتك')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="car" className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label={t('الماركة')}>
              <Select
                dir={isAr ? 'rtl' : 'ltr'}
                value={selectedBrand}
                onValueChange={handleBrandChange}
                disabled={isBrandsLoading}
              >
                <SelectTrigger className={selectCls}>
                  <SelectValue placeholder={t('اختار الماركة')} />
                </SelectTrigger>
                <SelectContent className="max-h-72 w-56">
                  {isBrandsLoading ? (
                    <SelectItem value="loading" disabled className="font-bold text-ink-mute">
                      {t('جاري التحميل...')}
                    </SelectItem>
                  ) : brandOptions.length ? (
                    brandOptions.map((b) => (
                      <SelectItem key={b.value} value={b.value} className="font-bold">
                        {b.label}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="empty" disabled className="font-bold text-ink-mute">
                      {t('لا توجد ماركات')}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t('الموديل')}>
              <Select
                dir={isAr ? 'rtl' : 'ltr'}
                value={selectedModel}
                onValueChange={setSelectedModel}
                disabled={!selectedBrand || isModelsLoading}
              >
                <SelectTrigger className={selectCls}>
                  <SelectValue
                    placeholder={selectedBrand ? t('اختار الموديل') : t('الماركة الأول')}
                  />
                </SelectTrigger>
                <SelectContent className="max-h-72 w-56">
                  {isModelsLoading ? (
                    <SelectItem value="loading" disabled className="font-bold text-ink-mute">
                      {t('جاري التحميل...')}
                    </SelectItem>
                  ) : modelOptions.length ? (
                    modelOptions.map((m) => (
                      <SelectItem key={m.value} value={m.value} className="font-bold">
                        {m.label}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="empty" disabled className="font-bold text-ink-mute">
                      {t('لا توجد موديلات')}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t('السنة')}>
              <Select
                dir={isAr ? 'rtl' : 'ltr'}
                value={year ?? ''}
                onValueChange={setYear}
                disabled={!selectedModel}
              >
                <SelectTrigger className={selectCls}>
                  <SelectValue placeholder={t('السنة')} />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-60">
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={String(y)} className="font-bold ltr">
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          {carSize && year && (
            <p className="flex items-center gap-2 rounded-xl bg-brand-light px-4 py-3 text-base font-extrabold text-ink">
              <BadgeCheck className="h-5 w-5 shrink-0" />
              {t('مقاس إطار عربيتك:')} <span className="ltr font-black">{carSize}</span>
            </p>
          )}
        </TabsContent>

        <TabsContent value="size" className="mt-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {levelNames.map((level, index) => (
              <LevelSelect
                key={level.level_id}
                level={level}
                parentItemId={index > 0 ? selectedByLevel[levelNames[index - 1].level_id]?.id : undefined}
                selectedItemId={selectedByLevel[level.level_id]?.id}
                onSelect={(item, levelId) => handleLevelSelect(index, item, levelId)}
              />
            ))}
          </div>
          {selectedNames && (
            <p className="flex items-center gap-2 rounded-xl bg-brand-light px-4 py-3 text-base font-extrabold text-ink">
              <BadgeCheck className="h-5 w-5 shrink-0" />
              {t('المقاس اللي هتدور عليه:')} <span className="ltr font-black">{selectedNames}</span>
            </p>
          )}
        </TabsContent>
      </Tabs>

      <button
        disabled={!canSearch}
        onClick={() => {
          if (!canSearch) return;
          if (selectedBrand && selectedModel && year) {
            onSearch(
              usingApiBrands
                ? `/products?business_id=1&car_brand_id=${selectedBrand}&car_model_id=${selectedModel}&car_year=${year}`
                : '/tires'
            );
          } else {
            searchBySize();
          }
        }}
        className="mt-5 w-full rounded-xl bg-coal text-brand h-14 text-lg font-black shadow-[0_6px_0_#00000055] hover:translate-y-[2px] hover:shadow-[0_4px_0_#00000055] transition-all disabled:opacity-40 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed"
      >
        {t('اعرض الإطارات المناسبة')}
      </button>
    </div>
  );
}

/** Standalone section version (used on the tires page) */
export default function TireFinder({ onSearch }: Props) {
  const { t } = useLang();
  return (
    <section id="finder" className="bg-white border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-14 items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-brand-light text-ink px-4 py-1.5 text-sm font-extrabold">
              <Search className="h-4 w-4" /> {t('محدد الإطارات')}
            </p>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black text-ink leading-snug">
              {t('مش عارف مقاس الكاوتش؟')}
            </h2>
            <p className="mt-3 text-lg font-semibold text-ink-mute leading-relaxed">
              {t('اكتب المقاس اللي مكتوب على الإطار، أو اختار عربيتك وهنطلعولك — وهنوريك الإطارات المناسبة على طول من غير ما تكون خبير.')}
            </p>
            <div className="mt-5 rounded-xl bg-muted p-4 text-sm font-bold text-ink">
              <span className="text-ink-mute">{t('المقاس بيبقى مكتوب على جانب الإطار كده:')}</span>{' '}
              <span className="ltr inline-block rounded-lg bg-coal text-brand px-3 py-1 font-black tracking-wide">205 / 55 R16</span>
            </div>
          </div>
          <TireFinderForm onSearch={onSearch} />
        </div>
      </div>
    </section>
  );
}
