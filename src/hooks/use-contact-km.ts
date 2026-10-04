import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth';
import { getContactKm, scanContactKm, updateContactKm } from '@/lib/api';

export const contactKmKeys = {
  all: ['contact-km'] as const,
};

export function useContactKm(enabled = true) {
  const { user } = useAuth();
  return useQuery({
    queryKey: contactKmKeys.all,
    queryFn: getContactKm,
    enabled: enabled && !!user,
    staleTime: 60_000,
    retry: false,
  });
}

export function useUpdateContactKm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (km: number) => updateContactKm(km),
    onSuccess: () => qc.invalidateQueries({ queryKey: contactKmKeys.all }),
  });
}

export function useScanContactKm() {
  return useMutation({
    mutationFn: (file: File) => scanContactKm(file),
  });
}
