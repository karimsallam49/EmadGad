import { BadgeCheck, MapPin, ShieldCheck, Truck } from 'lucide-react';
import { ProductDetail } from '@/components/ProductDetail';
import { ApiProductCard } from '@/components/BatterySection';

export default function BatteryDetailPage() {
  return (
    <ProductDetail
      cfg={{
        listPath: '/batteries',
        listLabel: 'البطاريات',
        allLabel: 'كل البطاريات',
        backLabel: 'ارجع لمتجر البطاريات',
        notFoundLabel: 'البطارية دي مش موجودة',
        priceLabel: 'سعر البطارية',
        cartTitle: (name, isAr) => (isAr ? `بطارية ${name}` : `${name} Battery`),
        features: [
          { icon: Truck, text: 'متاح خدمة تغيير متنقلة لحد مكانك' },
          { icon: BadgeCheck, text: 'تركيب مجاني في أقرب فرع' },
          { icon: ShieldCheck, text: 'بطارية أصلية بالضمان من مصادر موثوقة' },
          { icon: MapPin, text: 'الدفع عند الاستلام أو في الفرع' },
        ],
        whatsappText: 'محتاج مساعدة في اختيار البطارية؟ كلمنا واتساب',
        relatedTitle: 'بطاريات تانية ممكن تعجبك',
        relatedCategoryId: 2222,
        renderRelatedCard: (p) => (
          <ApiProductCard key={`${p.id}-${p.variation_id ?? 0}`} p={p} detailBase="/batteries" />
        ),
      }}
    />
  );
}
