import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useAuth } from '@/auth';
import { useAddBooking } from '@/hooks/use-add-booking';
import { useBusinessLocations } from '@/hooks/use-business-locations';
import { useGroupServices, useServices } from '@/hooks/use-services';
import { BranchStep } from '@/components/booking/BranchStep';
import { ServiceStep } from '@/components/booking/ServiceStep';
import { TimeStep } from '@/components/booking/TimeStep';
import { ContactStep } from '@/components/booking/ContactStep';
import { Nav } from '@/components/booking/Nav';
import { DoneView } from '@/components/booking/DoneView';
import { Stepper } from '@/components/booking/Stepper';
import { useLang } from '@/i18n';
import { locationDisplayName } from '@/lib/api';
import type { AddBookingResultEntry, BusinessLocationWithWebsiteSettingsModel, ServiceModel } from '@/lib/api';

export default function BookingPage() {
  const { t, isAr } = useLang();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const preService = params.get('service');

  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState<string | null>(preService);
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [branchId, setBranchId] = useState<string>('');
  const [carId, setCarId] = useState<string>('');
  const [day, setDay] = useState<string>('');
  const [slot, setSlot] = useState<string>('');
  const [done, setDone] = useState<string | null>(null);
  const [doneEntries, setDoneEntries] = useState<AddBookingResultEntry[]>([]);
  const [doneLocation, setDoneLocation] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: branchesData, isLoading: isBranchesLoading } = useBusinessLocations();
  const addBookingMutation = useAddBooking();

  const branches = branchesData ?? [];
  const branch: BusinessLocationWithWebsiteSettingsModel | undefined = branches.find((b) => String(b.id) === branchId);

  // master branch → booking routes across itself + linked branches (master first)
  const groupIds = useMemo(() => {
    const ws = branch?.website_settings;
    return ws?.is_master && ws.master_branch_ids?.length && branch
      ? [branch.id, ...ws.master_branch_ids]
      : null;
  }, [branch]);
  const isMaster = !!groupIds;

  const { data: servicesData, isLoading: isServicesLoading } = useServices(
    branchId && !isMaster ? Number(branchId) : null
  );
  const { data: groupData, isLoading: isGroupLoading } = useGroupServices(groupIds);

  // merged unique service list in candidate order (master first, then linked branches)
  const services = useMemo(() => {
    if (!isMaster || !groupData) return servicesData ?? [];
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
  }, [isMaster, groupData, groupIds, servicesData]);

  // first candidate branch offering a service — matches backend routing order
  const serviceBranchName = useMemo(() => {
    if (!isMaster || !groupData) return undefined;
    return (serviceIdNum: number) => {
      for (const id of groupIds ?? []) {
        if ((groupData[String(id)] ?? []).some((s) => s.id === serviceIdNum)) {
          const b = branches.find((bb) => bb.id === id);
          return b ? locationDisplayName(b, isAr) : undefined;
        }
      }
      return undefined;
    };
  }, [isMaster, groupData, groupIds, branches, isAr]);

  useEffect(() => {
    if (branches.length && !branchId) {
      setBranchId(String(branches[0].id));
    }
  }, [branches, branchId]);

  useEffect(() => {
    setServiceId(null);
    setServiceIds([]);
    setCarId('');
  }, [branchId]);

  // seed multi-select with a pre-picked service (?service=) once master mode kicks in
  useEffect(() => {
    if (isMaster && serviceId && !serviceIds.length) setServiceIds([serviceId]);
  }, [isMaster, serviceId, serviceIds.length]);

  const selectedServices = useMemo(
    () => (isMaster ? services.filter((s) => serviceIds.includes(String(s.id))) : []),
    [isMaster, services, serviceIds]
  );
  const service: ServiceModel | undefined = isMaster
    ? selectedServices[0]
    : services.find((s) => String(s.id) === serviceId);
  // device_id is required if any candidate branch that could take the booking is a car-service branch
  const isCarService = isMaster
    ? (groupIds ?? []).some((id) => branches.find((b) => b.id === id)?.website_settings?.is_car_service)
    : !!branch?.website_settings?.is_car_service;

  const toggleService = (id: string) =>
    setServiceIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const canNext =
    step === 0
      ? !!branchId
      : step === 1
        ? isMaster
          ? serviceIds.length > 0
          : !!serviceId
        : step === 2
          ? !!day && !!slot
          : !!user && (!isCarService || !!carId);

  const confirm = async () => {
    if (!service || !day || !slot || !user || !branchId) return;
    if (isCarService && !carId) return;
    setSubmitError(null);
    const start = `${day} ${slot}:00`;
    try {
      const res = await addBookingMutation.mutateAsync({
        location_id: Number(branchId),
        ...(isMaster ? { service_ids: serviceIds.map(Number) } : { service_id: service.id }),
        booking_start: start,
        device_id: isCarService ? Number(carId) : undefined,
        booking_note: '',
        send_notification: false,
      });
      // multi-branch response → data[] carries the branch each service landed on
      const entries = Array.isArray(res.data) ? (res.data as AddBookingResultEntry[]) : [];
      setDoneEntries(entries);
      setDoneLocation(entries[0]?.location_name ?? null);
      const ref = entries[0]?.booking_id
        ? `BK-${entries.map((e) => e.booking_id).join('-')}`
        : `EG-${Math.floor(100000 + Math.random() * 900000)}`;
      setDone(ref);
      window.scrollTo(0, 0);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t('فشل إرسال الطلب'));
    }
  };

  if (done && service) {
    return (
      <DoneView
        done={done}
        service={service}
        branch={branch}
        day={day}
        slot={slot}
        phone={user?.mobile ?? ''}
        resolvedBranchName={doneLocation}
        entries={isMaster ? doneEntries : undefined}
      />
    );
  }

  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 lg:py-14">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-black text-ink">{t('احجز خدمتك')}</h1>
          <p className="mt-2 text-lg font-semibold text-ink-mute">{t('٤ خطوات وخلاص — من غير مكالمات ولا انتظار.')}</p>
        </div>

        <Stepper step={step} />

        <div className="mt-8 rounded-2xl border-2 border-ink bg-white p-5 sm:p-8 shadow-[0_10px_0_#f6c744]">
          {step === 0 && (
            <BranchStep
              branches={branches}
              isLoading={isBranchesLoading}
              branchId={branchId}
              setBranchId={setBranchId}
              branch={branch}
            />
          )}
          {step === 1 && (
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
          {step === 2 && <TimeStep day={day} setDay={setDay} slot={slot} setSlot={setSlot} />}
          {step === 3 && (
            <ContactStep
              service={service}
              services={isMaster ? selectedServices : undefined}
              branch={branch}
              carId={carId}
              setCarId={setCarId}
              day={day}
              slot={slot}
              alwaysShowCar={isCarService}
              serviceBranchName={service ? serviceBranchName?.(service.id) : undefined}
            />
          )}

          {submitError && (
            <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{submitError}</p>
          )}

          <Nav step={step} canNext={canNext} isPending={addBookingMutation.isPending} setStep={setStep} confirm={confirm} />
        </div>
      </div>
    </div>
  );
}
