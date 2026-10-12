import { useQuery } from '@tanstack/react-query';
import { getLegalPage } from '@/lib/api';
import type { LegalSlug } from '@/types/api';

export const legalPageKeys = {
  all: ['legal-pages'] as const,
  page: (slug: LegalSlug) => [...legalPageKeys.all, slug] as const,
};

/** Public — admin-edited legal page content; cache long, it changes rarely */
export function useLegalPage(slug: LegalSlug) {
  return useQuery({
    queryKey: legalPageKeys.page(slug),
    queryFn: () => getLegalPage(slug),
    staleTime: 10 * 60_000,
  });
}
