export interface Tire {
  id: string;
  brand: string;
  model: string;
  size: string; // e.g. "205/55 R16"
  width: number;
  profile: number;
  rim: number;
  price: number; // per tire, EGP
  badge?: 'الأكثر مبيعًا' | 'أفضل قيمة' | 'عرض' | 'اقتصادي';
  usage: 'يومي' | 'اقتصادي' | 'أداء' | 'SUV';
  rating: number; // 1-5
  stock: 'متوفر' | 'كمية محدودة' | 'نفدت الكمية';
  image?: string;
  /** All product images — first one is the cover, rest swap on hover */
  images?: string[];
  /** Brand jobsheet photo (logo) from the API */
  brandPhoto?: string | null;
  /** Device brand id — used to filter the products page by brand */
  brandId?: number;
  /** Original price when a product-level discount applies */
  oldPrice?: number;
  discountValue?: number;
  discountType?: 'percentage' | 'fixed' | null;
  qtyAvailable?: number;
  /** Backend ids when the tire comes from the API catalog */
  productId?: number;
  variationId?: number;
  /** Ecom category id — routes the card to the matching detail page */
  categoryId?: number;
}

export interface Battery {
  id: string;
  brand: string;
  model: string;
  ah: number;
  warrantyMonths: number;
  price: number;
  badge?: 'الأكثر مبيعًا' | 'أفضل قيمة' | 'عرض';
  stock: 'متوفر' | 'كمية محدودة';
}

export interface Service {
  id: string;
  name: string;
  desc: string;
  duration: string;
  priceFrom?: number;
  icon: 'tire' | 'repair' | 'balance' | 'align' | 'battery' | 'inspect' | 'oil' | 'bolt';
  mobile: boolean;
}

export interface Branch {
  id: string;
  gov: string;
  area: string;
  name: string;
  address: string;
  hours: string;
  phone: string;
  services: string[];
}

export const TIRES: Tire[] = [
  { id: 't1', brand: 'Apollo', model: 'Alnac 4G', size: '195/65 R15', width: 195, profile: 65, rim: 15, price: 5400, badge: 'الأكثر مبيعًا', usage: 'يومي', rating: 5, stock: 'متوفر' },
  { id: 't2', brand: 'Apollo', model: 'Amazer 4G Eco', size: '185/70 R14', width: 185, profile: 70, rim: 14, price: 4350, badge: 'أفضل قيمة', usage: 'اقتصادي', rating: 4, stock: 'متوفر' },
  { id: 't3', brand: 'Arroyo', model: 'Grand Sport 2', size: '205/55 R16', width: 205, profile: 55, rim: 16, price: 4950, usage: 'يومي', rating: 4, stock: 'متوفر' },
  { id: 't4', brand: 'Hankook', model: 'Kinergy Eco2', size: '195/65 R15', width: 195, profile: 65, rim: 15, price: 5100, badge: 'عرض', usage: 'اقتصادي', rating: 4, stock: 'متوفر' },
  { id: 't5', brand: 'Arroyo', model: 'Eco Pro', size: '185/65 R15', width: 185, profile: 65, rim: 15, price: 3950, badge: 'اقتصادي', usage: 'اقتصادي', rating: 4, stock: 'متوفر' },
  { id: 't6', brand: 'Hankook', model: 'Ventus Prime3', size: '205/55 R16', width: 205, profile: 55, rim: 16, price: 8200, usage: 'أداء', rating: 5, stock: 'كمية محدودة' },
  { id: 't7', brand: 'Atlander', model: 'AX-77', size: '195/60 R15', width: 195, profile: 60, rim: 15, price: 4250, badge: 'اقتصادي', usage: 'اقتصادي', rating: 4, stock: 'متوفر' },
  { id: 't8', brand: 'Apollo', model: 'Apterra HT2', size: '225/60 R17', width: 225, profile: 60, rim: 17, price: 7900, usage: 'SUV', rating: 4, stock: 'متوفر' },
  { id: 't9', brand: 'Atlander', model: 'Roverstar H/T', size: '215/60 R16', width: 215, profile: 60, rim: 16, price: 5850, usage: 'SUV', rating: 4, stock: 'متوفر' },
  { id: 't10', brand: 'Aries', model: 'A-One', size: '215/55 R17', width: 215, profile: 55, rim: 17, price: 6400, usage: 'أداء', rating: 4, stock: 'كمية محدودة' },
  { id: 't11', brand: 'Apollo', model: 'Apterra Cross', size: '215/60 R16', width: 215, profile: 60, rim: 16, price: 6900, usage: 'SUV', rating: 4, stock: 'متوفر' },
  { id: 't12', brand: 'Advance', model: 'GL-283 A/S', size: '185/70 R14', width: 185, profile: 70, rim: 14, price: 3150, badge: 'اقتصادي', usage: 'اقتصادي', rating: 3, stock: 'متوفر' },
];

