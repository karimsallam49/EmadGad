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
        features: [],
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
