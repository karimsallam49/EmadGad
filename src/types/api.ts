// API Response DTOs based on HUP Application API Documentation

// ==================== Auth Models ====================

export interface CheckPhoneResultModel {
  userFound: boolean;
  result: string;
  code: string;
  name: string;
  isSoftDeleted?: boolean;
  userId?: number;
  message?: string;
}

export interface AuthUserModel {
  id: number;
  name: string;
  email: string;
  mobile: string;
  token?: string;
}

export interface SocialAuthResponseModel {
  success?: boolean;
  /** If present the user is logged in regardless of other flags */
  token?: string | null;
  phone_exist?: boolean;
  is_new_user?: boolean;
  is_soft_deleted?: boolean;
  user_id?: number | null;
  action?: string;
  message?: string;
  phone_already_linked?: boolean;
  existing_user?: { id: number; name?: string; phone?: string };
  pending_social_user?: { name?: string; email?: string };
  user?: AuthUserModel & { phone?: string; mobile?: string };
}

// ==================== Customer Models ====================

export interface CustomerCarModel {
  id: number;
  model: string;
  brand_name?: string | null;
  car_brand?: string | null;
  make?: string | null;
  vin_model_code: string;
  device: string;
  car_logo: string | null;
  car_image: string | null;
  color: string;
  plate_number: string;
  manufacturing_year: string;
  chassis_number: string;
  car_type: string;
  motor_cc: string | null;
  model_image: string | null;
  tax: string | null;
}

export interface CustomerInfoModel {
  id: number;
  first_name?: string;
  last_name?: string;
  name?: string;
  mobile: string;
  cars: CustomerCarModel[];
}

export interface JobOrderModel {
  id: number;
  model: string;
  jobSheetNo: string;
  brand: string;
  color: string;
  plateNumber: string;
  manufacturingYear: string;
  workshop: string;
  location: string;
}

export interface BookingModel {
  id: number;
  jobSheetNo: string;
  bookingStatus: string;
  color: string;
  plateNumber: string;
  brand: string;
  model: string;
  service: string;
  bookingNote: string;
  bookingStart: string;
  location: string;
}

// ==================== Job Order Models ====================

export interface JobOrderCarInfoModel {
  plateNumber?: string;
  brand?: string;
  model?: string;
  year?: string;
  color?: string;
}

export interface JobOrderSparePartModel {
  id?: number;
  name?: string;
  quantity?: number;
  price?: number;
}

export interface JobOrderStatusModel {
  status?: string;
  date?: string;
}

export interface JobOrderDetailsResponseModel {
  jobOrder?: JobOrderModel;
  carInfo?: JobOrderCarInfoModel;
  spareParts?: JobOrderSparePartModel[];
  status?: JobOrderStatusModel;
}

// ==================== Car Market Models ====================

export interface VehicleModel {
  id: number;
  make: string;
  modelName: string;
  model_name?: string;
  year: number;
  trimLevel: string | null;
  bodyType: string;
  color: string;
  mileageKm: number;
  mileage_km?: number;
  listingPrice: string;
  listing_price?: string;
  currency: string;
  locationCity: string;
  location_city?: string;
  isPremium: boolean;
  is_premium?: boolean;
  isFeatured: boolean;
  is_featured?: boolean;
  viewCount: number;
  favoritesCount: number;
  inquiriesCount: number;
  isFavorited: boolean;
  is_favorited?: boolean;
  primaryImageUrl?: string;
  primary_image?: {
    id: number;
    vehicle_id: number;
    file_path: string;
  };
  transmission?: string;
  fuelType?: string;
  engineCapacityCc?: number;
}

export interface VehicleMediaModel {
  id?: number;
  url?: string;
  type?: string;
}

export interface VehicleSellerModel {
  id?: number;
  name?: string;
  phone?: string;
  location?: string;
}

