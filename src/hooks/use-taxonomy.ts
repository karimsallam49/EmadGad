import { useQuery } from '@tanstack/react-query';
import { getTaxonomy } from '@/lib/api';

export interface TaxonomyQuery {
  type?: string;
  page?: number;
  name?: string;
  is_ecom?: number;
  business_id?: number;
  category_id?: number;
  level_id?: number;
  selected_item_ids?: string;
}

export const taxonomyKeys = {
  all: ['taxonomy'] as const,
  list: (query?: TaxonomyQuery) => [...taxonomyKeys.all, query] as const,
};

export function useTaxonomy(query: TaxonomyQuery = { type: 'product', page: 1 }) {
  return useQuery({
    queryKey: taxonomyKeys.list(query),
    queryFn: () => getTaxonomy(query),
  });
}
