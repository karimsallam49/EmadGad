import { useEffect, useMemo } from 'react';
import { BadgeCheck, Building2, Car, Clock, Phone, User } from 'lucide-react';
import { useAuth } from '@/auth';
import { useLang } from '@/i18n';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { locationDisplayName } from '@/lib/api';
import type { BusinessLocationWithWebsiteSettingsModel, ServiceModel } from '@/lib/api';

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

export function ContactStep({
  service,
  branch,
  carId,
  setCarId,
  day,
  slot,
  alwaysShowCar = false,
  serviceBranchName,
  services,
}: {
  service: ServiceModel | undefined;
  branch: BusinessLocationWithWebsiteSettingsModel | undefined;
  carId: string;
  setCarId: (id: string) => void;
  day: string;
  slot: string;
  alwaysShowCar?: boolean;
  /** branch that will actually run the service (master-group routing) */
  serviceBranchName?: string;
  /** multi-select mode — all picked services */
  services?: ServiceModel[];
}) {
  const { t, isAr } = useLang();
  const { user } = useAuth();
  const dayLabel = useMemo(() => formatDate(day, isAr), [day, isAr]);

  const isCarService = alwaysShowCar || !!branch?.website_settings?.is_car_service;
  const cars = user?.cars ?? [];

  useEffect(() => {
    if (isCarService && !carId && cars.length) setCarId(String(cars[0].id));
  }, [isCarService, carId, cars, setCarId]);

  return (
    <div>
      <h2 className="text-xl font-black text-ink">{t('مراجعة الحجز')}</h2>

      {service && (
        <div className="mt-5 rounded-xl bg-muted/70 p-4 space-y-2 text-sm font-bold text-ink">
          {(services?.length ? services : service ? [service] : []).map((s) => (
            <p key={s.id} className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-ink-mute" /> {s.name}
            </p>
          ))}
          <p className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-ink-mute" />
            {branch ? locationDisplayName(branch, isAr) : ''}
            {serviceBranchName && (
              <span className="text-ink-mute">— {t('هيتنفذ في')} {serviceBranchName}</span>
            )}
          </p>
          <p className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-ink-mute" />
            <span>{dayLabel}</span>
            <span className="ltr">— {slot}</span>
          </p>
          <p className="flex items-center gap-2">
            <User className="h-4 w-4 text-ink-mute" />
            <span>{user?.first_name ?? ''} {user?.last_name ?? user?.name ?? ''}</span>
          </p>
          <p className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-ink-mute" />
            <span className="ltr">{user?.mobile ?? ''}</span>
          </p>
        </div>
      )}

      {isCarService && (
        <div className="mt-5">
          <label className="flex items-center gap-2 text-sm font-extrabold text-ink mb-1.5">
            <Car className="h-4 w-4" /> {t('اختار العربية')}
          </label>
          {user?.cars && user.cars.length > 0 ? (
            <Select dir={isAr ? 'rtl' : 'ltr'} value={carId} onValueChange={setCarId}>
              <SelectTrigger className="h-12 rounded-xl border-2 border-border bg-white font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {user.cars.map((car) => (
                  <SelectItem key={car.id} value={String(car.id)} className="font-bold">
                    {car.model} — <span className="ltr">{car.plate_number}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
              {t('مفيش عربيات مضافة. أضف عربية من البروفايل عشان تكمل الحجز.')}
            </p>
          )}
        </div>
      )}

      {!user && (
        <p className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
          {t('سجّل دخول الأول عشان تقدر تأكد الحجز.')}
        </p>
      )}
    </div>
  );
}