export const BATTERIES: Battery[] = [
  { id: 'b1', brand: 'Acid Max', model: 'Maintenance Free', ah: 55, warrantyMonths: 12, price: 4200, badge: 'عرض', stock: 'متوفر' },
  { id: 'b2', brand: 'Aston', model: 'Power Plus', ah: 62, warrantyMonths: 18, price: 5400, badge: 'الأكثر مبيعًا', stock: 'متوفر' },
  { id: 'b3', brand: 'Maldini', model: 'Gold', ah: 70, warrantyMonths: 12, price: 6500, stock: 'متوفر' },
  { id: 'b4', brand: 'Jakar', model: 'Heavy Duty', ah: 74, warrantyMonths: 12, price: 7800, badge: 'أفضل قيمة', stock: 'كمية محدودة' },
  { id: 'b5', brand: 'Hankook', model: 'MF Series', ah: 60, warrantyMonths: 12, price: 5200, stock: 'متوفر' },
  { id: 'b6', brand: 'Steel', model: 'DIN 100', ah: 90, warrantyMonths: 12, price: 8900, stock: 'متوفر' },
];

export const SERVICES: Service[] = [
  { id: 's1', name: 'تغيير الإطارات', desc: 'تركيب إطارات جديدة مع فحص الضغط', duration: 'من 30 دقيقة', priceFrom: 200, icon: 'tire', mobile: true },
  { id: 's2', name: 'إصلاح الإطارات', desc: 'إصلاح البنشر والثقوب باحترافية', duration: 'من 20 دقيقة', priceFrom: 100, icon: 'repair', mobile: true },
  { id: 's3', name: 'ترصيص', desc: 'ترصيص إلكتروني للأربع عجلات', duration: 'من 40 دقيقة', priceFrom: 350, icon: 'balance', mobile: false },
  { id: 's4', name: 'ضبط زوايا', desc: 'ضبط زوايا العجلات بالكمبيوتر', duration: 'من 45 دقيقة', priceFrom: 400, icon: 'align', mobile: false },
  { id: 's5', name: 'تغيير البطارية', desc: 'نوصلك ونغير البطارية في مكانك', duration: 'من 30 دقيقة', priceFrom: 150, icon: 'battery', mobile: true },
  { id: 's6', name: 'فحص السيارة', desc: 'فحص شامل بالكمبيوتر قبل السفر', duration: 'من 30 دقيقة', priceFrom: 250, icon: 'inspect', mobile: true },
  { id: 's7', name: 'تغيير زيت', desc: 'زيوت MOTUL وMANNOL وBardahl أصلية مع الفلتر', duration: 'من 25 دقيقة', priceFrom: 550, icon: 'oil', mobile: false },
  { id: 's8', name: 'اشتراك وتشغيل', desc: 'عربيتك مش بتشتغل؟ نوصلك بسرعة', duration: 'من 20 دقيقة', priceFrom: 150, icon: 'bolt', mobile: true },
];

export interface CarModel {
  model: string;
  tireSize: string;
  batteryAh: number;
}

export interface CarMake {
  make: string;
  models: CarModel[];
}

