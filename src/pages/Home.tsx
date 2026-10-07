import { lazy, useCallback } from 'react';
import { useNavigate } from 'react-router';
import Hero from '@/components/Hero';
import NeedEntry from '@/components/NeedEntry';
import LazySection from '@/components/LazySection';

const TireShop = lazy(() => import('@/components/TireShop'));
const BatterySection = lazy(() => import('@/components/BatterySection'));
const CategoryProducts = lazy(() => import('@/components/CategoryProducts'));
const ServicesGrid = lazy(() => import('@/components/Services'));
const MobileService = lazy(() =>
  import('@/components/Services').then((m) => ({ default: m.MobileService })),
);
const Offers = lazy(() => import('@/components/Offers'));
const BlogsSection = lazy(() => import('@/components/BlogsSection'));
const WhyUs = lazy(() => import('@/components/Trust').then((m) => ({ default: m.WhyUs })));
const Brands = lazy(() => import('@/components/Trust').then((m) => ({ default: m.Brands })));
const BranchFinder = lazy(() =>
  import('@/components/Trust').then((m) => ({ default: m.BranchFinder })),
);
const PaymentMethodsStrip = lazy(() =>
  import('@/components/Trust').then((m) => ({ default: m.PaymentMethodsStrip })),
);
const FinalCTA = lazy(() => import('@/components/Footer').then((m) => ({ default: m.FinalCTA })));

export default function Home() {
  const navigate = useNavigate();

  const handleSearch = useCallback(
    (to: string) => {
      navigate(to);
    },
    [navigate],
  );

  return (
    <>
      <Hero onSearch={handleSearch} />
      <NeedEntry />
      <LazySection minH={520}>
        <TireShop limit={8} />
      </LazySection>
      <LazySection minH={700}>
        <BatterySection />
      </LazySection>
      <LazySection minH={480}>
        <CategoryProducts
          categoryId={11}
          title="زيوت"
          subtitle="زيوت أصلية لكل أنواع العربيات بأسعار مناسبة."
        />
      </LazySection>
      <LazySection minH={480}>
        <CategoryProducts
          categoryId={176}
          title="قطع غيار"
          subtitle="قطع غيار أصلية بالضمان من مخزون الفروع."
          tone="white"
        />
      </LazySection>
      <LazySection minH={380}>
        <ServicesGrid />
      </LazySection>
      <LazySection minH={500}>
        <MobileService />
      </LazySection>
      <LazySection minH={380}>
        <Offers />
      </LazySection>
      <LazySection minH={480}>
        <BlogsSection />
      </LazySection>
      <LazySection minH={350}>
        <WhyUs />
      </LazySection>
      <LazySection minH={180}>
        <Brands />
      </LazySection>
      <LazySection minH={500}>
        <BranchFinder />
      </LazySection>
      {/* <Reviews /> */}
      <LazySection minH={90}>
        <PaymentMethodsStrip />
      </LazySection>
      <LazySection minH={260}>
        <FinalCTA />
      </LazySection>
    </>
  );
}
