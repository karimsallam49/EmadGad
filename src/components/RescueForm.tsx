import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Car, Check, Clock, MapPin, Phone, User } from 'lucide-react';
import { useAuth } from '@/auth';
import { useAddPickup } from '@/hooks/use-add-pickup';
import { useBusinessLocations } from '@/hooks/use-business-locations';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLang } from '@/i18n';
import type { BusinessLocationWithWebsiteSettingsModel } from '@/lib/api';

/** The full rescue/pickup-request flow — shared between /rescue and the popup dialog */
export default function RescueForm({ onCancel }: { onCancel?: () => void }) {
  const { t, isAr } = useLang();
  const { user } = useAuth();
  const { data: branchesData, isLoading: isBranchesLoading } = useBusinessLocations();
  const addPickupMutation = useAddPickup();

  const branches = branchesData ?? [];

  const [branchId, setBranchId] = useState<string>('');
  const [address, setAddress] = useState('');
  const [vehicleDetails, setVehicleDetails] = useState('');
  const [day, setDay] = useState<string>('');
  const [slot, setSlot] = useState<string>('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (branches.length && !branchId) {
      setBranchId(String(branches[0].id));
    }
  }, [branches, branchId]);

  const today = new Date().toISOString().slice(0, 10);

  const canSubmit =
    !!user &&
    address.trim().length >= 8 &&
    vehicleDetails.trim().length >= 3 &&
    !!day &&
    !!slot;

  const branch: BusinessLocationWithWebsiteSettingsModel | undefined = branches.find(
    (b) => String(b.id) === branchId
  );

  const confirm = async () => {
    if (!canSubmit) return;
    setError(null);
    const pickupTime = `${day} ${slot}:00`;
    try {
      await addPickupMutation.mutateAsync({
        contactId: user?.id,
        locationId: branchId ? Number(branchId) : undefined,
        address,
        phone: user?.mobile ?? '',
        vehicleDetails,
        pickupTime,
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
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-extrabold text-ink mb-1.5">{t('الفرع الأقرب (اختياري)')}</label>
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
        {branch && (
          <p className="mt-2 flex items-center gap-2 text-sm font-bold text-ink-mute">
            <MapPin className="h-4 w-4" /> {branch.name}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-extrabold text-ink mb-1.5">{t('عنوانك بالتفصيل')}</label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={t('مثال: مدينة نصر، شارع عباس العقاد، عمارة ١٥')}
          className="w-full h-12 rounded-xl border-2 border-border bg-white px-4 font-bold focus:outline-none focus:border-ink"
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-extrabold text-ink mb-1.5">
          <Car className="h-4 w-4" /> {t('تفاصيل العربية')}
        </label>
        <input
          value={vehicleDetails}
          onChange={(e) => setVehicleDetails(e.target.value)}
          placeholder={t('مثال: BMW X5 - أبيض - ألف 456')}
          className="w-full h-12 rounded-xl border-2 border-border bg-white px-4 font-bold focus:outline-none focus:border-ink"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-extrabold text-ink mb-1.5">
            <Clock className="inline h-4 w-4 me-1" /> {t('اليوم')}
          </label>
          <input
            type="date"
            min={today}
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-full h-12 rounded-xl border-2 border-border bg-white px-4 font-bold focus:outline-none focus:border-ink ltr"
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
            className="w-full h-12 rounded-xl border-2 border-border bg-white px-4 font-bold focus:outline-none focus:border-ink ltr"
          />
        </div>
      </div>

      <div className="rounded-xl bg-muted/70 p-4 space-y-2 text-sm font-bold text-ink">
        <p className="flex items-center gap-2">
          <User className="h-4 w-4 text-ink-mute" /> {user.name}
        </p>
        <p className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-ink-mute" /> <span className="ltr">{user.mobile}</span>
        </p>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>
      )}

      <div className="flex items-center justify-between gap-3 pt-2">
        {onCancel ? (
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-border px-5 h-12 font-black text-ink hover:border-ink transition-colors"
          >
            {t('رجوع')}
          </button>
        ) : (
          <span />
        )}
        <button
          onClick={confirm}
          disabled={!canSubmit || addPickupMutation.isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-brand text-coal px-7 h-12 font-black border-2 border-coal shadow-[0_4px_0_#191919] hover:translate-y-[2px] hover:shadow-[0_2px_0_#191919] disabled:opacity-40 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed transition-all"
        >
          {addPickupMutation.isPending ? t('جاري الإرسال...') : t('إرسال الطلب')}
        </button>
      </div>
    </div>
  );
}