export const CARS: CarMake[] = [
  { make: 'Hyundai', models: [
    { model: 'Accent', tireSize: '185/70 R14', batteryAh: 55 },
    { model: 'Verna', tireSize: '185/70 R14', batteryAh: 55 },
    { model: 'Elantra', tireSize: '205/55 R16', batteryAh: 62 },
    { model: 'Tucson', tireSize: '225/60 R17', batteryAh: 70 },
  ]},
  { make: 'Kia', models: [
    { model: 'Rio', tireSize: '185/70 R14', batteryAh: 55 },
    { model: 'Cerato', tireSize: '205/55 R16', batteryAh: 62 },
    { model: 'Sportage', tireSize: '225/60 R17', batteryAh: 70 },
  ]},
  { make: 'Chevrolet', models: [
    { model: 'Lanos', tireSize: '185/70 R14', batteryAh: 55 },
    { model: 'Aveo', tireSize: '185/70 R14', batteryAh: 55 },
    { model: 'Optra', tireSize: '195/60 R15', batteryAh: 62 },
  ]},
  { make: 'Nissan', models: [
    { model: 'Sunny', tireSize: '185/70 R14', batteryAh: 55 },
    { model: 'Sentra', tireSize: '195/60 R15', batteryAh: 62 },
    { model: 'Qashqai', tireSize: '215/60 R16', batteryAh: 70 },
  ]},
  { make: 'Toyota', models: [
    { model: 'Corolla', tireSize: '195/65 R15', batteryAh: 62 },
    { model: 'Yaris', tireSize: '185/65 R15', batteryAh: 55 },
  ]},
  { make: 'Renault', models: [
    { model: 'Logan', tireSize: '185/70 R14', batteryAh: 55 },
    { model: 'Megane', tireSize: '205/55 R16', batteryAh: 62 },
  ]},
  { make: 'Peugeot', models: [
    { model: '301', tireSize: '185/70 R14', batteryAh: 55 },
    { model: '2008', tireSize: '205/55 R16', batteryAh: 62 },
  ]},
  { make: 'Fiat', models: [
    { model: 'Siena', tireSize: '185/70 R14', batteryAh: 55 },
    { model: 'Tipo', tireSize: '195/65 R15', batteryAh: 62 },
  ]},
  { make: 'Skoda', models: [
    { model: 'Fabia', tireSize: '185/65 R15', batteryAh: 55 },
    { model: 'Octavia', tireSize: '205/55 R16', batteryAh: 62 },
  ]},
  { make: 'Suzuki', models: [
    { model: 'Swift', tireSize: '185/65 R15', batteryAh: 45 },
    { model: 'Dzire', tireSize: '185/70 R14', batteryAh: 45 },
  ]},
  { make: 'MG', models: [
    { model: 'MG5', tireSize: '205/55 R16', batteryAh: 62 },
    { model: 'ZS', tireSize: '215/55 R17', batteryAh: 70 },
  ]},
  { make: 'Chery', models: [
    { model: 'Arrizo 5', tireSize: '195/65 R15', batteryAh: 62 },
    { model: 'Tiggo 7', tireSize: '225/60 R17', batteryAh: 70 },
  ]},
];

export const TIRE_WIDTHS = [165, 175, 185, 195, 205, 215, 225, 235, 245];
export const TIRE_PROFILES = [45, 50, 55, 60, 65, 70, 75];
export const TIRE_RIMS = [13, 14, 15, 16, 17, 18];
export const YEARS = Array.from({ length: 26 }, (_, i) => 2026 - i);

export const BRANCHES: Branch[] = [
  { id: 'br1', gov: 'القاهرة', area: 'مدينة نصر', name: 'فرع مدينة نصر', address: '١٥ شارع عباس العقاد، مدينة نصر', hours: 'يوميًا 9 ص - 11 م', phone: '01001234567', services: ['إطارات', 'بطاريات', 'ترصيص', 'ضبط زوايا'] },
  { id: 'br2', gov: 'القاهرة', area: 'المعادي', name: 'فرع المعادي', address: '٢٨ شارع ٩، المعادي', hours: 'يوميًا 9 ص - 11 م', phone: '01002234567', services: ['إطارات', 'بطاريات', 'زيوت'] },
  { id: 'br3', gov: 'القاهرة', area: 'مصر الجديدة', name: 'فرع مصر الجديدة', address: '٤٠ شارع الميرغني، مصر الجديدة', hours: 'يوميًا 9 ص - 11 م', phone: '01003234567', services: ['إطارات', 'بطاريات', 'ترصيص'] },
  { id: 'br4', gov: 'الجيزة', area: 'المهندسين', name: 'فرع المهندسين', address: '١٢ شارع شهاب، المهندسين', hours: 'يوميًا 9 ص - 11 م', phone: '01004234567', services: ['إطارات', 'بطاريات'] },
  { id: 'br5', gov: 'الجيزة', area: 'أكتوبر', name: 'فرع ٦ أكتوبر', address: 'المحور المركزي، الحي الثاني، ٦ أكتوبر', hours: 'يوميًا 9 ص - 12 م', phone: '01005234567', services: ['إطارات', 'بطاريات', 'ترصيص', 'ضبط زوايا'] },
  { id: 'br6', gov: 'الإسكندرية', area: 'سموحة', name: 'فرع سموحة', address: '٧ شارع فيكتور عمانويل، سموحة', hours: 'يوميًا 9 ص - 11 م', phone: '01006234567', services: ['إطارات', 'بطاريات', 'زيوت'] },
  { id: 'br7', gov: 'الدقهلية', area: 'المنصورة', name: 'فرع المنصورة', address: 'شارع الجمهورية، المنصورة', hours: 'يوميًا 9 ص - 10 م', phone: '01007234567', services: ['إطارات', 'بطاريات'] },
  { id: 'br8', gov: 'الغربية', area: 'طنطا', name: 'فرع طنطا', address: 'شارع البحر، طنطا', hours: 'يوميًا 9 ص - 10 م', phone: '01008234567', services: ['إطارات', 'بطاريات'] },
];

