import { Check, MapPin } from 'lucide-react';
import { useLang } from '@/i18n';
import { ServiceIcon } from '@/components/art';
import type { ServiceModel } from '@/lib/api';

export function ServiceStep({
  services,
  isLoading,
  serviceId,
  setServiceId,
  serviceBranch,
  serviceIds,
  onToggleService,
}: {
  services: ServiceModel[];
  isLoading: boolean;
  serviceId: string | null;
  setServiceId: (id: string) => void;
  /** master flow — which candidate branch will actually run this service */
  serviceBranch?: (serviceId: number) => string | undefined;
  /** master flow — multi-select mode (when set, clicks toggle instead of replace) */
  serviceIds?: string[];
  onToggleService?: (id: string) => void;
}) {
  const { isAr, fmt, t } = useLang();
  const multi = !!serviceIds;
  const isSelected = (id: number) => (multi ? serviceIds!.includes(String(id)) : serviceId === String(id));
  return (
    <div>
      <h2 className="text-xl font-black text-ink">
        {multi ? t('اختار الخدمات اللي محتاجها') : t('اختار الخدمة اللي محتاجها')}
      </h2>
      {multi && (
        <p className="mt-1.5 text-sm font-bold text-ink-mute">
          {t('ممكن تختار أكتر من خدمة — هنوزعها على الفرع المناسب أوتوماتيك.')}
        </p>
      )}
      {isLoading && <p className="mt-5 text-center font-bold text-ink-mute">{t('جاري تحميل الخدمات...')}</p>}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-2 gap-3">
        {services.map((s) => (
          <button
            key={s.id}
            onClick={() => (multi ? onToggleService?.(String(s.id)) : setServiceId(String(s.id)))}
            className={`relative flex items-center gap-3 rounded-xl border-2 p-4 text-start transition-colors ${
              isSelected(s.id) ? 'border-ink bg-brand-light shadow-[0_4px_0_#191919]' : 'border-border hover:border-ink'
            }`}
          >
            {isSelected(s.id) && (
              <span className="absolute -top-2 -end-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-coal bg-brand text-coal shadow-sm">
                <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
              </span>
            )}
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                isSelected(s.id) ? 'bg-coal text-brand' : 'bg-muted text-ink'
              }`}
            >
              <ServiceIcon name={s.icon ?? 'wrench'} className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm sm:text-base font-black text-ink">{s.name}</span>
              <span className="block text-xs font-bold text-ink-mute">
                {s.duration ?? ''}
                {s.priceFrom ? ` • ${isAr ? 'من' : 'from'} ${fmt(s.priceFrom)}` : ''}
              </span>
              {serviceBranch?.(s.id) && (
                <span className="mt-0.5 flex items-center gap-1 text-[11px] font-bold text-ink-mute">
                  <MapPin className="h-3 w-3 shrink-0" /> {t('هيتنفذ في')} {serviceBranch(s.id)}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