export interface VehicleDetailsModel {
  id: number;
  make: string;
  modelName: string;
  year: number;
  trimLevel: string;
  bodyType: string;
  color: string;
  mileageKm: number;
  engineCapacityCc: number;
  cylinderCount: number;
  fuelType: string;
  transmission: string;
  condition: string;
  factoryPaint: boolean;
  importedSpecs: boolean;
  listingPrice: string;
  minPrice: string;
  currency: string;
  description: string;
  conditionNotes: string;
  locationCity: string;
  locationArea: string;
  viewCount: number;
  favoritesCount: number;
  inquiriesCount: number;
  isPremium: boolean;
  isFeatured: boolean;
  isFavorited: boolean;
  media: VehicleMediaModel[];
  seller?: VehicleSellerModel;
}

export interface BrandModel {
  id: number;
  name: string;
  image?: string;
  logo?: string;
  features: number;
}

export interface CarModelModel {
  id: number;
  name: string;
  brandId: number;
}

// ==================== Service Models ====================

export interface ServiceModel {
  id: number;
  name: string;
  mobile?: boolean;
  duration?: string;
  priceFrom?: number;
  icon?: string;
}

// ==================== Branch Models ====================

export interface BranchModel {
  id: number;
  name: string;
  isCarStation?: number;
  address?: string;
  gov?: string;
  hours?: string;
  phone?: string;
  area?: string;
}

// ==================== About Us Models ====================

export interface AboutUsModel {
  aboutUs: string;
}

// ==================== Blog Models ====================

export interface BlogPostModel {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  blogDate: string;
}

// ==================== E-Commerce Blogs ====================

export interface BlogSeo {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  robots?: string;
  og?: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
    site_name?: string;
    locale?: string;
    locale_alternate?: string;
  };
  twitter?: {
    card?: string;
    title?: string;
    description?: string;
    image?: string;
  };
  article?: {
    published_time?: string;
    modified_time?: string;
    author?: string;
    section?: string;
  };
  structured_data?: Record<string, unknown>;
}

export interface EcomBlogPostModel {
  id: number;
  title: string;
  title_ar?: string | null;
  slug?: string | null;
  image?: string | null;
  image_url?: string | null;
  blog_date?: string | null;
  excerpt?: string | null;
  excerpt_ar?: string | null;
  content?: string | null;
  content_ar?: string | null;
  category?: { id: number; name: string } | null;
  sub_category?: { id: number; name: string } | null;
  seo?: BlogSeo | null;
  seo_ar?: BlogSeo | null;
}

// ==================== Location Models ====================

export interface BusinessLocationModel {
  id: number;
  name: string;
  landmark?: string;
  country: string;
  state: string;
  city: string;
  mobile: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  working_hours?: string;
  phone?: string;
}

export interface WebsiteSettingsModel {
  logo?: string | null;
  hero_section_image?: string | null;
  branch_image?: string | null;
  icon?: string | null;
  title?: string | null;
  subtitle?: string | null;
  inner_page_title?: string | null;
  is_car_service: boolean;
  is_visible?: boolean;
  is_master?: boolean;
  master_name?: string | null;
  master_name_ar?: string | null;
  master_branch_ids?: number[];
  latitude?: number | null;
  longitude?: number | null;
  coverage?: number | null;
  address?: string | null;
  title_ar?: string | null;
  subtitle_ar?: string | null;
  inner_page_title_ar?: string | null;
}

export interface BusinessLocationWithWebsiteSettingsModel {
  id: number;
  name: string;
  latitude?: number | null;
  longitude?: number | null;
  coverage?: number | null;
  address?: string | null;
  website_settings: WebsiteSettingsModel | null;
}

// ==================== Spare Parts Models ====================

export interface ProductCompatibility {
  brand: string;
  model: string;
  fromYear?: number;
  toYear?: number;
  label: string;
}

export interface SpareProductModel {
  id: number;
  name: string;
  sku: string;
  qtyAvailable: number;
  defaultSellPrice: number;
  brandId?: number;
  brandName?: string;
  categoryId?: number;
  categoryName?: string;
  subCategoryId?: number;
  subCategoryName?: string;
  compatibility: ProductCompatibility[];
  imageUrl?: string;
  image?: string;
  category?: string;
  price?: number;
}

