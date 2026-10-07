import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { BadgeCheck, Building2, Check, Clock, CreditCard, Gift, LogIn, MapPin, Phone, Sparkles, Truck, User, Wallet } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BRANCHES, SHIPPING_FEE } from '@/data';
import { useWhatsappUrl } from '@/hooks/use-social-media';
import { useAuth } from '@/auth';
import { useCart } from '@/cart';
import { itemDisplay, useLang } from '@/i18n';
import { useBranches } from '@/hooks/use-branches';
import { usePaymentMethods } from '@/hooks/use-payment-methods';
import { useEcomLoyalty } from '@/hooks/use-ecom-loyalty';
import { useDeliveryAreas } from '@/hooks/use-delivery-areas';
import { useDeliveryCharge } from '@/hooks/use-delivery-fee';
import { useOffers } from '@/hooks/use-offers';
import { useCreateEcomOrder } from '@/hooks/use-ecom-orders';
import { useEcomPaymentStatus, usePayEcomOrder } from '@/hooks/use-order-payment';
import { productPrice, useOfferProducts } from '@/hooks/use-apply-offer';
import type { CreateEcomOrderBody, EcomOrderModel, EcomPaymentInitModel, OfferModel } from '@/lib/api';
import { WhatsAppIcon } from '@/components/art';

const inputCls = 'w-full h-12 rounded-xl border-2 border-border bg-white dark:bg-[#1c1c1c] text-ink px-4 font-bold focus:outline-none focus:border-ink';

type Mode = 'branch' | 'shipping';
const OFFLINE_METHODS = ['pay_at_branch', 'cash_on_delivery'];

