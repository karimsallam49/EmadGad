import { useSearchParams } from 'react-router';
import BatterySection from '@/components/BatterySection';

export default function BatteriesPage() {
  const [params] = useSearchParams();
  const categoryId = Number(params.get('category_id')) || undefined;
  return <BatterySection categoryId={categoryId} />;
}
