import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth';
import { getContactKm, scanContactKm, updateContactKm } from '@/lib/api';

export const contactKmKeys = {
  all: ['contact-km'] as const,
  device: (deviceId: number) => [...contactKmKeys.all, deviceId] as const,
};

export function useContactKm(deviceId: number | null | undefined, enabled = true) {
  const { user } = useAuth();
  return useQuery({
    queryKey: contactKmKeys.device(deviceId ?? 0),
    queryFn: () => getContactKm(deviceId!),
    enabled: enabled && !!user && deviceId != null,
    staleTime: 60_000,
    retry: false,
  });
}

export function useUpdateContactKm(deviceId: number | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (km: number) => updateContactKm(deviceId!, km),
    onSuccess: () => qc.invalidateQueries({ queryKey: contactKmKeys.device(deviceId ?? 0) }),
  });
}

export function useScanContactKm(deviceId?: number | null) {
  return useMutation({
    mutationFn: (file: File) => scanContactKm(file, deviceId ?? undefined),
  });
}
