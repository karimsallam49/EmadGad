import { API_BASE, ENDPOINTS } from './endpoints';
import { apiLog } from './api-debug';
import type * as DTO from '@/types/api';

// Re-export the DTOs so the rest of the app can import from '@/lib/api'
export * from '@/types/api';

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiError extends Error {
  status: number;
  statusText: string;
}

let authToken: string | null = null;

export function setApiToken(token: string | null) {
  authToken = token;
}

export function getApiToken() {
  return authToken;
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  method: ApiMethod = 'GET',
  body?: unknown,
  query?: Record<string, string | number | boolean | undefined | null>,
): Promise<DTO.ApiResponse<T>> {
  let url = endpoint;

  if (query) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    }
    if (params.toString()) {
      url += `${url.includes('?') ? '&' : '?'}${params.toString()}`;
    }
  }

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const t0 = performance.now();
  apiLog({ phase: 'start', method, url });

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      credentials: 'same-origin',
      body: body === undefined || body === null
        ? undefined
        : isFormData
          ? (body as FormData)
          : JSON.stringify(body),
    });
  } catch (e) {
    // fetch rejected — CORS block, offline, DNS, or mixed-content block on mobile
    const detail = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    apiLog({ phase: 'network-error', method, url, ms: performance.now() - t0, detail });
    throw e;
  }

  const ms = performance.now() - t0;

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    let message = text;
    try {
      const parsed = JSON.parse(text);
      message =
        parsed.message ||
        parsed.msg ||
        parsed.error ||
        (Array.isArray(parsed.messages) ? parsed.messages.join(', ') : undefined) ||
        text;
    } catch {
      // keep raw text
    }
    apiLog({ phase: 'http-error', method, url, status: res.status, ms, detail: String(message).slice(0, 300) });
    const err = new Error(message) as ApiError;
    err.status = res.status;
    err.statusText = res.statusText;
    throw err;
  }

  if (res.status === 204) {
    apiLog({ phase: 'ok', method, url, status: 204, ms });
    return { success: true } as DTO.ApiResponse<T>;
  }

  try {
    const json = (await res.json()) as DTO.ApiResponse<T>;
    // Some endpoints wrap failures in HTTP 200: { success: false, error: "..." }
    if (json && (json as { success?: boolean }).success === false) {
      const j = json as { message?: string; msg?: string; error?: string; messages?: string[] };
      const message =
        j.message || j.msg || j.error ||
        (Array.isArray(j.messages) ? j.messages.join(', ') : undefined) ||
        'Request failed';
      apiLog({ phase: 'http-error', method, url, status: res.status, ms, detail: String(message).slice(0, 300) });
      const err = new Error(String(message)) as ApiError;
      err.status = res.status;
      err.statusText = res.statusText;
      throw err;
    }
    apiLog({ phase: 'ok', method, url, status: res.status, ms });
    return json;
  } catch (e) {
    if ((e as ApiError).status !== undefined) throw e;
    const detail = e instanceof Error ? e.message : String(e);
    apiLog({ phase: 'parse-error', method, url, status: res.status, ms, detail });
    throw e;
  }
}

export const api = {
  get: <T = unknown>(
    endpoint: string,
    query?: Record<string, string | number | boolean | undefined | null>,
  ) => apiRequest<T>(endpoint, 'GET', undefined, query),
  post: <T = unknown>(endpoint: string, body?: unknown) =>
    apiRequest<T>(endpoint, 'POST', body),
  put: <T = unknown>(endpoint: string, body?: unknown) =>
    apiRequest<T>(endpoint, 'PUT', body),
  patch: <T = unknown>(endpoint: string, body?: unknown) =>
    apiRequest<T>(endpoint, 'PATCH', body),
  del: <T = unknown>(endpoint: string) => apiRequest<T>(endpoint, 'DELETE'),
};

// ==================== Auth ====================

export async function checkPhone(body: { mobile: string }) {
  return api.post<DTO.CheckPhoneResultModel>(ENDPOINTS.auth.checkPhone, body);
}

// ==================== Social auth (Google/Apple) ====================