export interface EcomProductInfiniteModel {
  id: number;
  name: string;
  sku: string;
  variation_id: number;
  default_sell_price: number;
  discount?: number | string;
  discount_type?: 'percentage' | 'fixed' | null;
  discounted_price?: number | string;
  qty_available?: number;
  brand_id?: number;
  brand_name?: string;
  brand_jobsheet_photo?: string | null;
  category_id?: number;
  sub_category_id?: number | null;
  category_id_master?: number[];
  description?: string;
  image_url?: string;
  images?: string[];
  variation?: {
    id: number;
    name: string;
    sub_sku: string;
    default_purchase_price: number;
    dpp_inc_tax: number;
    profit_percent: number;
    default_sell_price: number;
    sell_price_inc_tax: number;
  };
}

export interface TaxonomyCategoryModel {
  id: number;
  name: string;
  type?: string;
  parentId?: number;
}

// ==================== Loyalty Points Models ====================

export interface LoyaltyPointsData {
  totalPoints: number;
  redeemablePoints: number;
  redeemableAmount: number;
  pointsUsed: number;
  pointsExpired: number;
  enableRp: boolean;
  rpName?: string;
  minRedeemPoint?: number;
  maxRedeemPoint?: number;
  amountPerPoint: string;
  minOrderTotalForRedeem: string;
}

export interface LoyaltyPointsModel {
  success: boolean;
  data: LoyaltyPointsData;
}

// ==================== Invoice Models ====================

export interface SellLineModel {
  id?: number;
  productId?: number;
  name?: string;
  quantity?: number;
  price?: number;
  total?: number;
}

export interface InvoiceContactModel {
  id?: number;
  name?: string;
  mobile?: string;
  email?: string;
}

export interface SellInvoiceModel {
  id: number;
  businessId: number;
  locationId: number;
  type: string;
  contactId: number;
  invoiceNo: string;
  shippingDetails?: string;
  shippingAddress?: string;
  shippingStatus?: string;
  deliveredTo?: string;
  discountType: string;
  discountAmount: number;
  totalBeforeTax: number;
  taxAmount: number;
  status: string;
  paymentStatus: string;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
  invoiceToken: string;
  finalTotal: number;
  roundOffAmount: number;
  invoiceUrl: string;
  paymentLink: string;
  sellLines: SellLineModel[];
  contact?: InvoiceContactModel;
}

