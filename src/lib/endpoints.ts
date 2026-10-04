// Dev requests stay same-origin ('' → /connector/api/...) and get forwarded by the
// Vite proxy in vite.config.ts — this sidesteps CORS entirely. Production builds
// use VITE_API_BASE_URL (or the fallback) as absolute URLs.
export const API_BASE = import.meta.env.DEV
  ? ''
  : ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'https://erp.emadgad.com');

export const ENDPOINTS = {
  // Core catalogues under /connector/api
  tires: `${API_BASE}/connector/api/tires`,
  tire: (id: string) => `${API_BASE}/connector/api/tires/${encodeURIComponent(id)}`,
  tiresBySize: (size: string) =>
    `${API_BASE}/connector/api/tires?size=${encodeURIComponent(size)}`,

  batteries: `${API_BASE}/connector/api/batteries`,
  battery: (id: string) => `${API_BASE}/connector/api/batteries/${encodeURIComponent(id)}`,

  services: `${API_BASE}/connector/api/services`,

  branches: `${API_BASE}/connector/api/branches`,
  branch: (id: string) => `${API_BASE}/connector/api/branches/${encodeURIComponent(id)}`,

  offers: `${API_BASE}/connector/api/offers`,
  offer: (id: number) => `${API_BASE}/connector/api/offers/${id}`,

  reviews: `${API_BASE}/connector/api/reviews`,

  orders: `${API_BASE}/connector/api/orders`,
  order: (id: string) => `${API_BASE}/connector/api/orders/${encodeURIComponent(id)}`,

  bookings: `${API_BASE}/connector/api/bookings`,
  booking: (id: string) => `${API_BASE}/connector/api/bookings/${encodeURIComponent(id)}`,
  addBooking: `${API_BASE}/connector/api/add/booking`,
  addBookingPickup: `${API_BASE}/connector/api/add/booking-pickup`,

  brands: `${API_BASE}/connector/api/brands`,
  models: (brandId: number) => `${API_BASE}/connector/api/models/${brandId}`,
  taxonomy: `${API_BASE}/connector/api/taxonomy`,

  // HUP / extended API
  auth: {
    checkPhone: `${API_BASE}/auth/check-phone`,
    social: `${API_BASE}/auth/social`,
    login: `${API_BASE}/contact/login`,
    register: `${API_BASE}/contact/signup-email`,
    forgotPassword: `${API_BASE}/contact/forgot-password`,
    resetPassword: `${API_BASE}/contact/reset-password`,
    verifyOtp: `${API_BASE}/auth/verify-otp`,
  },

  customer: (id: number) => `${API_BASE}/connector/api/customers/${id}`,
  customerCars: (id: number) => `${API_BASE}/connector/api/customers/${id}/cars`,
  customerLoyalty: (id: number) => `${API_BASE}/connector/api/customers/${id}/loyalty-points`,

  vehicles: `${API_BASE}/connector/api/vehicles`,
  vehicle: (id: number) => `${API_BASE}/connector/api/vehicles/${id}`,

  products: `${API_BASE}/connector/api/products`,
  product: (id: number) => `${API_BASE}/connector/api/products/${id}`,

  invoices: `${API_BASE}/connector/api/invoices`,
  invoice: (id: number) => `${API_BASE}/connector/api/invoices/${id}`,

  jobOrders: `${API_BASE}/connector/api/job-orders`,
  jobOrder: (id: number) => `${API_BASE}/connector/api/job-orders/${id}`,

  jobEstimators: `${API_BASE}/connector/api/job-estimators`,
  jobEstimator: (id: number) => `${API_BASE}/connector/api/job-estimators/${id}`,

  pickup: `${API_BASE}/connector/api/pickup-requests`,
  customerInfo: `${API_BASE}/connector/api/Info/customer`,
  contactKm: `${API_BASE}/connector/api/contact-km`,
  contactKmScan: `${API_BASE}/connector/api/contact-km/scan`,
  customerBasicInfo: (id: number) => `${API_BASE}/connector/api/contactapi/${id}/basic-info`,
  ecomProducts: `${API_BASE}/connector/api/public/ecom-products`,
  ecomProductsInfinite: `${API_BASE}/connector/api/public/ecom-products-infinite`,
  categoryItemNextLevel: (itemId: number) => `${API_BASE}/connector/api/public/category-items/${itemId}/next-level-direct`,
  sellProforma: `${API_BASE}/connector/api/sell/proforma`,

  // E-commerce checkout
  ecomOrders: `${API_BASE}/connector/api/ecommerce/orders`,
  ecomOrder: (id: number) => `${API_BASE}/connector/api/ecommerce/orders/${id}`,
  ecomOrderCancel: (id: number) => `${API_BASE}/connector/api/ecommerce/orders/${id}/cancel`,
  ecomOrderPay: (id: number) => `${API_BASE}/connector/api/ecommerce/orders/${id}/pay`,
  ecomOrderMessages: (id: number) => `${API_BASE}/connector/api/ecommerce/orders/${id}/messages`,
  ecomOrderMessagesRead: (id: number) => `${API_BASE}/connector/api/ecommerce/orders/${id}/messages/read`,
  ecomPaymentStatus: (paymentId: number) =>
    `${API_BASE}/connector/api/ecommerce/payments/${paymentId}/status`,
  ecomLoyalty: `${API_BASE}/connector/api/ecommerce/loyalty`,
  ecomInvoices: `${API_BASE}/connector/api/ecommerce/invoices`,
  ecomInvoice: (id: number) => `${API_BASE}/connector/api/ecommerce/invoices/${id}`,
  ecomPaymentMethods: `${API_BASE}/connector/api/ecommerce/payment-methods`,
  ecomAvailablePaymentMethods: `${API_BASE}/connector/api/ecommerce/available-payment-methods`,
  deliveryAreas: `${API_BASE}/connector/api/delivery-areas`,
  deliveryFee: `${API_BASE}/connector/api/delivery-fee`,
  deliveryFeeCalculate: `${API_BASE}/connector/api/delivery-fee/calculate`,
  ecomSocialMedia: `${API_BASE}/connector/api/ecommerce/social-media`,
  ecomMessages: `${API_BASE}/connector/api/ecommerce/messages`,
  ecomMessagesRead: `${API_BASE}/connector/api/ecommerce/messages/read`,
  ecomNotifyMe: (productId: number) =>
    `${API_BASE}/connector/api/ecommerce/products/${productId}/notify-me`,
  ecomNotifyMeList: `${API_BASE}/connector/api/ecommerce/notify-me`,
  userNotifications: `${API_BASE}/connector/api/user-notifications`,
  userNotificationsUnreadCount: `${API_BASE}/connector/api/user-notifications/unread-count`,
  userNotificationRead: (id: number) => `${API_BASE}/connector/api/user-notifications/${id}/read`,
  userNotificationsReadAll: `${API_BASE}/connector/api/user-notifications/read-all`,
  userNotification: (id: number) => `${API_BASE}/connector/api/user-notifications/${id}`,

  aboutUs: `${API_BASE}/connector/api/about-us`,
  blogPosts: `${API_BASE}/connector/api/blog-posts`,
  businessLocations: `${API_BASE}/connector/api/business-location-with-website-settings`,
} as const;
