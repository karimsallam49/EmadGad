import { useQuery } from '@tanstack/react-query';
import { getEcomProducts } from '@/lib/api';

interface EcomProductsQuery {
  business_id: number;
  car_brand_id?: number;
  car_model_id?: number;
  car_year?: number;
  device_brand_id?: number;
  selected_item_ids?: string;
  category_id?: number;
  per_page?: number;
  page?: number;
}

export const ecomProductsKeys = {
  all: ['ecom-products'] as const,
  filtered: (query: EcomProductsQuery) =>
    [...ecomProductsKeys.all, query] as const,
};

export function useEcomProducts(query: EcomProductsQuery | null) {
  return useQuery({
    queryKey: query ? ecomProductsKeys.filtered(query) : ecomProductsKeys.all,
    queryFn: () => (query ? getEcomProducts(query) : Promise.resolve({ data: [] })),
    enabled: !!query,
  });
}