export interface SellInvoicesResponseModel {
  data?: SellInvoiceModel[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
}

// ==================== Job Estimator Models ====================

export interface JobEstimatorModel {
  id: number;
  estimateNo: string;
  contactId: number;
  customerName: string;
  deviceId: number;
  model: string;
  brand: string;
  businessId: number;
  locationId: number;
  locationName: string;
  createdBy: number;
  serviceTypeId: number;
  estimatorStatus: string;
  color?: string;
  plateNumber?: string;
  manufacturingYear?: string;
  vehicleDetails?: string;
  sendSms: number;
  sentToCustomerAt?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== Maintenance Notification Models ====================

export interface MaintenanceNotificationPayload {
  noteId?: number;
  jobSheetId?: number;
  jobSheetNo?: string;
  action?: string;
  productId?: number;
  quantity?: number;
  price?: string;
}

export interface MaintenanceNotificationModel {
  id: string;
  type: string;
  data?: MaintenanceNotificationPayload;
  readAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== Rescue/Pickup Models ====================

export interface PickupRequestModel {
  contactId?: number;
  locationId?: number;
  address?: string;
  phone?: string;
  vehicleDetails?: string;
  pickupTime?: string;
}

export interface PickupRequestResponseModel {
  success?: boolean;
  message?: string;
  data?: any;
}

// ==================== Offers ====================

export interface OfferVideoModel {
  url: string;
  type: 'file' | 'link';
}

export interface OfferBranchModel {
  id: number;
  name: string;
}

export interface OfferRewardModel {
  id: number;
  product_id: number;
  product_name: string;
  variation_id: number;
  variation_name: string;
  quantity: number;
  reward_mode: 'free' | 'discount';
  discount_type?: 'percentage' | 'fixed' | null;
  discount_value?: number | null;
}

export interface OfferComboItemModel {
  product_id: number;
  product_name?: string | null;
  variation_id: number;
  variation_name?: string | null;
  quantity: number;
  /** nested relations — present on the raw GET /offers/{id} model */
  product?: {
    id?: number;
    name?: string;
    image_url?: string | null;
    image?: string | null;
    default_sell_price?: number | string;
    sell_price?: number | string;
    price?: number | string;
  } | null;
  variation?: {
    id?: number;
    name?: string;
    sell_price_inc_tax?: number | string;
    default_sell_price?: number | string;
  } | null;
}

export interface OfferComboDiscountModel {
  type: 'percentage' | 'fixed';
  value: number;
}

export interface OfferModel {
  id: number;
  name: string;
  name_ar?: string | null;
  description?: string | null;
  description_ar?: string | null;
  media_type?: 'image' | 'video' | 'link' | null;
  media_en?: string | null;
  media_ar?: string | null;
  image_en?: string | null;
  image_ar?: string | null;
  video_en?: string | OfferVideoModel | null;
  video_ar?: string | OfferVideoModel | null;
  trigger_type?: string | null;
  trigger_product_id?: number | null;
  min_trigger_quantity?: number | null;
  min_order_total?: number | null;
  combo_discount?: OfferComboDiscountModel | null;
  order_discount?: OfferComboDiscountModel | null;
  allow_reward_choice?: boolean;
  priority?: number;
  starts_at?: string | null;
  ends_at?: string | null;
  max_uses?: number | null;
  used_count?: number;
  branches?: OfferBranchModel[];
  combo_items?: OfferComboItemModel[];
  rewards?: OfferRewardModel[];
}

/** Raw offer model returned by GET /offers/{id} — differs from the list resource:
 *  media fields are raw storage paths, branches are pivot rows with nested location,
 *  discounts live in *_type/*_value columns instead of combo_discount/order_discount */
export interface OfferRawBranchModel {
  id: number;
  offer_id: number;
  location_id: number;
  location?: { id: number; name: string } | null;
}

export interface OfferRawModel {
  id: number;
  business_id?: number;
  name: string;
  name_ar?: string | null;
  description?: string | null;
  description_ar?: string | null;
  media_type?: 'image' | 'video' | 'link' | null;
  media_en?: string | null;
  media_ar?: string | null;
  image_en?: string | null;
  image_ar?: string | null;
  video_en?: string | OfferVideoModel | null;
  video_ar?: string | OfferVideoModel | null;
  trigger_type?: string | null;
  trigger_product_id?: number | null;
  min_trigger_quantity?: number | null;
  min_order_total?: number | null;
  combo_discount_type?: 'fixed' | 'percentage' | null;
  combo_discount_value?: string | null;
  order_discount_type?: 'fixed' | 'percentage' | null;
  order_discount_value?: string | null;
  allow_reward_choice?: boolean;
  priority?: number;
  is_active?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  max_uses?: number | null;
  used_count?: number;
  branches?: OfferRawBranchModel[];
  combo_items?: OfferComboItemModel[];
  rewards?: OfferRewardModel[];
}

// ==================== Taxonomy / Category Models ====================

export interface CategoryLevelItemModel {
  id: number;
  name: string;
  parent_id?: number;
}

export interface CategoryLevelNameModel {
  level_id: number;
  level: number;
  name: string;
  items: CategoryLevelItemModel[];
}

export interface CategoryItemsNextLevelResponse {
  success: boolean;
  item: CategoryLevelItemModel;
  level: CategoryLevelNameModel;
  items: CategoryLevelItemModel[];
}

export interface TaxonomyModel {
  id: number;
  name: string;
  short_code?: string | null;
  vin_category_code?: string | null;
  parent_id: number;
  level: number;
  infinite_levels: number;
  category_type: string;
  description?: string | null;
  slug?: string | null;
  features?: string | null;
  logo?: string | null;
  car_image?: string | null;
  jobsheet_photo?: string | null;
  tax?: string | null;
  is_ecom: number;
  country_of_origin?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  business_id: number;
  created_by: number;
  sub_categories: TaxonomyModel[];
  category_level_names?: CategoryLevelNameModel[];
}

// ==================== Social Media Models ====================

export interface SocialMediaModel {
  id: number;
  name: string;
  icon_url?: string | null;
  link: string;
}

// ==================== Chat / Notify-me / Notifications ====================

export interface ChatMessageModel {
  id: number;
  message?: string | null;
  image_url?: string | null;
  sender_type: 'customer' | 'admin' | string;
  created_at?: string;
}

export interface NotifyMeAlertModel {
  id: number;
  product_id: number;
  variation_id?: number;
  product_name?: string;
  product_image?: string | null;
  created_at?: string;
}

export interface UserNotificationModel {
  id: number;
  title: string;
  body?: string;
  type?: string;
  reference_id?: number;
  is_read: boolean;
  created_at?: string;
}

export interface UserNotificationsResult {
  data: UserNotificationModel[];
  meta?: { current_page?: number; last_page?: number; per_page?: number; total?: number };
}

// ==================== E-Commerce Checkout Models ====================

export interface EcomOrderProductInput {
  product_id: number;
  variation_id?: number;
  quantity: number;
  note?: string;
}

export interface EcomDeliveryAddress {
  name: string;
  mobile: string;
  address_line_1: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string | null;
}

export type EcomOrderType = 'delivery' | 'take_away' | 'self_pickup';

export interface CreateEcomOrderBody {
  contact_id: number;
  order_type?: EcomOrderType;
  payment_method?: string;
  order_note?: string;
  products: EcomOrderProductInput[];
  location_id?: number;
  delivery_area_id?: number;
  distance?: number;
  shipping_latitude?: number;
  shipping_longitude?: number;
  delivery_date?: string;
  delivery_time?: string;
  delivery_address?: EcomDeliveryAddress;
  discount_amount?: number;
  discount_type?: 'fixed' | 'percentage';
  offer_id?: number;
  offer_reward_id?: number;
  redeem_points?: number;
  transaction_reference?: string;
}

export interface EcomOrderItemModel {
  id: number;
  product_id: number;
  product_name: string;
  product_image?: string | null;
  variation_id?: number | null;
  variation_name?: string | null;
  quantity: number;
  unit_price: number;
  discount_on_product?: number;
  discount_type?: 'fixed' | 'percentage';
  line_total: number;
  is_offer_reward?: boolean;
  note?: string | null;
}

export interface EcomOrderOfferInfo {
  id: number;
  name: string;
  name_ar?: string | null;
  type?: string | null;
  discount?: number;
}

export interface EcomOrderLoyaltyInfo {
  redeemed: number;
  redeemed_amount: number;
  earned: number;
}

export interface EcomOrderHistoryEntry {
  id?: number;
  status?: string;
  note?: string | null;
  created_at?: string;
}

export interface EcomOrderModel {
  id: number;
  order_no: string;
  order_status: string;
  payment_status: string;
  payment_method?: string | null;
  order_type: string;
  location_id?: number | null;
  location_name?: string | null;
  order_amount: number;
  discount_amount?: number;
  discount_type?: 'fixed' | 'percentage';
  offer?: EcomOrderOfferInfo | null;
  delivery_charge?: number;
  loyalty?: EcomOrderLoyaltyInfo | null;
  final_total: number;
  delivery_address?: EcomDeliveryAddress | null;
  delivery_area_id?: number | null;
  delivery_area_name?: string | null;
  shipping_latitude?: number | null;
  shipping_longitude?: number | null;
  delivery_datetime?: string | null;
  order_note?: string | null;
  transaction_id?: number | null;
  invoice_no?: string | null;
  created_at?: string;
  items?: EcomOrderItemModel[];
  histories?: EcomOrderHistoryEntry[];
}

export interface EcomLoyaltyModel {
  enabled: boolean;
  points_name?: string;
  contact_id?: number;
  balance: number;
  redeemable_points: number;
  redeemable_amount: number;
  earn?: {
    amount_per_point?: number;
    min_order_total?: number;
    max_points_per_order?: number;
  };
  redeem?: {
    amount_per_point?: number;
    min_order_total?: number;
    min_points?: number;
    max_points?: number;
  };
  expiry?: { period?: number; type?: string };
}

export interface EcomPaymentGatewayModel {
  gateway: string;
  gateway_title: string;
  gateway_image?: string | null;
}

export interface EcomPaymentMethodsModel {
  cash_on_delivery: boolean;
  digital_payment: boolean;
  offline_payment?: boolean;
  gateways?: EcomPaymentGatewayModel[];
}

/** Custom payment methods configured by the admin in website-settings (Aman, Vodafone Cash, InstaPay…) */
export interface AvailablePaymentMethodModel {
  id: number;
  name_ar?: string;
  name_en?: string;
  name?: string;
  image?: string | null;
}

export interface DeliveryAreaModel {
  id: number;
  area_name: string;
  delivery_charge?: number;
}

export interface DeliveryChargeSetupModel {
  delivery_charge_type?: 'area' | 'distance' | 'fixed' | string;
  delivery_charge_per_kilometer?: number;
  minimum_delivery_charge?: number;
  minimum_distance_for_free_delivery?: number;
  fixed_delivery_charge?: number;
  free_delivery_over_status?: number | boolean;
  free_delivery_over_amount?: number;
}

export interface DeliveryFeeConfigModel {
  location_id?: number | null;
  location_name?: string | null;
  general_areas?: DeliveryAreaModel[];
  delivery_charge_setup?: DeliveryChargeSetupModel | null;
  delivery_charge_by_area?: DeliveryAreaModel[];
}

export interface EcomPayOrderBody {
  gateway?: string;
  callback_url?: string;
  channel?: 'web' | 'sdk';
}

export interface EcomPaymentInitModel {
  payment_id: number;
  payment_url?: string;
  amount?: number;
  currency?: string;
  [key: string]: unknown;
}

export interface EcomPaymentStatusModel {
  payment_id: number;
  is_paid: boolean;
  order_id?: number;
  order_status?: string;
  payment_status?: string;
}

export interface EcomOrderMessageModel {
  id: number;
  order_id?: number;
  sender_type?: 'customer' | 'admin' | string;
  message?: string | null;
  image_url?: string | null;
  is_read?: boolean;
  created_at?: string;
}

// ==================== Common Pagination Response ====================

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/** One entry per booked service in the multi-branch (master) booking response */
export interface AddBookingResultEntry {
  booking_id: number;
  location_id: number;
  location_name?: string;
  service_id: number;
  service_name?: string;
  booking_name?: string;
  booking_status?: string;
  duplicated?: boolean;
}

// ==================== E-Commerce Invoices ====================

export interface EcomInvoiceModel {
  id: number;
  invoice_no?: string;
  status?: 'final' | 'draft' | string;
  payment_status?: 'paid' | 'due' | 'partial' | string;
  transaction_date?: string;
  location_id?: number;
  location_name?: string;
  total_before_tax?: number;
  tax_amount?: number;
  discount_type?: 'fixed' | 'percentage' | null;
  discount_amount?: number;
  shipping_charges?: number;
  round_off_amount?: number;
  final_total?: number;
  total_paid?: number;
  total_due?: number;
  invoice_url?: string;
  payment_link?: string;
  invoice_type?: 'pos' | 'jobsheet' | 'ecommerce' | string;
  created_at?: string;
}

export interface EcomInvoiceItemModel {
  id: number;
  product_id?: number;
  product_name?: string;
  product_image?: string | null;
  variation_id?: number;
  variation_name?: string | null;
  sub_sku?: string | null;
  quantity?: number;
  unit_price?: number;
  unit_price_inc_tax?: number;
  line_discount_type?: 'fixed' | 'percentage' | null;
  line_discount_amount?: number;
  warranty_id?: number;
  warranty_months?: number;
  warranty?: {
    id: number;
    name?: string;
    duration?: number;
    duration_type?: string;
  } | null;
  note?: string | null;
}

export interface EcomInvoicePaymentModel {
  id: number;
  amount?: number;
  method?: string;
  is_return?: boolean;
  paid_on?: string;
  payment_ref_no?: string | null;
  note?: string | null;
}

export interface EcomInvoiceDetailModel extends EcomInvoiceModel {
  items?: EcomInvoiceItemModel[];
  payments?: EcomInvoicePaymentModel[];
}

// ==================== Common API Response ====================

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  token?: string;
  data?: T;
  error?: string;
}
