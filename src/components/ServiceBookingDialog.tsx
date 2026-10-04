import { useEffect, useMemo, useState } from 'react';
import { Building2, Check, ChevronRight, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/auth';
import { useAddBooking } from '@/hooks/use-add-booking';
import { useBusinessLocations } from '@/hooks/use-business-locations';
import { useGroupServices, useServices } from '@/hooks/use-services';
import { BranchStep } from '@/components/booking/BranchStep';
import { ServiceStep } from '@/components/booking/ServiceStep';
import { TimeStep } from '@/components/booking/TimeStep';
import { ContactStep } from '@/components/booking/ContactStep';
import { useLang } from '@/i18n';
import { locationDisplayName } from '@/lib/api';
import type { AddBookingResultEntry, ServiceModel } from '@/lib/api';

export const MAIN_LOCATION_ID = 3;

type Step = 'time' | 'confirm' | 'branch' | 'service' | 'done';

interface Props {
  service: ServiceModel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ServiceBookingDialog({ service, open, onOpenChange }: Props) {
  const { t, isAr, fmt } = useLang();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>('time');
  const [branchId, setBranchId] = useState(String(MAIN_LOCATION_ID));
  const [serviceId, setServiceId] = useState('');
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [carId, setCarId] = useState('');
  const [day, setDay] = useState('');
  const [slot, setSlot] = useState('');
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [doneEntries, setDoneEntries] = useState<AddBookingResultEntry[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: branchesData, isLoading: isBranchesLoading } = useBusinessLocations();
  const addBookingMutation = useAddBooking();

  const branches = branchesData ?? [];
  const branch = branches.find((b) => String(b.id) === branchId);

  // master branch → fetch services for master + linked branches in one grouped call
  const groupIds = useMemo(() => {
    const ws = branch?.website_settings;
    return ws?.is_master && ws.master_branch_ids?.length && branch
      ? [branch.id, ...ws.master_branch_ids]
      : null;
  }, [branch]);
  const isMaster = !!groupIds;

  const { data: branchServices, isLoading: isServicesLoading } = useServices(
    branchId && !isMaster ? Number(branchId) : null,
    open,
  );
  const { data: groupData, isLoading: isGroupLoading } = useGroupServices(groupIds, open);

  const services = useMemo(() => {
    if (!isMaster || !groupData) return branchServices ?? [];
    const seen = new Set<number>();
    const merged: ServiceModel[] = [];
    for (const id of groupIds ?? []) {
      for (const s of groupData[String(id)] ?? []) {
        if (!seen.has(s.id)) {
          seen.add(s.id);
          merged.push(s);
        }
      }
    }
    return merged;
  }, [isMaster, groupData, groupIds, branchServices]);

  const serviceBranchName = useMemo(() => {
    if (!isMaster || !groupData) return undefined;
    return (sid: number) => {
      for (const id of groupIds ?? []) {
        if ((groupData[String(id)] ?? []).some((s) => s.id === sid)) {
          const b = branches.find((bb) => bb.id === id);
          return b ? locationDisplayName(b, isAr) : undefined;
        }
      }
      return undefined;
    };
  }, [isMaster, groupData, groupIds, branches, isAr]);

  // the service being booked — from the picked card, or re-resolved after a branch switch
  const selectedServices = isMaster ? services.filter((s) => serviceIds.includes(String(s.id))) : [];
  const activeService: ServiceModel | undefined = isMaster
    ? (serviceIds.includes(String(service?.id)) ? service ?? undefined : selectedServices[0])
    : serviceId === String(service?.id)
      ? service ?? undefined
      : services.find((s) => String(s.id) === serviceId);

  // reset the whole cycle every time the dialog opens with a fresh card
  useEffect(() => {
    if (open && service) {
      setStep('time');
      setBranchId(String(MAIN_LOCATION_ID));
      setServiceId(String(service.id));
      setServiceIds([String(service.id)]);
      setCarId('');
      setDay('');
      setSlot('');
      setBookingRef(null);
      setDoneEntries([]);
      setSubmitError(null);
    }
  }, [open, service]);

  const toggleService = (id: string) =>
    setServiceIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const confirm = async () => {
    const ids = isMaster ? serviceIds : serviceId ? [serviceId] : [];
    if (!ids.length || !day || !slot || !user || !branchId) return;
    setSubmitError(null);
    try {
      const res = await addBookingMutation.mutateAsync({
        location_id: Number(branchId),
        ...(isMaster ? { service_ids: ids.map(Number) } : { service_id: Number(ids[0]) }),
        booking_start: `${day} ${slot}:00`,
        device_id: carId ? Number(carId) : undefined,
        send_notification: false,
      });
      const entries = Array.isArray(res.data) ? (res.data as AddBookingResultEntry[]) : [];
      setDoneEntries(entries);
      setBookingRef(
        entries[0]?.booking_id
          ? `BK-${entries.map((e) => e.booking_id).join('-')}`
          : `EG-${Math.floor(100000 + Math.random() * 900000)}`
      );
      setStep('done');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t('فشل إرسال الطلب'));
    }
  };

  const canNext = useMemo(() => {
    if (step === 'branch') return !!branchId;
    if (step === 'service') return isMaster ? serviceIds.length > 0 : !!serviceId;
    if (step === 'time') return !!day && !!slot;
    if (step === 'confirm') return !!user;
    return false;
  }, [step, branchId, serviceId, serviceIds, isMaster, day, slot, user]);

  const next = () => {
    if (step === 'branch') {
      setServiceId('');
      setServiceIds(service ? [String(service.id)] : []);
      setStep('service');
    } else if (step === 'service') setStep('time');
    else if (step === 'time') setStep('confirm');
    else if (step === 'confirm') void confirm();
  };

  const back = () => {
    if (step === 'service') setStep('branch');
    else if (step === 'confirm' || step === 'branch') setStep('time');
  };

  const dayLabel = useMemo(() => {
    if (!day) return '';
    const d = new Date(day);
    return Number.isNaN(d.getTime())
      ? day
      : d.toLocaleDateString(isAr ? 'ar-EG' : 'en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }, [day, isAr]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl border-2 border-ink p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-ink text-start">
            {step === 'done' ? t('تم استلام طلبك!') : (activeService?.name ?? t('احجز خدمتك'))}
          </DialogTitle>
        </DialogHeader>

        {/* current branch chip — hidden while picking a new one */}
        {step !== 'branch' && step !== 'done' && (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/70 px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-bold text-ink">
              <Building2 className="h-4 w-4 shrink-0 text-ink-mute" />
              {branch ? locationDisplayName(branch, isAr) : t('الفرع الرئيسي')}
            </p>
            <button
              onClick={() => setStep('branch')}
              className="shrink-0 inline-flex items-center gap-1 text-sm font-black text-ink underline underline-offset-4 decoration-brand decoration-2 hover:decoration-4"
            >
              {t('غير الفرع')} <ChevronRight className="h-4 w-4 rtl:-scale-x-100" />
            </button>
          </div>
        )}

        {step === 'branch' && (
          <BranchStep branches={branches} isLoading={isBranchesLoading} branchId={branchId} setBranchId={setBranchId} branch={branch} />
        )}
        {step === 'service' && (
          <ServiceStep
            services={services}
            isLoading={isMaster ? isGroupLoading : isServicesLoading}
            serviceId={serviceId}
            setServiceId={setServiceId}
            serviceBranch={serviceBranchName}
            serviceIds={isMaster ? serviceIds : undefined}
            onToggleService={isMaster ? toggleService : undefined}
          />
        )}
        {step === 'time' && <TimeStep day={day} setDay={setDay} slot={slot} setSlot={setSlot} />}
        {step === 'confirm' && (
          <ContactStep
            service={activeService}
            services={isMaster ? selectedServices : undefined}
            branch={branch}
            carId={carId}
            setCarId={setCarId}
            day={day}
            slot={slot}
            alwaysShowCar
            serviceBranchName={activeService ? serviceBranchName?.(activeService.id) : undefined}
          />
        )}

        {step === 'done' && bookingRef && (
          <div className="text-center py-4">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand">
              <Check className="h-8 w-8 text-ink" />
            </span>
            <p className="mt-4 text-lg font-black text-ink">
              {t('رقم الحجز:')} <span className="ltr">{bookingRef}</span>
            </p>
            <div className="mt-4 rounded-xl bg-muted/70 p-4 space-y-2 text-sm font-bold text-ink text-start">
              {doneEntries.length ? (
                doneEntries.map((e) => (
                  <p key={e.booking_id} className="flex items-center justify-between gap-2">
                    <span>{e.service_name}</span>
                    <span className="text-ink-mute text-xs">
                      {e.location_name} <span className="ltr">#{e.booking_id}</span>
                    </span>
                  </p>
                ))
              ) : (
                activeService && <p>{activeService.name}</p>
              )}
              <p className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-ink-mute" /> {branch ? locationDisplayName(branch, isAr) : ''}
              </p>
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-ink-mute" /> {dayLabel} <span className="ltr">— {slot}</span>
              </p>
            </div>
            {!!activeService?.priceFrom && (
              <p className="mt-3 rounded-xl bg-muted/70 px-4 py-3 text-sm font-black text-ink">
                {t('السعر المتوقع: من')} {fmt(activeService.priceFrom)}
              </p>
            )}
            <p className="mt-4 text-sm font-semibold text-ink-mute">
              {t('فريقنا هيكلمك على رقمك خلال دقائق لتأكيد الحجز.')}
            </p>
          </div>
        )}

        {submitError && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{submitError}</p>
        )}

        {step !== 'done' && (
          <div className="flex items-center justify-between gap-3 pt-2">
            {(step === 'confirm' || step === 'service') ? (
              <button
                onClick={back}
                className="rounded-xl border-2 border-border px-5 h-11 text-sm font-black text-ink hover:border-ink transition-colors"
              >
                {t('رجوع')}
              </button>
            ) : (
              <span />
            )}
            <button
              onClick={next}
              disabled={!canNext || addBookingMutation.isPending}
              className="rounded-xl bg-brand text-coal px-7 h-11 text-base font-black border-2 border-coal shadow-[0_4px_0_#191919] hover:translate-y-[2px] hover:shadow-[0_2px_0_#191919] disabled:opacity-40 disabled:shadow-none disabled:translate-y-0 transition-all"
            >
              {step === 'confirm'
                ? addBookingMutation.isPending
                  ? t('جاري الحجز...')
                  : t('أكد الحجز')
                : step === 'branch' || step === 'service'
                  ? t('اختار وكمّل')
                  : t('كمّل')}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
