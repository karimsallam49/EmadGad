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
        features: [],
        whatsappText: 'محتاج مساعدة؟ كلمنا واتساب',
        relatedTitle: 'منتجات تانية ممكن تعجبك',
        renderRelatedCard: (p) => (
          <ApiProductCard key={`${p.id}-${p.variation_id ?? 0}`} p={p} ctaLabel="أضف للسلة" />
        ),
      }}
    />
  );
}
