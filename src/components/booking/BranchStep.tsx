import { Car, MapPin, Navigation } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLang } from '@/i18n';
import { locationDisplayName, storageUrl } from '@/lib/api';
import type { BusinessLocationWithWebsiteSettingsModel } from '@/lib/api';

export function BranchStep({
  branches,
  isLoading,
  branchId,
  setBranchId,
  branch,
}: {
  branches: BusinessLocationWithWebsiteSettingsModel[];
  isLoading: boolean;
  branchId: string;
  setBranchId: (id: string) => void;
  branch: BusinessLocationWithWebsiteSettingsModel | undefined;
}) {
  const { isAr, t, num } = useLang();
  const ws = branch?.website_settings;
  const branchImg = storageUrl(ws?.branch_image) ?? storageUrl(ws?.hero_section_image) ?? storageUrl(ws?.logo);
  const address = ws?.address ?? branch?.address;
  const coverage = ws?.coverage ?? branch?.coverage;

  return (
    <div>
      <h2 className="text-xl font-black text-ink">{t('اختار الفرع')}</h2>
      <p className="mt-1 text-sm font-bold text-ink-mute">{t('اختار الفرع اللي تحب تحجز فيه خدمتك')}</p>
      {isLoading && <p className="mt-5 text-center font-bold text-ink-mute">{t('جاري تحميل الفروع...')}</p>}
      <div className="mt-5">
        <label className="block text-sm font-extrabold text-ink mb-1.5">{t('اختار الفرع')}</label>
        <Select dir={isAr ? 'rtl' : 'ltr'} value={branchId} onValueChange={setBranchId} disabled={isLoading}>
          <SelectTrigger className="h-12 w-full rounded-xl border-2 border-border bg-white font-bold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {branches.map((b) => (
              <SelectItem key={b.id} value={String(b.id)} className="font-bold">
                {locationDisplayName(b, isAr)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {branch && (
          <div className="mt-4 overflow-hidden rounded-2xl border-2 border-ink bg-white shadow-[0_6px_0_#f6c744]">
            <div className="flex items-center gap-4 p-4">
              {branchImg ? (
                <img
                  src={branchImg}
                  alt=""
                  loading="lazy"
                  className="h-16 w-16 shrink-0 rounded-xl border-2 border-ink/10 bg-muted object-cover"
                />
              ) : (
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-brand border-2 border-ink/10">
                  <MapPin className="h-7 w-7 text-coal" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-black text-ink">{locationDisplayName(branch, isAr)}</p>
                  {ws?.is_master && (
                    <span className="rounded-full bg-brand px-2.5 py-0.5 text-[11px] font-black text-coal border border-coal">
                      {t('مجموعة')}
                    </span>
                  )}
                  {ws?.is_car_service && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-black text-ink">
                      <Car className="h-3 w-3" /> {t('خدمات سيارات')}
                    </span>
                  )}
                </div>
                {address && (
                  <p className="mt-1 flex items-start gap-1.5 text-xs font-bold text-ink-mute leading-relaxed">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {address}
                  </p>
                )}
              </div>
            </div>
            {!!coverage && (
              <div className="flex items-center gap-2 border-t-2 border-dashed border-border bg-muted/50 px-4 py-2.5 text-xs font-extrabold text-ink-mute">
                <Navigation className="h-3.5 w-3.5" />
                {isAr ? `تغطية لحد ${num(coverage)} كم` : `Covers up to ${num(coverage)} km`}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
