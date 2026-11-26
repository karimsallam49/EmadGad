import { useQuery } from '@tanstack/react-query';
import { getAboutUs } from '@/lib/api';

export const aboutUsKeys = {
  all: ['about-us'] as const,
};

/** Public — admin-edited about-us content; cache long, it changes rarely */
export function useAboutUs() {
  return useQuery({
    queryKey: aboutUsKeys.all,
    queryFn: () => getAboutUs(),
    staleTime: 10 * 60_000,
  });
}