export interface SocialLoginBody {
  medium: 'google' | 'apple';
  unique_id: string;
  email?: string;
  name?: string;
  /** Google OAuth access token */
  token?: string;
  /** Apple-only fields */
  authorization_code?: string;
  identity_token?: string;
}

export async function socialLogin(body: SocialLoginBody) {
  const res = await api.post<DTO.SocialAuthResponseModel>(ENDPOINTS.auth.socialLogin, body);
  return (res as unknown as { data?: DTO.SocialAuthResponseModel }).data ?? (res as unknown as DTO.SocialAuthResponseModel);
}

/** Feature flag — whether phone binding requires OTP (defaults true on error) */
export async function getOtpSetting() {
  try {
    const res = await api.get<{ enable_otp_for_social_login?: boolean } | unknown>(ENDPOINTS.auth.otpSetting);
    const raw = (res as unknown as { data?: { enable_otp_for_social_login?: boolean } }).data;
    return raw?.enable_otp_for_social_login ?? true;
  } catch {
    return true;
  }
}

export interface SocialPhoneBody {
  phone: string;
  email?: string;
  name?: string;
  medium?: string;
  unique_id?: string;
  user_id?: number | null;
  otp?: string;
}

export async function updateSocialMobile(body: SocialPhoneBody) {
  const res = await api.post<DTO.SocialAuthResponseModel>(ENDPOINTS.auth.updateSocialMobile, body);
  return (res as unknown as { data?: DTO.SocialAuthResponseModel }).data ?? (res as unknown as DTO.SocialAuthResponseModel);
}

export async function sendPhoneVerificationOtp(body: SocialPhoneBody) {
  const res = await api.post<DTO.SocialAuthResponseModel>(ENDPOINTS.auth.sendPhoneVerificationOtp, body);
  return (res as unknown as { data?: DTO.SocialAuthResponseModel }).data ?? (res as unknown as DTO.SocialAuthResponseModel);
}

export async function verifyPhoneAndSetMobile(body: SocialPhoneBody) {
  const res = await api.post<DTO.SocialAuthResponseModel>(ENDPOINTS.auth.verifyPhoneAndSetMobile, body);
  return (res as unknown as { data?: DTO.SocialAuthResponseModel }).data ?? (res as unknown as DTO.SocialAuthResponseModel);
}

export async function sendOwnershipOtp(body: { existing_user_id: number; phone: string }) {
  return api.post(ENDPOINTS.auth.sendOwnershipOtp, body);
}

export async function verifyAndMergeAccounts(body: {
  existing_user_id: number;
  phone: string;
  otp: string;
  social_email?: string;
  medium?: string;
  unique_id?: string;
}) {
  const res = await api.post<DTO.SocialAuthResponseModel>(ENDPOINTS.auth.verifyAndMergeAccounts, body);
  return (res as unknown as { data?: DTO.SocialAuthResponseModel }).data ?? (res as unknown as DTO.SocialAuthResponseModel);
}

export async function restoreDeletedAccount(userId: number) {
  return api.post(ENDPOINTS.auth.restoreDeletedAccount, { user_id: userId });
}

export async function login(body: { mobile: string; password: string; device_type?: string }) {
  return api.post<DTO.AuthUserModel>(ENDPOINTS.auth.login, { ...body, device_type: body.device_type ?? 'web' });
}

export async function register(body: { mobile: string; password: string; name?: string; email?: string }) {
  return api.post<DTO.AuthUserModel>(ENDPOINTS.auth.register, body);
}

/** POST contact/forgot-password — sends a reset link to the user's mobile (public) */
export async function forgotPassword(body: { mobile: string }) {
  return api.post(ENDPOINTS.auth.forgotPassword, body);
}

/** POST contact/reset-password — verifies the SMS OTP and sets the new password (public) */
export async function resetPassword(body: { mobile: string; otp: string; new_password: string }) {
  return api.post(ENDPOINTS.auth.resetPassword, body);
}

// ==================== Customer ====================

export async function getCustomer(id: number) {
  return api.get<DTO.CustomerInfoModel>(ENDPOINTS.customer(id));
}