interface PlacedOrder {
  order: EcomOrderModel;
  paymentInit: EcomPaymentInitModel | null;
}

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const { t, isAr, num, fmt } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const appliedOfferId = (location.state as { offerId?: number } | null)?.offerId ?? null;
  const createOrder = useCreateEcomOrder();
  const payMutation = usePayEcomOrder();
  const waUrl = useWhatsappUrl();

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.mobile ?? '');
  const [mode, setMode] = useState<Mode>('branch');
  const [branchKey, setBranchKey] = useState('');
  const [areaId, setAreaId] = useState('');
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState<string>('pay_at_branch');
  const [offerId] = useState<number | null>(appliedOfferId);
  const [redeemOn, setRedeemOn] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── API data ──
  const branchesQuery = useBranches();
  const apiBranches = branchesQuery.data ?? [];
  const usingApiBranches = apiBranches.length > 0;
  const locationId = usingApiBranches && branchKey ? Number(branchKey) : undefined;
  const staticBranch = !usingApiBranches ? BRANCHES.find((b) => b.id === branchKey) : undefined;

  const isDelivery = mode === 'shipping';

  const { data: paymentMethods } = usePaymentMethods(1);
  const { data: loyalty } = useEcomLoyalty(!!user?.id);
  const { data: deliveryAreas } = useDeliveryAreas(isDelivery);
  const { data: offers } = useOffers({ business_id: 1, location_id: locationId });

  const { data: feeCalc } = useDeliveryCharge(
    {
      location_id: locationId,
      area_id: areaId ? Number(areaId) : undefined,
      order_amount: total,
    },
    isDelivery && (!!locationId || !!areaId),
  );

  const paymentStatus = useEcomPaymentStatus(placed?.paymentInit?.payment_id, !!placed?.paymentInit);

  // ── derived state ──
  const deliveryFee = !isDelivery ? 0 : Number(feeCalc?.delivery_charge ?? SHIPPING_FEE);

  const codEnabled = paymentMethods ? paymentMethods.cash_on_delivery : true;
  const gateways = paymentMethods?.digital_payment ? paymentMethods.gateways ?? [] : [];

  const cartQtyFor = (productId: number, variationId?: number | null) =>
    items
      .filter((i) => {
        const pid = i.productId ?? Number(i.id);
        if (pid !== productId) return false;
        return !variationId || !i.variationId || i.variationId === variationId;
      })
      .reduce((s, i) => s + i.qty, 0);

  const offerApplies = (o: OfferModel): boolean => {
    if (o.branches?.length && !(locationId && o.branches.some((b) => b.id === locationId))) {
      return false;
    }
    switch (o.trigger_type) {
      case 'buy_x_get_same':
      case 'buy_x_get_other':
        if (!o.trigger_product_id || cartQtyFor(o.trigger_product_id) < (o.min_trigger_quantity ?? 1)) {
          return false;
        }
        break;
      case 'combo':
        if (!o.combo_items?.length) return false;
        if (!o.combo_items.every((ci) => cartQtyFor(ci.product_id, ci.variation_id) >= ci.quantity)) {
          return false;
        }
        break;
      case 'order_total_threshold':
        break;
      default:
        return false;
    }
    return !(o.min_order_total && total < o.min_order_total);
  };

  const applicableOffers = (offers ?? []).filter(offerApplies);
  const selectedOffer = applicableOffers.find((o) => o.id === offerId) ?? null;

  // reward product prices — only needed to estimate buy_x_get_* gift value
  const isBuyXOffer =
    selectedOffer?.trigger_type === 'buy_x_get_same' || selectedOffer?.trigger_type === 'buy_x_get_other';
  const rewardProductIds = isBuyXOffer ? (selectedOffer?.rewards ?? []).map((r) => r.product_id) : [];
  const rewardQueries = useOfferProducts(rewardProductIds);
  const rewardPrices = new Map(rewardProductIds.map((pid, i) => [pid, productPrice(rewardQueries[i]?.data)]));

  // client-side estimate of the offer's effect — the server computes the real discount at order creation
  const offerEstimate = (() => {
    if (!selectedOffer) return 0;
    switch (selectedOffer.trigger_type) {
      case 'combo': {
        const base = (selectedOffer.combo_items ?? []).reduce((s, ci) => {
          const item = items.find(
            (i) =>
              (i.productId ?? Number(i.id)) === ci.product_id &&
              (!ci.variation_id || i.variationId === ci.variation_id),
          );
          return s + (item?.price ?? 0) * Number(ci.quantity);
        }, 0);
        const d = selectedOffer.combo_discount;
        return d ? Math.min(d.type === 'percentage' ? (base * Number(d.value)) / 100 : Number(d.value), base) : 0;
      }
      case 'order_total_threshold': {
        const d = selectedOffer.order_discount;
        return d ? Math.min(d.type === 'percentage' ? (total * Number(d.value)) / 100 : Number(d.value), total) : 0;
      }
      case 'buy_x_get_same':
      case 'buy_x_get_other': {
        const minQ = Number(selectedOffer.min_trigger_quantity ?? 1) || 1;
        const times = Math.floor(cartQtyFor(selectedOffer.trigger_product_id ?? -1) / minQ);
        return (
          times *
          (selectedOffer.rewards ?? []).reduce((s, r) => {
            const rp = (rewardPrices.get(r.product_id) ?? 0) * Number(r.quantity);
            if (r.reward_mode === 'free') return s + rp;
            const dv = Number(r.discount_value ?? 0);
            return s + (r.discount_type === 'percentage' ? (rp * dv) / 100 : Math.min(dv, rp));
          }, 0)
        );
      }
      default:
        return 0;
    }
  })();

  const redeemCfg = loyalty?.redeem;
  const maxRedeemPoints = Math.min(
    loyalty?.redeemable_points ?? 0,
    redeemCfg?.max_points && redeemCfg.max_points > 0 ? redeemCfg.max_points : Infinity,
  );
  const pointsToRedeem = redeemOn ? Math.min(Math.max(0, Math.floor(Number(redeemPoints) || 0)), maxRedeemPoints) : 0;
  const redeemOk =
    !redeemOn ||
    (pointsToRedeem > 0 &&
      pointsToRedeem <= maxRedeemPoints &&
      (!redeemCfg?.min_points || pointsToRedeem >= redeemCfg.min_points) &&
      (!redeemCfg?.min_order_total || total >= redeemCfg.min_order_total));
  const redeemEstimate = pointsToRedeem * Number(redeemCfg?.amount_per_point ?? 0);

  // discount descriptor from the offer definition (e.g. "20%" or a fixed amount) — shown next to its name
  const offerDiscountMeta =
    selectedOffer?.trigger_type === 'combo'
      ? selectedOffer.combo_discount
      : selectedOffer?.trigger_type === 'order_total_threshold'
        ? selectedOffer.order_discount
        : null;
  const offerDiscountLabel = offerDiscountMeta
    ? offerDiscountMeta.type === 'percentage'
      ? `${num(Number(offerDiscountMeta.value))}%`
      : fmt(Number(offerDiscountMeta.value))
    : null;

  const estimatedTotal = Math.max(0, total + deliveryFee - offerEstimate - redeemEstimate);
  const isOnlinePayment = !OFFLINE_METHODS.includes(payment);

  const pickMode = (m: Mode) => {
    setMode(m);
    setPayment(m === 'branch' ? 'pay_at_branch' : codEnabled ? 'cash_on_delivery' : (gateways[0]?.gateway ?? 'cash_on_delivery'));
  };

  // If COD gets disabled after methods load, fall back to the first gateway
  useEffect(() => {
    if (paymentMethods && payment === 'cash_on_delivery' && !codEnabled) {
      setPayment(gateways[0]?.gateway ?? 'pay_at_branch');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethods]);

  const paymentOk =
    payment === 'pay_at_branch'
      ? mode === 'branch'
      : payment === 'cash_on_delivery'
        ? isDelivery && codEnabled
        : gateways.some((g) => g.gateway === payment);

  const valid =
    !!user?.id &&
    paymentOk &&
    name.trim().length >= 2 &&
    phone.trim().length >= 10 &&
    redeemOk &&
    (mode === 'branch'
      ? !!branchKey
      : address.trim().length >= 8 && (!(deliveryAreas?.length) || !!areaId));

  const placeOrder = async () => {
    setSubmitError(null);
    if (!user?.id) {
      setSubmitError(t('سجّل دخولك الأول عشان تكمل الطلب'));
      return;
    }
    const products = items.map((i) => ({
      product_id: i.productId ?? Number(i.id),
      ...(i.variationId ? { variation_id: i.variationId } : {}),
      quantity: i.qty,
    }));
    if (products.some((p) => !Number.isFinite(p.product_id))) {
      setSubmitError(t('في منتجات في السلة مش متاحة للطلب أونلاين — امسحها وجرب تاني'));
      return;
    }

    const body: CreateEcomOrderBody = {
      contact_id: user.id,
      order_type: mode === 'branch' ? 'self_pickup' : 'delivery',
      payment_method: payment,
      products,
      order_note: orderNote.trim() || undefined,
      location_id: locationId,
      delivery_area_id: isDelivery && areaId ? Number(areaId) : undefined,
      delivery_address: isDelivery
        ? {
            name: name.trim(),
            mobile: phone.trim(),
            address_line_1: address.trim(),
            city: deliveryAreas?.find((a) => String(a.id) === areaId)?.area_name ?? '',
            state: deliveryAreas?.find((a) => String(a.id) === areaId)?.area_name ?? '',
            country: isAr ? 'مصر' : 'Egypt',
          }
        : undefined,
      offer_id: selectedOffer?.id,
      redeem_points: redeemOn && redeemOk && pointsToRedeem > 0 ? pointsToRedeem : undefined,
    };

    try {
      const order = await createOrder.mutateAsync(body);
      let paymentInit: EcomPaymentInitModel | null = null;
      if (isOnlinePayment && order?.id) {
        try {
          paymentInit = await payMutation.mutateAsync({
            id: order.id,
            gateway: payment,
            channel: 'web',
            callback_url: `${window.location.origin}/checkout`,
          });
        } catch {
          paymentInit = null;
        }
      }
      setPlaced({ order, paymentInit });
      clear();
      window.scrollTo(0, 0);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t('فشل تسجيل الطلب، برجاء المحاولة مرة أخرى'));
    }
  };

  // ── success screen ──
  if (placed) {
    const { order, paymentInit } = placed;
    const paid = paymentStatus.data?.is_paid ?? order.payment_status === 'paid';
    const paymentUrl = paymentInit?.payment_url;
    return (
      <div className="bg-paper min-h-[calc(100vh-80px)] w-full overflow-hidden">
        <div className="mx-auto max-w-xl px-4 sm:px-6 py-16 text-center">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand">
            <Check className="h-10 w-10 text-ink" />
          </span>
          <h1 className="mt-6 text-3xl sm:text-4xl font-black text-ink">{t('طلبك اتسجل بنجاح!')}</h1>
          <p className="mt-3 text-lg font-semibold text-ink-mute">
            {t('رقم الطلب:')} <span className="ltr font-black text-ink">{order.order_no}</span>
          </p>
          <div className="mt-6 rounded-2xl border-2 border-ink bg-white dark:bg-[#1c1c1c] p-6 text-start shadow-[0_8px_0_#f6c744] space-y-2 text-base font-bold text-ink">
            <p className="flex items-center gap-2">
              {mode === 'branch' ? <Building2 className="h-5 w-5 text-ink-mute" /> : <Truck className="h-5 w-5 text-ink-mute" />}
              {mode === 'branch'
                ? `${isAr ? 'التركيب في' : 'Fitting at'} ${order.location_name ?? t(staticBranch?.name ?? '')}`
                : `${t('شحن إلى')} ${order.delivery_area_name ?? address}`}
            </p>
            {order.delivery_datetime && (
              <p className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-ink-mute" />
                <span className="ltr">{order.delivery_datetime}</span>
              </p>
            )}
            {order.offer && (
              <p className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-ink-mute" />
                {t('العرض:')} {isAr ? order.offer.name_ar ?? order.offer.name : order.offer.name}
                {!!order.offer.discount && <span className="text-emerald-700 dark:text-emerald-400">−{fmt(order.offer.discount)}</span>}
              </p>
            )}
            {!!order.loyalty?.redeemed && (
              <p className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-ink-mute" />
                {t('نقاط مستبدلة:')} {num(order.loyalty.redeemed)} (−{fmt(order.loyalty.redeemed_amount)})
              </p>
            )}
            <p className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-ink-mute" />
              {t('الدفع:')} {payment === 'pay_at_branch' ? t('في الفرع') : payment === 'cash_on_delivery' ? t('عند الاستلام') : t('أونلاين')} — {t('الإجمالي')} {fmt(order.final_total)}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-ink-mute" /> <span className="ltr">{phone}</span>
            </p>
            <p className="flex items-center gap-2 border-t border-border pt-2 text-sm text-ink-mute">
              <BadgeCheck className="h-5 w-5 shrink-0" />
              {t('حالة الطلب: قيد الانتظار لحد ما نأكده')}
            </p>
          </div>

          {paymentInit && (
            <div className="mt-4 rounded-2xl border-2 border-ink bg-white dark:bg-[#1c1c1c] p-5 shadow-[0_8px_0_#f6c744]">
              {paid ? (
                <p className="flex items-center justify-center gap-2 text-lg font-black text-emerald-700 dark:text-emerald-400">
                  <Check className="h-6 w-6" /> {t('تم الدفع بنجاح')}
                </p>
              ) : (
                <>
                  <p className="text-base font-black text-ink">
                    {t('كمّل الدفع أونلاين')} {paymentInit.amount ? `— ${fmt(Number(paymentInit.amount))}` : ''}
                  </p>
                  {paymentUrl && (
                    <a
                      href={paymentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-coal text-brand px-6 h-12 font-black w-full"
                    >
                      <CreditCard className="h-5 w-5" /> {t('افتح صفحة الدفع')}
                    </a>
                  )}
                  <p className="mt-3 text-xs font-bold text-ink-mute">
                    {paymentStatus.isFetching || paymentStatus.isLoading
                      ? t('جاري انتظار تأكيد الدفع...')
                      : t('بنتحقق من الدفع تلقائيًا بعد ما تخلص')}
                  </p>
                </>
              )}
            </div>
          )}

          <p className="mt-5 text-base font-semibold text-ink-mute">
            {mode === 'shipping' ? t('هنكلمك على رقمك خلال دقائق لتأكيد الطلب وتفاصيل الشحن.') : t('هنكلمك على رقمك خلال دقائق لتأكيد الطلب.')}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href={waUrl} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] text-white px-6 h-12 font-black">
              <WhatsAppIcon className="h-5 w-5" /> {t('أكد أسرع على واتساب')}
            </a>
            <Link to="/" className="inline-flex items-center rounded-xl border-2 border-ink px-6 h-12 font-black text-ink hover:bg-coal hover:text-brand transition-colors">
              {t('ارجع للرئيسية')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-paper min-h-[calc(100vh-80px)] w-full overflow-hidden">
        <div className="mx-auto max-w-xl px-4 sm:px-6 py-24 text-center">
          <h1 className="text-3xl font-black text-ink">{t('مفيش حاجة في السلة')}</h1>
          <p className="mt-2 text-lg font-semibold text-ink-mute">{t('ضيف إطارات أو بطارية الأول وبعدين كمّل الطلب.')}</p>
          <button onClick={() => navigate('/tires')}
            className="mt-6 rounded-xl bg-coal text-brand px-6 h-12 font-black">
            {t('تصفح الإطارات')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-paper min-h-[calc(100vh-80px)] w-full overflow-x-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 lg:py-14">
        <h1 className="text-3xl sm:text-4xl font-black text-ink">{t('إتمام الطلب')}</h1>
        <p className="mt-2 text-lg font-semibold text-ink-mute">{t('الأسعار والخصومات بتحسب على السيرفر — هتشوف الإجمالي النهائي بعد التأكيد.')}</p>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-6 items-start">
          <div className="space-y-6 w-full min-w-0">
            {/* Contact */}
            <section className="rounded-2xl border-2 border-border bg-white dark:bg-[#1c1c1c] p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-xl font-black text-ink">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-coal text-brand text-sm font-black">{num(1)}</span>
                {t('بياناتك')}
              </h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-extrabold text-ink mb-1.5"><User className="inline h-4 w-4 me-1" />{t('الاسم')}</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('اسمك الكريم')} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-extrabold text-ink mb-1.5"><Phone className="inline h-4 w-4 me-1" />{t('رقم الموبايل')}</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01xxxxxxxxx" inputMode="tel" className={`${inputCls} ltr ${isAr ? 'text-right' : 'text-left'}`} />
                </div>
              </div>
            </section>

            {/* Fulfillment */}
            <section className="rounded-2xl border-2 border-border bg-white dark:bg-[#1c1c1c] p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-xl font-black text-ink">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-coal text-brand text-sm font-black">{num(2)}</span>
                {t('التركيب والاستلام')}
              </h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button type="button" onClick={() => pickMode('branch')}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 text-center transition-colors ${mode === 'branch' ? 'border-ink bg-brand-light dark:bg-brand/20 text-ink' : 'border-border bg-white dark:bg-[#1c1c1c] text-ink hover:border-ink'}`}>
                  <Building2 className="h-7 w-7" />
                  <span className="text-sm font-black">{t('تركيب في الفرع')}</span>
                </button>
                <button type="button" onClick={() => pickMode('shipping')}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 text-center transition-colors ${mode === 'shipping' ? 'border-ink bg-brand-light dark:bg-brand/20 text-ink' : 'border-border bg-white dark:bg-[#1c1c1c] text-ink hover:border-ink'}`}>
                  <Truck className="h-7 w-7" />
                  <span className="text-sm font-black">{t('شحن لحد البيت')}<span className="block text-xs font-bold text-ink-mute">+{fmt(feeCalc?.delivery_charge ?? SHIPPING_FEE)}</span></span>
                </button>
              </div>

              {mode === 'branch' && (
                <div className="mt-4">
                  <label className="block text-sm font-extrabold text-ink mb-1.5">{t('اختار الفرع')}</label>
                  <Select dir={isAr ? 'rtl' : 'ltr'} value={branchKey} onValueChange={setBranchKey}>
                    <SelectTrigger className="h-12 w-full rounded-xl border-2 border-border bg-white dark:bg-[#1c1c1c] text-ink font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {usingApiBranches
                        ? apiBranches.map((b) => (
                            <SelectItem key={b.id} value={String(b.id)} className="font-bold">
                              {b.name}{b.gov ? ` — ${t(b.gov)}` : ''}
                            </SelectItem>
                          ))
                        : BRANCHES.map((b) => (
                            <SelectItem key={b.id} value={b.id} className="font-bold">{t(b.name)} — {t(b.gov)}</SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                  {staticBranch && (
                    <p className="mt-3 flex items-center gap-2 rounded-xl bg-muted/70 px-4 py-3 text-sm font-bold text-ink">
                      <MapPin className="h-4 w-4 shrink-0 text-ink-mute" /> {t(staticBranch.address)} • {t(staticBranch.hours)}
                    </p>
                  )}
                </div>
              )}

              {isDelivery && (
                <div className="mt-4 space-y-4">
                  {!!deliveryAreas?.length && (
                    <div>
                      <label className="block text-sm font-extrabold text-ink mb-1.5">{t('منطقة التوصيل')}</label>
                      <Select dir={isAr ? 'rtl' : 'ltr'} value={areaId} onValueChange={setAreaId}>
                        <SelectTrigger className="h-12 w-full rounded-xl border-2 border-border bg-white dark:bg-[#1c1c1c] text-ink font-bold"><SelectValue placeholder={t('اختار منطقتك')} /></SelectTrigger>
                        <SelectContent>
                          {deliveryAreas.map((a) => (
                            <SelectItem key={a.id} value={String(a.id)} className="font-bold">
                              {a.area_name}{a.delivery_charge != null ? ` — ${fmt(Number(a.delivery_charge))}` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-extrabold text-ink mb-1.5">{t('عنوان الشحن بالتفصيل')}</label>
                    <input value={address} onChange={(e) => setAddress(e.target.value)}
                      placeholder={t('مثال: مدينة نصر، شارع عباس العقاد، عمارة ١٥، الدور التالت')} className={inputCls} />
                  </div>
                  <p className="flex items-center gap-2 rounded-xl bg-brand-light dark:bg-brand/20 px-4 py-3 text-sm font-bold text-ink">
                    <Truck className="h-4 w-4 shrink-0" /> {t('الشحن بيوصل خلال ٢-٤ أيام عمل — والدفع عند الاستلام')}
                  </p>
                </div>
              )}
            </section>

            {/* Loyalty */}
            {loyalty?.enabled && (loyalty.redeemable_points ?? 0) > 0 && (
              <section className="rounded-2xl border-2 border-border bg-white dark:bg-[#1c1c1c] p-5 sm:p-6">
                <h2 className="flex items-center gap-2 text-xl font-black text-ink">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-coal text-brand text-sm font-black">{num(3)}</span>
                  {t('نقاط الولاء')}
                </h2>
                <p className="mt-2 text-sm font-bold text-ink-mute">
                  {t('رصيدك:')} {num(loyalty.balance)} {t(loyalty.points_name ?? 'نقطة')} — {t('متاح للاستبدال:')} {num(loyalty.redeemable_points)} ({fmt(loyalty.redeemable_amount)})
                </p>
                <label className="mt-3 flex items-center gap-3 rounded-xl border-2 border-border p-4 cursor-pointer">
                  <input type="checkbox" checked={redeemOn} onChange={(e) => setRedeemOn(e.target.checked)} className="h-5 w-5 accent-[#f6c744]" />
                  <span className="text-sm font-black text-ink">{t('استخدم نقاطي في الطلب ده')}</span>
                </label>
                {redeemOn && (
                  <div className="mt-3">
                    <input
                      type="number"
                      min={redeemCfg?.min_points ?? 1}
                      max={maxRedeemPoints}
                      value={redeemPoints}
                      onChange={(e) => setRedeemPoints(e.target.value)}
                      placeholder={t('عدد النقاط')}
                      className={`${inputCls} ltr ${isAr ? 'text-right' : 'text-left'}`}
                    />
                    <p className="mt-2 text-xs font-bold text-ink-mute">
                      {redeemCfg?.min_points ? `${t('الحد الأدنى')} ${num(redeemCfg.min_points)} ${t('نقطة')} • ` : ''}
                      {redeemCfg?.max_points ? `${t('الحد الأقصى')} ${num(redeemCfg.max_points)} ${t('نقطة')} • ` : ''}
                      {t('خصم تقديري:')} {fmt(redeemEstimate)}
                    </p>
                    {!redeemOk && (
                      <p className="mt-2 text-xs font-bold text-red-700">
                        {redeemCfg?.min_order_total && total < redeemCfg.min_order_total
                          ? `${t('أقل إجمالي للاستبدال:')} ${fmt(redeemCfg.min_order_total)}`
                          : t('عدد النقاط خارج الحدود المسموحة')}
                      </p>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* Payment */}
            <section className="rounded-2xl border-2 border-border bg-white dark:bg-[#1c1c1c] p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-xl font-black text-ink">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-coal text-brand text-sm font-black">{num(4)}</span>
                {t('طريقة الدفع')}
              </h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mode === 'branch' && (
                  <button type="button" onClick={() => setPayment('pay_at_branch')}
                    className={`flex items-center gap-3 rounded-xl border-2 p-4 text-start transition-colors ${payment === 'pay_at_branch' ? 'border-ink bg-brand-light dark:bg-brand/20 text-ink' : 'border-border bg-white dark:bg-[#1c1c1c] text-ink hover:border-ink'}`}>
                    <Wallet className="h-6 w-6 shrink-0" />
                    <span>
                      <span className="block text-sm font-black">{t('الدفع في الفرع')}</span>
                      <span className="block text-xs font-bold text-ink-mute">{t('كاش أو بطاقة')}</span>
                    </span>
                  </button>
                )}
                {isDelivery && codEnabled && (
                  <button type="button" onClick={() => setPayment('cash_on_delivery')}
                    className={`flex items-center gap-3 rounded-xl border-2 p-4 text-start transition-colors ${payment === 'cash_on_delivery' ? 'border-ink bg-brand-light dark:bg-brand/20 text-ink' : 'border-border bg-white dark:bg-[#1c1c1c] text-ink hover:border-ink'}`}>
                    <Truck className="h-6 w-6 shrink-0" />
                    <span>
                      <span className="block text-sm font-black">{t('عند الاستلام')}</span>
                      <span className="block text-xs font-bold text-ink-mute">{t('للشحن')}</span>
                    </span>
                  </button>
                )}
                {gateways.map((g) => (
                  <button key={g.gateway} type="button" onClick={() => setPayment(g.gateway)}
                    className={`flex items-center gap-3 rounded-xl border-2 p-4 text-start transition-colors ${payment === g.gateway ? 'border-ink bg-brand-light dark:bg-brand/20 text-ink' : 'border-border bg-white dark:bg-[#1c1c1c] text-ink hover:border-ink'}`}>
                    {g.gateway_image ? (
                      <img src={g.gateway_image} alt={g.gateway_title} loading="lazy" className="h-6 w-10 object-contain shrink-0" />
                    ) : (
                      <CreditCard className="h-6 w-6 shrink-0" />
                    )}
                    <span>
                      <span className="block text-sm font-black">{g.gateway_title}</span>
                      <span className="block text-xs font-bold text-ink-mute">{t('دفع أونلاين')}</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Order note */}
            <section className="rounded-2xl border-2 border-border bg-white dark:bg-[#1c1c1c] p-5 sm:p-6">
              <h2 className="text-xl font-black text-ink">{t('ملاحظات الطلب')}</h2>
              <input
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder={t('أي تعليمات إضافية (اختياري)')}
                className={`${inputCls} mt-3`}
              />
            </section>
          </div>

          {/* Summary */}
          <aside className="rounded-2xl border-2 border-ink bg-white dark:bg-[#1c1c1c] p-5 shadow-[0_8px_0_#f6c744] lg:sticky lg:top-24 w-full min-w-0">
            <h2 className="text-xl font-black text-ink">{t('ملخص الطلب')}</h2>
            <ul className="mt-4 space-y-2">
              {items.map((i) => {
                const d = itemDisplay(i.id, i.title, i.subtitle, t, num);
                return (
                  <li key={i.id} className="flex justify-between gap-2 text-sm font-bold text-ink">
                    <span className="truncate">{d.title} × {num(i.qty)}</span>
                    <span className="shrink-0">{fmt(i.price * i.qty)}</span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 space-y-2 border-t border-border pt-3 text-sm font-bold text-ink">
              <div className="flex justify-between">
                <span className="text-ink-mute">{t('المجموع')}</span>
                <span>{fmt(total)}</span>
              </div>
              {isDelivery && (
                <div className="flex justify-between">
                  <span className="text-ink-mute">{t('التوصيل')}</span>
                  <span>{deliveryFee === 0 ? t('مجاني') : fmt(deliveryFee)}{!feeCalc && ` (${t('تقديري')})`}</span>
                </div>
              )}
              {selectedOffer && (
                <div className="flex justify-between gap-2">
                  <span className="text-ink-mute truncate">
                    {t('خصم العرض')} — {isAr ? selectedOffer.name_ar || selectedOffer.name : selectedOffer.name}
                    {offerDiscountLabel && ` (${offerDiscountLabel})`}
                  </span>
                  <span className="shrink-0 text-emerald-700 dark:text-emerald-400">
                    {offerEstimate > 0 ? `−${fmt(offerEstimate)}` : t('هدية مجانية')}
                  </span>
                </div>
              )}
              {pointsToRedeem > 0 && redeemEstimate > 0 && (
                <div className="flex justify-between">
                  <span className="text-ink-mute">{t('خصم النقاط')}</span>
                  <span className="text-emerald-700 dark:text-emerald-400">−{fmt(redeemEstimate)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-black pt-1">
                <span>{t('الإجمالي')}</span>
                <span>{fmt(estimatedTotal)}</span>
              </div>
            </div>

            {!user && (
              <div className="mt-4 rounded-xl border-2 border-dashed border-ink bg-brand-light dark:bg-brand/20 p-4 text-center">
                <p className="text-sm font-black text-ink">{t('سجّل دخولك الأول عشان تكمل الطلب')}</p>
                <div className="mt-3 flex justify-center gap-2">
                  <Link to="/login" className="inline-flex items-center gap-1.5 rounded-xl bg-coal text-brand px-5 h-11 font-black">
                    <LogIn className="h-4 w-4" /> {t('سجّل دخول')}
                  </Link>
                  <Link to="/register" className="inline-flex items-center rounded-xl border-2 border-ink px-5 h-11 font-black text-ink">
                    {t('سجّل جديد')}
                  </Link>
                </div>
              </div>
            )}

            {submitError && (
              <p className="mt-3 rounded-xl bg-red-50 p-3 text-center text-xs font-bold text-red-700">
                {submitError}
              </p>
            )}
            <button
              type="button"
              onClick={placeOrder}
              disabled={!valid || createOrder.isPending || payMutation.isPending}
              className="mt-5 w-full rounded-xl bg-brand text-coal h-12 text-lg font-black border-2 border-coal shadow-[0_4px_0_#191919] hover:translate-y-[2px] hover:shadow-[0_2px_0_#191919] disabled:opacity-40 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed transition-all"
            >
              {createOrder.isPending || payMutation.isPending ? t('جاري تأكيد الطلب...') : t('تأكيد الطلب')}
            </button>
            {!valid && (
              <p className="mt-2 text-center text-xs font-bold text-ink-mute">
                {!user ? t('التسجيل مطلوب عشان ننشئ الطلب على حسابك') : mode === 'shipping' ? t('كمل بياناتك وعنوان الشحن عشان تأكد الطلب') : t('كمل البيانات والميعاد عشان تأكد الطلب')}
              </p>
            )}
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-ink-mute">
              <BadgeCheck className="h-4 w-4" /> {t('بنكلمك للتأكيد قبل أي خصم أو تركيب')}
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
