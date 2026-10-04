import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import Hero from '@/components/Hero';
import NeedEntry from '@/components/NeedEntry';
import TireShop from '@/components/TireShop';
import BatterySection from '@/components/BatterySection';
import CategoryProducts from '@/components/CategoryProducts';
import ServicesGrid, { MobileService } from '@/components/Services';
import Offers from '@/components/Offers';
import { BranchFinder, Brands, PaymentMethodsStrip, WhyUs } from '@/components/Trust';
import { FinalCTA } from '@/components/Footer';

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
      <TireShop limit={8} />
      <BatterySection />
      <CategoryProducts
        categoryId={11}
        title="زيوت"
        subtitle="زيوت أصلية لكل أنواع العربيات بأسعار مناسبة."
      />
      <CategoryProducts
        categoryId={176}
        title="قطع غيار"
        subtitle="قطع غيار أصلية بالضمان من مخزون الفروع."
        tone="white"
      />
      <ServicesGrid />
      <MobileService />
      <Offers />
      <WhyUs />
      <Brands />
      <BranchFinder />
      {/* <Reviews /> */}
      <PaymentMethodsStrip />
      <FinalCTA />
    </>
  );
}