export async function getCustomerCars(id: number) {
  return api.get<DTO.CustomerCarModel[]>(ENDPOINTS.customerCars(id));
}

export interface AddCustomerCarBody {
  plate_number: string;
  brand_id: number;
  model_id: number;
  manufacturing_year: string;
  color: string;
  chassis_number: string;
  car_type: string;
}

export async function addCustomerCar(body: AddCustomerCarBody) {
  return apiRequest<unknown>(ENDPOINTS.addCar, 'POST', body);
}

// ==================== Contact KM (odometer) ====================

export interface ContactKmModel {
  value: number | null;
  source: 'contact' | 'jobsheet' | string | null;
  date?: string | null;
}

export async function getContactKm() {
  const res = await apiRequest<unknown>(ENDPOINTS.contactKm, 'GET');
  const raw = res as unknown as { km?: ContactKmModel };
  return raw.km ?? null;
}

export async function updateContactKm(km: number) {
  const res = await apiRequest<unknown>(ENDPOINTS.contactKm, 'POST', { km });
  const raw = res as unknown as { km?: ContactKmModel };
  return raw.km ?? null;
}

export interface ContactKmScanResult {
  detected_km: number | null;
  current_km: number | null;
  is_greater: boolean;
}

export async function scanContactKm(image: File) {
  const fd = new FormData();
  fd.set('image', image);
  const res = await apiRequest<unknown>(ENDPOINTS.contactKmScan, 'POST', fd);
  const raw = res as unknown as Partial<ContactKmScanResult>;
  return {
    detected_km: raw.detected_km ?? null,
    current_km: raw.current_km ?? null,
    is_greater: !!raw.is_greater,
  } as ContactKmScanResult;
}

export async function getCustomerLoyalty(id: number) {
  return api.get<DTO.LoyaltyPointsModel>(ENDPOINTS.customerLoyalty(id));
}

// ==================== Public catalogues ====================

export async function getTires(query?: { size?: string; brand?: string; usage?: string }) {
  return api.get<unknown[]>(ENDPOINTS.tires, query);
}

export async function getTire(id: string) {
  return api.get<unknown>(ENDPOINTS.tire(id));
}

export async function getBatteries(query?: { ah?: number; brand?: string }) {
  return api.get<unknown[]>(ENDPOINTS.batteries, query);
}

export async function getBrands() {
  const res = await api.get<DTO.BrandModel[]>(ENDPOINTS.brands, { business_id: 1 });
  // backend may return the array directly or wrapped in { data: [...] }
  return (Array.isArray(res as unknown)
    ? (res as unknown as DTO.BrandModel[])
    : res.data ?? []) as DTO.BrandModel[];
}

export async function getModels(brandId: number) {
  const res = await api.get<DTO.CarModelModel[]>(ENDPOINTS.models(brandId), { business_id: 1 });
  const raw = res as any;
  const models = raw?.models ?? raw?.data ?? (Array.isArray(raw) ? raw : []);
  return (Array.isArray(models) ? models : []) as DTO.CarModelModel[];
}

export async function getTaxonomy(query?: {
  type?: string;
  page?: number;
  name?: string;
  is_ecom?: number;
  business_id?: number;
  category_id?: number;
  level_id?: number;
  selected_item_ids?: string;
}) {
  const res = await api.get<unknown>(ENDPOINTS.taxonomy, query);
  const raw = res as any;
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw?.data?.data)
        ? raw.data.data
        : [];
  return (Array.isArray(list) ? list : []) as DTO.TaxonomyModel[];
}

export async function getCategoryItemsNextLevel(itemId: number) {
  const res = await api.get<DTO.CategoryItemsNextLevelResponse>(ENDPOINTS.categoryItemNextLevel(itemId));
  return ((res as any)?.data ?? res) as DTO.CategoryItemsNextLevelResponse;
}

export async function getOffers(query?: { business_id?: number; location_id?: number }) {
  const res = await api.get<DTO.OfferModel[]>(ENDPOINTS.offers, query);
  const raw = res as unknown as DTO.OfferModel[] | { data?: DTO.OfferModel[] };
  return (Array.isArray(raw) ? raw : raw.data ?? []) as DTO.OfferModel[];
}

