import { useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import TireFinder from '@/components/TireFinder';
import TireShop from '@/components/TireShop';

export default function TiresPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const selectedItemIds = params.get('selected_item_ids') ?? undefined;
  // default to the tires category so the page actually paginates the tire catalog
  const categoryId = Number(params.get('category_id')) || 2217;

  const handleSearch = useCallback(
    (to: string) => {
      navigate(to);
    },
    [navigate],
  );

  return (
    <>
      <TireFinder onSearch={handleSearch} />
      <TireShop selectedItemIds={selectedItemIds} categoryId={categoryId} />
    </>
  );
}
