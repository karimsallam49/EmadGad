import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Car, Check, Clock, Loader2, LocateFixed, MapPin, Phone, User, Wrench } from 'lucide-react';
import { useAuth } from '@/auth';
import { useAddPickup } from '@/hooks/use-add-pickup';
import { useBusinessLocations } from '@/hooks/use-business-locations';
import { useServices } from '@/hooks/use-services';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLang } from '@/i18n';

/** The full rescue/pickup-request flow — shared between /rescue and the popup dialog */
const inputCls =
  'w-full h-12 rounded-xl border-2 border-border bg-white px-4 font-bold focus:outline-none focus:border-ink transition-colors';

function SectionHead({ n, title, hint }: { n: number; title: string; hint?: string }) {
  const { num, t } = useLang();
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-coal text-brand text-xs font-black">
        {num(n)}
      </span>
      <h3 className="text-lg font-black text-ink">{title}</h3>
      {hint && <span className="text-xs font-bold text-ink-mute">({hint === 'optional' ? t('اختياري') : hint})</span>}
    </div>
  );
}

export default function RescueForm({ onCancel }: { onCancel?: () => void }) {
  const { t, isAr } = useLang();
  const { user } = useAuth();
  const { data: branchesData, isLoading: isBranchesLoading } = useBusinessLocations();
  const addPickupMutation = useAddPickup();

  const branches = branchesData ?? [];

  const [branchId, setBranchId] = useState<string>('');
  const [serviceId, setServiceId] = useState<string>('');
  const [carId, setCarId] = useState<string>('');
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locStatus, setLocStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [notes, setNotes] = useState('');
  const [day, setDay] = useState<string>('');
  const [slot, setSlot] = useState<string>('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cars = user?.cars ?? [];
  const hasCars = cars.length > 0;

  useEffect(() => {
    if (branches.length && !branchId) {
      setBranchId(String(branches[0].id));
    }
  }, [branches, branchId]);

  // services of the picked branch — backend requires service_id
  const { data: services, isLoading: isServicesLoading } = useServices(
    branchId ? Number(branchId) : null,
  );

  // reset the service when the branch changes
  useEffect(() => {
    setServiceId('');
  }, [branchId]);

  const today = new Date().toISOString().slice(0, 10);

  const locate = () => {
    if (!navigator.geolocation) {
      setLocStatus('error');
      return;
    }
    setLocStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=${isAr ? 'ar' : 'en'}`,
          );
          const j = (await r.json()) as { display_name?: string };
          setAddress(j.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        } catch {
          setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }
        setLocStatus('done');
      },
      () => setLocStatus('error'),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  // auto-detect the pickup address on mount — user shouldn't have to type it
  useEffect(() => {
    if (user && locStatus === 'idle') locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const canSubmit =
    !!user &&
    !!carId &&
    !!serviceId &&
    (locStatus === 'done' || address.trim().length >= 8) &&
    !!day &&
    !!slot;

  const confirm = async () => {
    if (!canSubmit || !user) return;
    setError(null);
    try {
      await addPickupMutation.mutateAsync({
        contact_id: user.id,
        customer_name: user.name,
        customer_phone: user.mobile ?? '',
        service_id: Number(serviceId),
        location_id: branchId ? Number(branchId) : undefined,
        device_id: Number(carId),
        booking_start: `${day} ${slot}:00`,
        pickup_time: `${day} ${slot}:00`,
        address: address.trim(),
        pickup_address: address.trim(),
        pickup_latitude: coords?.lat,
        pickup_longitude: coords?.lng,
        notes: notes.trim() || undefined,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('فشل إرسال الطلب'));
    }
  };

  if (!user) {
    return (
      <div className="py-6 text-center">
        <p className="text-lg font-bold text-ink-mute">{t('سجّل دخول الأول عشان تطلب إنقاذ.')}</p>
        <Link to="/login" className="mt-4 inline-block rounded-xl bg-coal text-brand px-6 h-12 font-black leading-[3rem]">
          {t('سجّل دخول')}
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="py-6 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand">
          <Check className="h-8 w-8 text-ink" />
        </span>
        <h3 className="mt-4 text-2xl font-black text-ink">{t('تم استلام طلب الإنقاذ!')}</h3>
        <p className="mt-2 text-base font-semibold text-ink-mute">{t('فريقنا هيكلمك على رقمك خلال دقائق.')}</p>
        {onCancel && (
          <button
            onClick={onCancel}
            className="mt-5 inline-flex items-center rounded-xl border-2 border-ink px-6 h-11 font-black text-ink hover:bg-coal hover:text-brand transition-colors"
          >
            {t('تم')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* 1 — service & branch */}
      <div>
        <SectionHead n={1} title={t('الخدمة والفرع')} />
        <div className="mt-3 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-extrabold text-ink mb-1.5">{t('الفرع الأقرب')}</label>
            <Select dir={isAr ? 'rtl' : 'ltr'} value={branchId} onValueChange={setBranchId} disabled={isBranchesLoading}>
              <SelectTrigger className="h-12 rounded-xl border-2 border-border bg-white font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={String(b.id)} className="font-bold">
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-extrabold text-ink mb-1.5">
              <Wrench className="h-4 w-4" /> {t('نوع الخدمة')}
            </label>
            <Select dir={isAr ? 'rtl' : 'ltr'} value={serviceId} onValueChange={setServiceId} disabled={isServicesLoading || !branchId}>
              <SelectTrigger className="h-12 rounded-xl border-2 border-border bg-white font-bold">
                <SelectValue placeholder={isServicesLoading ? t('جاري تحميل الخدمات...') : t('اختار الخدمة المطلوبة')} />
              </SelectTrigger>
              <SelectContent>
                {(services ?? []).map((s) => (
                  <SelectItem key={s.id} value={String(s.id)} className="font-bold">
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 2 — car & location */}
      <div>
        <SectionHead n={2} title={t('عربيتك ومكانها')} />
        <div className="mt-3 space-y-4">
          {hasCars ? (
            <Select dir={isAr ? 'rtl' : 'ltr'} value={carId} onValueChange={setCarId}>
              <SelectTrigger className="h-12 rounded-xl border-2 border-border bg-white font-bold">
                <SelectValue placeholder={t('اختار عربيتك')} />
              </SelectTrigger>
              <SelectContent>
                {cars.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)} className="font-bold">
                    {c.brand_name ?? c.car_brand ?? c.make ?? ''} {c.model} {c.manufacturing_year}
                    {c.plate_number ? ` — ${c.plate_number}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex items-center justify-between gap-3 rounded-xl border-2 border-dashed border-border bg-muted/50 px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-bold text-ink-mute">
                <Car className="h-4 w-4 shrink-0" /> {t('مفيش عربيات مضافة على حسابك')}
              </p>
              <Link to="/profile" className="inline-flex shrink-0 items-center rounded-xl bg-coal text-brand px-4 h-9 text-xs font-black">
                {t('ضيف عربية')}
              </Link>
            </div>
          )}

          {locStatus === 'done' ? (
            <div className="flex items-start gap-3 rounded-xl border-2 border-emerald-200 bg-emerald-50/60 p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <MapPin className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink leading-relaxed">{address}</p>
                <button
                  type="button"
                  onClick={locate}
                  className="mt-1 inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 underline hover:text-emerald-800"
                >
                  <LocateFixed className="h-3.5 w-3.5" /> {t('إعادة التحديد')}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={locate}
              disabled={locStatus === 'loading'}
              className="flex w-full items-center justify-center gap-2 h-12 rounded-xl border-2 border-dashed border-ink bg-brand/20 font-black text-ink hover:bg-brand/40 disabled:opacity-60 transition-colors"
            >
              {locStatus === 'loading' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <LocateFixed className="h-5 w-5" />
              )}
              {locStatus === 'loading' ? t('جاري تحديد موقعك...') : t('حدد موقعي تلقائيًا')}
            </button>
          )}
          {locStatus === 'error' && (
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t('متعذر تحديد موقعك — اكتب عنوانك يدويًا')}
              className={inputCls}
            />
          )}
        </div>
      </div>

      {/* 3 — time */}
      <div>
        <SectionHead n={3} title={t('ميعاد الإنقاذ')} />
        <div className="mt-3 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-extrabold text-ink mb-1.5">
              <Clock className="inline h-4 w-4 me-1" /> {t('اليوم')}
            </label>
            <input
              type="date"
              min={today}
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className={`${inputCls} ltr`}
            />
          </div>
          <div>
            <label className="block text-sm font-extrabold text-ink mb-1.5">
              <Clock className="inline h-4 w-4 me-1" /> {t('الساعة')}
            </label>
            <input
              type="time"
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
              className={`${inputCls} ltr`}
            />
          </div>
        </div>
      </div>

      {/* 4 — notes */}
      <div>
        <SectionHead n={4} title={t('ملاحظات')} hint="optional" />
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t('مثال: العربية مش بتدور، محتاج ونش')}
          className={`${inputCls} mt-3`}
        />
      </div>

      <div className="rounded-xl bg-muted/70 px-4 py-3 flex items-center gap-4 text-sm font-bold text-ink">
        <p className="flex items-center gap-2 min-w-0">
          <User className="h-4 w-4 shrink-0 text-ink-mute" />
          <span className="truncate">{user.name}</span>
        </p>
        <p className="flex items-center gap-2">
          <Phone className="h-4 w-4 shrink-0 text-ink-mute" />
          <span className="ltr">{user.mobile}</span>
        </p>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>
      )}

      <div className="flex items-center gap-3 pt-1">
        {onCancel && (
          <button
            onClick={onCancel}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border-2 border-border px-5 h-12 font-black text-ink hover:border-ink transition-colors"
          >
            {t('رجوع')}
          </button>
        )}
        <button
          onClick={confirm}
          disabled={!canSubmit || addPickupMutation.isPending}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand text-coal px-7 h-12 text-lg font-black border-2 border-coal shadow-[0_4px_0_#191919] hover:translate-y-[2px] hover:shadow-[0_2px_0_#191919] disabled:opacity-40 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed transition-all"
        >
          {addPickupMutation.isPending && <Loader2 className="h-5 w-5 animate-spin" />}
          {addPickupMutation.isPending ? t('جاري الإرسال...') : t('إرسال الطلب')}
        </button>
      </div>
    </div>
  );
}