/** Resolve a raw storage path (as returned by GET /offers/{id}) into a full URL */
export function storageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}/storage/${path.replace(/^\/+/, '')}`;
}

/** GET offers/{id} — returns the RAW model (media paths + *_type/*_value columns) */
export async function getOffer(id: number, businessId = 1) {
  const res = await api.get<DTO.OfferRawModel>(ENDPOINTS.offer(id), { business_id: businessId });
  return (res.data ?? null) as DTO.OfferRawModel | null;
}

export async function getProducts(query?: { brand?: string; category?: string }) {
  return api.get<DTO.PaginatedResponse<DTO.SpareProductModel>>(ENDPOINTS.products, query);
}

export async function getProduct(id: number, businessId = 1) {
  return api.get<DTO.SpareProductModel>(ENDPOINTS.product(id), { business_id: businessId });
}

export async function getVehicles(query?: { make?: string; model?: string; year?: number }) {
  return api.get<DTO.PaginatedResponse<DTO.VehicleModel>>(ENDPOINTS.vehicles, query);
}

export async function getVehicle(id: number) {
  return api.get<DTO.VehicleDetailsModel>(ENDPOINTS.vehicle(id));
}

// ==================== Branches / Locations / Services ====================

export async function getBranches() {
  const res = await api.get<DTO.BranchModel[]>(ENDPOINTS.branches);
  return (res.data ?? (Array.isArray(res as unknown) ? (res as unknown as DTO.BranchModel[]) : [])) as DTO.BranchModel[];
}

export async function getBusinessLocations() {
  return api.get<DTO.BusinessLocationWithWebsiteSettingsModel[]>(ENDPOINTS.businessLocations);
}

let customerInfoInflight: Promise<DTO.CustomerInfoModel | undefined> | null = null;

/** Dedupes concurrent calls — remounts/StrictMode used to fire this twice on load */
export async function getCustomerInfo() {
  customerInfoInflight ??= api
    .get<DTO.CustomerInfoModel>(ENDPOINTS.customerInfo)
    .then((res) => res.data)
    .finally(() => {
      customerInfoInflight = null;
    });
  return customerInfoInflight;
}

export async function getEcomProducts(query: {
  business_id: number;
  car_brand_id?: number;
  car_model_id?: number;
  car_year?: number;
  device_brand_id?: number;
  selected_item_ids?: string;
  category_id?: number;
  per_page?: number;
  page?: number;
}) {
  return api.get<unknown[]>(ENDPOINTS.ecomProducts, query);
}

export async function getEcomProductsInfinite(query: {
  business_id: number;
  per_page?: number;
  page?: number;
  category_id?: number;
  device_brand_id?: number;
  level_id?: number;
  selected_item_ids?: string;
}) {
  return api.get<DTO.PaginatedResponse<DTO.EcomProductInfiniteModel>>(ENDPOINTS.ecomProductsInfinite, query);
}

export async function updateCustomerBasicInfo(
  id: number,
  body: { first_name: string; last_name: string; mobile: string }
) {
  return api.put<DTO.CustomerInfoModel>(ENDPOINTS.customerBasicInfo(id), body);
}

export async function getServices(query?: { location_id?: number }) {
  const res = await api.get<DTO.ServiceModel[]>(ENDPOINTS.services, query);
  return (res.data ?? (Array.isArray(res as unknown) ? (res as unknown as DTO.ServiceModel[]) : [])) as DTO.ServiceModel[];
}

/** Multi-location services — returns a map keyed by location id (master-branch flow) */
export async function getServicesGrouped(locationIds: number[]) {
  const res = await api.get<Record<string, DTO.ServiceModel[]>>(ENDPOINTS.services, {
    location_ids: locationIds.join(','),
  });
  const raw = res as unknown as Record<string, unknown>;
  const map = raw.data && typeof raw.data === 'object' ? (raw.data as Record<string, unknown>) : raw;
  const out: Record<string, DTO.ServiceModel[]> = {};
  for (const [key, value] of Object.entries(map)) {
    if (Array.isArray(value)) out[key] = value as DTO.ServiceModel[];
  }
  return out;
}

/** Unified display name — master branches show the localized group name */
export function locationDisplayName(b: DTO.BusinessLocationWithWebsiteSettingsModel, isAr: boolean) {
  const ws = b.website_settings;
  if (ws?.is_master) {
    return (isAr ? ws.master_name_ar ?? ws.master_name : ws.master_name ?? ws.master_name_ar) ?? b.name;
  }
  return b.name;
}

// ==================== Orders / Invoices / Bookings ====================

export async function getInvoices(query?: { page?: number; contact_id?: number }) {
  return api.get<DTO.SellInvoicesResponseModel>(ENDPOINTS.invoices, query);
}

export async function getInvoice(id: number) {
  return api.get<DTO.SellInvoiceModel>(ENDPOINTS.invoice(id));
}

export interface SellProformaProduct {
  product_id: string | number;
  quantity: number;
  unit_price: number;
}

export interface SellProformaBody {
  contact_id?: number;
  sells: {
    contact_id?: number;
    products: SellProformaProduct[];
  }[];
  total: number;
}

export async function sellProforma(body: SellProformaBody) {
  return api.post<DTO.ApiResponse<unknown>>(ENDPOINTS.sellProforma, body);
}

export async function createBooking(body: unknown) {
  return api.post<DTO.BookingModel>(ENDPOINTS.bookings, body);
}

export interface AddBookingBody {
  location_id: number;
  service_id?: number;
  /** Master-branch flow — one booking per service, auto-routed across linked branches */
  service_ids?: number[];
  booking_start: string;
  device_id?: number;
  booking_note?: string;
  send_notification?: boolean;
}

export async function addBooking(body: AddBookingBody) {
  return api.post<DTO.ApiResponse<DTO.AddBookingResultEntry[] | unknown>>(ENDPOINTS.addBooking, body);
}

export interface AddBookingPickupBody {
  contact_id?: number;
  customer_name?: string;
  customer_phone?: string;
  service_id: number;
  location_id?: number;
  device_id?: number;
  booking_start?: string;
  pickup_time?: string;
  address?: string;
  pickup_address?: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  notes?: string;
}

export async function addBookingPickup(body: AddBookingPickupBody) {
  return api.post<DTO.ApiResponse<unknown>>(ENDPOINTS.addBookingPickup, body);
}

// ==================== Job Orders / Estimators / Pickup ====================

export async function getJobOrders() {
  return api.get<DTO.JobOrderModel[]>(ENDPOINTS.jobOrders);
}

export async function getJobOrder(id: number) {
  return api.get<DTO.JobOrderDetailsResponseModel>(ENDPOINTS.jobOrder(id));
}

export async function getJobEstimators() {
  return api.get<DTO.JobEstimatorModel[]>(ENDPOINTS.jobEstimators);
}

export async function getJobEstimator(id: number) {
  return api.get<DTO.JobEstimatorModel>(ENDPOINTS.jobEstimator(id));
}

export async function createPickup(body: DTO.PickupRequestModel) {
  return api.post<DTO.PickupRequestResponseModel>(ENDPOINTS.pickup, body);
}

// ==================== CMS ====================

export async function getAboutUs() {
  return api.get<DTO.AboutUsModel>(ENDPOINTS.aboutUs);
}

/** Public — active social-media links for the business (sorted by sort_order) */
export async function getSocialMedia(businessId = 1) {
  const res = await api.get<DTO.SocialMediaModel[]>(ENDPOINTS.ecomSocialMedia, {
    business_id: businessId,
  });
  const raw = res as unknown as { data?: DTO.SocialMediaModel[] };
  return raw.data ?? [];
}

// ==================== Chat ====================

export async function getChatMessages(afterId?: number) {
  const res = await api.get<DTO.ChatMessageModel[]>(ENDPOINTS.ecomMessages, {
    after_id: afterId,
  });
  const raw = res as unknown as { messages?: DTO.ChatMessageModel[] };
  return raw.messages ?? [];
}

export async function sendChatMessage(body: { message?: string; image?: File }) {
  const fd = new FormData();
  if (body.message) fd.set('message', body.message);
  if (body.image) fd.set('image', body.image);
  const res = await apiRequest<DTO.ChatMessageModel>(ENDPOINTS.ecomMessages, 'POST', fd);
  const raw = res as unknown as { message?: DTO.ChatMessageModel };
  return raw.message;
}

export async function markChatMessagesRead() {
  return api.post<{ marked?: number }>(ENDPOINTS.ecomMessagesRead);
}

// ==================== Notify Me ====================

export async function subscribeNotifyMe(productId: number, variationId?: number) {
  return apiRequest(ENDPOINTS.ecomNotifyMe(productId), 'POST', undefined, {
    variation_id: variationId,
  });
}

export async function unsubscribeNotifyMe(productId: number, variationId?: number) {
  return apiRequest(ENDPOINTS.ecomNotifyMe(productId), 'DELETE', undefined, {
    variation_id: variationId,
  });
}

export async function getNotifyMeSubscriptions() {
  const res = await api.get<DTO.NotifyMeAlertModel[]>(ENDPOINTS.ecomNotifyMeList);
  const raw = res as unknown as { alerts?: DTO.NotifyMeAlertModel[] };
  return raw.alerts ?? [];
}

// ==================== User Notifications ====================

export async function getUserNotifications(query?: {
  per_page?: number;
  after_id?: number;
  type?: string;
  is_read?: boolean;
}) {
  const res = await api.get<DTO.UserNotificationModel[]>(ENDPOINTS.userNotifications, query);
  const raw = res as unknown as DTO.UserNotificationsResult;
  return { data: raw.data ?? [], meta: raw.meta };
}

export async function getUnreadNotificationCount() {
  const res = await api.get<{ unread_count?: number }>(ENDPOINTS.userNotificationsUnreadCount);
  const raw = res as unknown as { unread_count?: number };
  return raw.unread_count ?? 0;
}

export async function markNotificationRead(id: number) {
  return api.patch(ENDPOINTS.userNotificationRead(id));
}

export async function markAllNotificationsRead() {
  return api.patch(ENDPOINTS.userNotificationsReadAll);
}

export async function deleteNotification(id: number) {
  return api.del(ENDPOINTS.userNotification(id));
}

export async function getBlogPosts() {
  return api.get<DTO.BlogPostModel[]>(ENDPOINTS.blogPosts);
}

export interface EcomBlogsPage {
  posts: DTO.EcomBlogPostModel[];
  currentPage: number;
  lastPage: number;
  total: number;
}

/** GET ecommerce/blogs — paginated public blog list */
export async function getEcomBlogs(query: {
  business_id: number;
  per_page?: number;
  page?: number;
}): Promise<EcomBlogsPage> {
  const res = await apiRequest<DTO.EcomBlogPostModel[]>(ENDPOINTS.ecomBlogs, 'GET', undefined, query);
  const raw = res as DTO.ApiResponse<DTO.EcomBlogPostModel[]> & {
    meta?: { current_page?: number; last_page?: number; per_page?: number; total?: number };
    current_page?: number;
    last_page?: number;
    total?: number;
  };
  return {
    posts: raw.data ?? [],
    currentPage: Number(raw.meta?.current_page ?? raw.current_page ?? query.page ?? 1),
    lastPage: Number(raw.meta?.last_page ?? raw.last_page ?? 1),
    total: Number(raw.meta?.total ?? raw.total ?? raw.data?.length ?? 0),
  };
}

/** GET ecommerce/blogs/{slug} — full post content + SEO payload */
export async function getEcomBlog(slug: string, businessId = 1) {
  const res = await api.get<DTO.EcomBlogPostModel>(ENDPOINTS.ecomBlog(slug), { business_id: businessId });
  return res.data ?? null;
}

// ==================== E-Commerce Checkout ====================

/** GET ecommerce/loyalty — balance + redeem limits for the logged-in contact (auth) */
export async function getEcomLoyalty() {
  const res = await api.get<DTO.EcomLoyaltyModel>(ENDPOINTS.ecomLoyalty);
  const raw = res as DTO.ApiResponse<DTO.EcomLoyaltyModel> & { loyalty?: DTO.EcomLoyaltyModel };
  return (raw.loyalty ?? raw.data ?? null) as DTO.EcomLoyaltyModel | null;
}

/** GET ecommerce/invoices — the logged-in customer's invoices, newest first (auth) */
export async function getEcomInvoices(query?: {
  payment_status?: string;
  invoice_type?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  per_page?: number;
  page?: number;
}) {
  const res = await api.get<DTO.EcomInvoiceModel[]>(ENDPOINTS.ecomInvoices, query);
  const raw = res as DTO.ApiResponse<DTO.EcomInvoiceModel[]> & {
    meta?: { current_page?: number; last_page?: number; total?: number };
  };
  return {
    data: raw.data ?? [],
    current_page: raw.meta?.current_page,
    last_page: raw.meta?.last_page,
    total: raw.meta?.total,
  };
}

/** GET ecommerce/invoices/{id} — single invoice with items + payments (auth) */
export async function getEcomInvoice(id: number) {
  const res = await api.get<DTO.EcomInvoiceDetailModel>(ENDPOINTS.ecomInvoice(id));
  const raw = res as DTO.ApiResponse<DTO.EcomInvoiceDetailModel> & {
    invoice?: DTO.EcomInvoiceDetailModel;
  };
  return (raw.invoice ?? raw.data ?? null) as DTO.EcomInvoiceDetailModel | null;
}

/** GET ecommerce/payment-methods?business_id — enabled payment options (public) */
export async function getEcomPaymentMethods(businessId: number) {
  const res = await api.get<DTO.EcomPaymentMethodsModel>(ENDPOINTS.ecomPaymentMethods, {
    business_id: businessId,
  });
  return (res.data ?? null) as DTO.EcomPaymentMethodsModel | null;
}

/** GET ecommerce/available-payment-methods — admin-configured custom methods (Aman, Vodafone Cash…) */
export async function getAvailablePaymentMethods(businessId = 1) {
  const res = await api.get<DTO.AvailablePaymentMethodModel[]>(ENDPOINTS.ecomAvailablePaymentMethods, {
    business_id: businessId,
  });
  const raw = res as unknown as { data?: DTO.AvailablePaymentMethodModel[] };
  return raw.data ?? [];
}

/** GET delivery-areas — public delivery areas the customer can pick from */
export async function getDeliveryAreas() {
  const res = await api.get<DTO.DeliveryAreaModel[]>(ENDPOINTS.deliveryAreas);
  const raw = res as unknown as
    | DTO.DeliveryAreaModel[]
    | { data?: DTO.DeliveryAreaModel[] | { general_areas?: DTO.DeliveryAreaModel[] } };
  const inner = Array.isArray(raw) ? raw : raw.data;
  return (Array.isArray(inner) ? inner : inner?.general_areas ?? []) as DTO.DeliveryAreaModel[];
}

/** GET delivery-fee?location_id — branch delivery charge setup + areas (public) */
export async function getDeliveryFeeConfig(locationId?: number) {
  const res = await api.get<DTO.DeliveryFeeConfigModel>(ENDPOINTS.deliveryFee, {
    location_id: locationId,
  });
  return (res.data ?? null) as DTO.DeliveryFeeConfigModel | null;
}

/** GET delivery-fee/calculate — expected delivery charge for display (public) */
export async function calculateDeliveryFee(query: {
  location_id?: number;
  distance?: number;
  area_id?: number;
  order_amount?: number;
}) {
  const res = await api.get<{ delivery_charge: number }>(ENDPOINTS.deliveryFeeCalculate, query);
  return (res.data ?? { delivery_charge: 0 }) as { delivery_charge: number };
}

/** POST ecommerce/orders — create the order; prices/discounts computed server-side (auth) */
export async function createEcomOrder(body: DTO.CreateEcomOrderBody) {
  const res = await api.post<DTO.EcomOrderModel>(ENDPOINTS.ecomOrders, body);
  const raw = res as DTO.ApiResponse<DTO.EcomOrderModel> & {
    order?: DTO.EcomOrderModel;
    msg?: string;
  };
  if (raw.success === false) {
    throw new Error(raw.msg ?? raw.message ?? 'فشل إنشاء الطلب');
  }
  return (raw.order ?? raw.data) as DTO.EcomOrderModel;
}

/** GET ecommerce/orders — the contact's orders, paginated (auth) */
export async function getEcomOrders(query?: {
  order_filter?: 'ongoing' | 'history';
  per_page?: number;
  page?: number;
}) {
  const res = await api.get<DTO.EcomOrderModel[]>(ENDPOINTS.ecomOrders, query);
  const raw = res as unknown as Partial<DTO.PaginatedResponse<DTO.EcomOrderModel>> & {
    orders?: DTO.EcomOrderModel[] | Partial<DTO.PaginatedResponse<DTO.EcomOrderModel>>;
  };
  const orders = raw.orders ?? raw.data ?? [];
  const list = Array.isArray(orders) ? orders : orders.data ?? [];
  const paged = Array.isArray(orders) ? undefined : orders;
  return {
    data: list,
    current_page: raw.current_page ?? paged?.current_page,
    last_page: raw.last_page ?? paged?.last_page,
    total: raw.total ?? paged?.total,
  };
}

/** GET ecommerce/orders/{id} — order details + status history (auth) */
export async function getEcomOrder(id: number) {
  const res = await api.get<DTO.EcomOrderModel>(ENDPOINTS.ecomOrder(id));
  const raw = res as DTO.ApiResponse<DTO.EcomOrderModel> & { order?: DTO.EcomOrderModel };
  return (raw.order ?? raw.data ?? null) as DTO.EcomOrderModel | null;
}

/** PUT ecommerce/orders/{id}/cancel — only while the order is pending (auth) */
export async function cancelEcomOrder(id: number, note?: string) {
  return api.put<DTO.ApiResponse<unknown>>(ENDPOINTS.ecomOrderCancel(id), note ? { note } : {});
}

/** POST ecommerce/orders/{id}/pay — start online payment for an order (auth) */
export async function payEcomOrder(id: number, body: DTO.EcomPayOrderBody) {
  const res = await api.post<DTO.EcomPaymentInitModel>(ENDPOINTS.ecomOrderPay(id), body);
  return (res.data ?? null) as DTO.EcomPaymentInitModel | null;
}

/** GET ecommerce/payments/{payment_id}/status — poll after the payment webview (auth) */
export async function getEcomPaymentStatus(paymentId: number) {
  const res = await api.get<DTO.EcomPaymentStatusModel>(ENDPOINTS.ecomPaymentStatus(paymentId));
  return (res.data ?? null) as DTO.EcomPaymentStatusModel | null;
}

/** GET ecommerce/orders/{id}/messages — order chat; pass after_id for polling (auth) */
export async function getEcomOrderMessages(id: number, afterId?: number) {
  const res = await api.get<DTO.EcomOrderMessageModel[]>(ENDPOINTS.ecomOrderMessages(id), {
    after_id: afterId,
  });
  const raw = res as unknown as
    | DTO.EcomOrderMessageModel[]
    | { data?: DTO.EcomOrderMessageModel[]; messages?: DTO.EcomOrderMessageModel[] };
  const list = Array.isArray(raw) ? raw : raw.data ?? raw.messages ?? [];
  return list;
}

/** POST ecommerce/orders/{id}/messages — text and/or image (multipart) message (auth) */
export async function sendEcomOrderMessage(
  id: number,
  body: { message?: string; image?: File | Blob },
) {
  if (!body.image) {
    return api.post<DTO.ApiResponse<unknown>>(ENDPOINTS.ecomOrderMessages(id), {
      message: body.message,
    });
  }
  const form = new FormData();
  if (body.message) form.append('message', body.message);
  form.append('image', body.image);
  return apiRequest<DTO.ApiResponse<unknown>>(ENDPOINTS.ecomOrderMessages(id), 'POST', form);
}

/** POST ecommerce/orders/{id}/messages/read — mark admin messages as read (auth) */
export async function markEcomOrderMessagesRead(id: number) {
  return api.post<DTO.ApiResponse<unknown>>(ENDPOINTS.ecomOrderMessagesRead(id), {});
}