export const GOVERNORATES = [...new Set(BRANCHES.map((b) => b.gov))];

export const REVIEWS = [
  { name: 'أحمد م.', stars: 5, text: 'طلبت ٤ إطارات أونلاين وركبوهم في الفرع في أقل من ساعة. السعر كان أحسن من اللي لقيته برا.', service: 'شراء وتركيب إطارات' },
  { name: 'منى س.', stars: 5, text: 'البطارية خلصت في الجراچ، كلمتهم واتساب وجالي الفني لحد البيت وغيرها في نص ساعة.', service: 'تغيير بطارية متنقل' },
  { name: 'كريم ع.', stars: 4, text: 'عملت ترصيص وضبط زوايا، الشغل نضيف والأسعار واضحة من الأول من غير مفاجآت.', service: 'ترصيص وضبط زوايا' },
  { name: 'هالة ر.', stars: 5, text: 'أول مرة أشتري كاوتش من غير وجع دماغ. دخلت مقاس عربيتي وظهرلي المناسب على طول.', service: 'محدد الإطارات' },
];

export const TIRE_BRANDS = [...new Set(TIRES.map((t) => t.brand))];
export const BRAND_STRIP = ['Apollo', 'Hankook', 'Arroyo', 'Atlander', 'Advance', 'Aries', 'Acid Max', 'Aston', 'Maldini', 'Jakar', 'Steel', 'MOTUL', 'MANNOL', 'Bardahl', 'RZ Oil'];

/** Governorates available for home shipping */
export const SHIPPING_GOVS = ['القاهرة', 'الجيزة', 'القليوبية', 'الإسكندرية', 'البحيرة', 'كفر الشيخ', 'الغربية', 'الدقهلية', 'الشرقية', 'المنوفية', 'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس', 'الفيوم', 'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'البحر الأحمر', 'مطروح'];
export const SHIPPING_FEE = 80;

export const IMG = {
  tire1: '/assets/tire1.jpg',
  tire2: '/assets/tire2.jpg',
  tire3: '/assets/tire3.jpg',
  battery: '/assets/battery.jpg',
  hero: '/assets/hero.jpg',
} as const;

export function tireImg(t: Tire): string {
  if (t.image) return t.image;
  const map: Record<Tire['usage'], string> = {
    يومي: IMG.tire1,
    اقتصادي: IMG.tire3,
    أداء: IMG.tire2,
    SUV: IMG.tire2,
  };
  return map[t.usage] ?? IMG.tire1;
}

export const WHATSAPP_URL = 'https://wa.me/201001234567';
export const PHONE_NUMBER = '١٦٢٣٤';
export const SOCIAL = {
  facebook: 'https://www.facebook.com/emadgadtyres',
  instagram: 'https://www.facebook.com/emadgadtyres',
  youtube: 'https://www.facebook.com/emadgadtyres',
};

export const TIME_SLOTS = ['١٠:٠٠ ص', '١٢:٠٠ م', '٢:٠٠ م', '٤:٠٠ م', '٦:٠٠ م', '٨:٠٠ م'];
/** API `HH:MM` values matching TIME_SLOTS by index */
export const TIME_SLOT_VALUES = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];

export function nextDays(n: number, lang: 'ar' | 'en' = 'ar'): { label: string; value: string }[] {
  const days: { label: string; value: string }[] = [];
  const locale = lang === 'ar' ? 'ar-EG' : 'en-GB';
  const fmtDay = new Intl.DateTimeFormat(locale, { weekday: 'long' });
  const fmtDate = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' });
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const date = fmtDate.format(d);
    days.push({
      label: i === 0
        ? (lang === 'ar' ? `النهاردة — ${date}` : `Today — ${date}`)
        : i === 1
          ? (lang === 'ar' ? `بكرة — ${date}` : `Tomorrow — ${date}`)
          : `${fmtDay.format(d)} — ${date}`,
      value: d.toISOString().slice(0, 10),
    });
  }
  return days;
}

export function formatEGP(n: number): string {
  return `${n.toLocaleString('ar-EG')} جنيه`;
}
