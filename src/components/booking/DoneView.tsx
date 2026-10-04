import { useMemo } from 'react';
import { Link } from 'react-router';
import { Building2, Check, Clock, Phone } from 'lucide-react';
import { useLang } from '@/i18n';
import { useWhatsappUrl } from '@/hooks/use-social-media';
import { WhatsAppIcon } from '@/components/art';
import { locationDisplayName } from '@/lib/api';
import type { AddBookingResultEntry, BusinessLocationWithWebsiteSettingsModel, ServiceModel } from '@/lib/api';

function formatDate(value: string, isAr: boolean) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(isAr ? 'ar-EG' : 'en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function DoneView({
  done,
  service,
  branch,
  day,
  slot,
  phone,
  resolvedBranchName,
  entries,
}: {
  done: string;
  service: ServiceModel;
  branch: BusinessLocationWithWebsiteSettingsModel | undefined;
  day: string;
  slot: string;
  phone: string;
  /** actual branch that received the booking (master-group routing) */
  resolvedBranchName?: string | null;
  /** multi-booking results — one per service */
  entries?: AddBookingResultEntry[];
}) {
  const { t, isAr, fmt } = useLang();
  const waUrl = useWhatsappUrl();
  const dayLabel = useMemo(() => formatDate(day, isAr), [day, isAr]);

  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-16 text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand">
          <Check className="h-10 w-10 text-ink" />
        </span>
        <h1 className="mt-6 text-3xl sm:text-4xl font-black text-ink">{t('تم استلام طلبك!')}</h1>
        <p className="mt-3 text-lg font-semibold text-ink-mute">
          {t('رقم الحجز:')} <span className="ltr font-black text-ink">{done}</span>
        </p>
        <div className="mt-6 rounded-2xl border-2 border-ink bg-white p-6 text-start shadow-[0_8px_0_#f6c744]">
          {entries?.length ? (
            <ul className="space-y-2.5">
              {entries.map((e) => (
                <li key={e.booking_id} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-black text-ink">{e.service_name ?? service.name}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs font-bold text-ink-mute">
                      <Building2 className="h-3.5 w-3.5" /> {e.location_name ?? ''}
                    </p>
                  </div>
                  <div className="text-end shrink-0">
                    <span className="ltr block text-xs font-black text-ink">#{e.booking_id}</span>
                    {e.duplicated && (
                      <span className="mt-0.5 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-black text-ink-mute">
                        {t('موجود قبل كده')}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xl font-black text-ink">{service.name}</p>
          )}
          <ul className="mt-3 space-y-2 text-base font-bold text-ink">
            <li className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-ink-mute" />
              {resolvedBranchName ?? (branch ? locationDisplayName(branch, isAr) : '')}
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-ink-mute" />
              <span>{dayLabel}</span>
              <span className="ltr">— {slot}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-ink-mute" /> <span className="ltr">{phone}</span>
            </li>
          </ul>
          {service.priceFrom && (
            <p className="mt-4 rounded-xl bg-muted/70 px-4 py-3 text-base font-black text-ink">
              {isAr
                ? `السعر المتوقع: من ${fmt(service.priceFrom)} — بنأكدهولك قبل التنفيذ`
                : `Estimated price: from ${fmt(service.priceFrom)} — we confirm it before any work`}
            </p>
          )}
        </div>
        <p className="mt-5 text-base font-semibold text-ink-mute">{t('فريقنا هيكلمك على رقمك خلال دقائق لتأكيد الحجز.')}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] text-white px-6 h-12 font-black"
          >
            <WhatsAppIcon className="h-5 w-5" /> {t('أكد أسرع على واتساب')}
          </a>
          <Link
            to="/"
            className="inline-flex items-center rounded-xl border-2 border-ink px-6 h-12 font-black text-ink hover:bg-coal hover:text-brand transition-colors"
          >
            {t('ارجع للرئيسية')}
          </Link>
        </div>
      </div>
    </div>
  );
}
