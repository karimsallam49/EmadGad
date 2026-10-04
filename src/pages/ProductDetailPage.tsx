import { BadgeCheck, MapPin, ShieldCheck, Truck } from 'lucide-react';
import { ProductDetail } from '@/components/ProductDetail';
import { ApiProductCard } from '@/components/BatterySection';

/** Generic show page for any ecom product — /products/:id */
export default function ProductDetailPage() {
  return (
    <ProductDetail
      cfg={{
        listPath: '/products',
        listLabel: 'المنتجات',
        allLabel: 'كل المنتجات',
        backLabel: 'ارجع للمنتجات',
        notFoundLabel: 'المنتج ده مش موجود',
        priceLabel: 'السعر',
        cartTitle: (name) => name,
        features: [
          { icon: ShieldCheck, text: 'منتجات أصلية بالضمان' },
          { icon: Truck, text: 'متاح خدمة تركيب متنقلة لحد مكانك' },
          { icon: MapPin, text: 'الدفع عند الاستلام أو في الفرع' },
          { icon: BadgeCheck, text: 'فروع في كل مكان' },
        ],
        whatsappText: 'محتاج مساعدة؟ كلمنا واتساب',
        relatedTitle: 'منتجات تانية ممكن تعجبك',
        renderRelatedCard: (p) => (
          <ApiProductCard key={`${p.id}-${p.variation_id ?? 0}`} p={p} ctaLabel="أضف للسلة" />
        ),
      }}
    />
  );
}
