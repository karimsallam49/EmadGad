# EmadGad Storefront — API Reference

Everything the React storefront calls, grouped by feature, with request params/body and the response shape the frontend relies on.

## Conventions

- **Base URL**: production `https://erp.emadgad.com` (configurable via `VITE_API_BASE_URL`). In dev the Vite proxy forwards `/connector/api`, `/contact`, `/auth`.
- **Auth**: `Authorization: Bearer <token>` on every endpoint marked 🔒. Public endpoints are unauthenticated.
- **Envelope**: most endpoints return `{ success, data, ... }`; several return bare arrays/objects or a Laravel paginator `{ data, current_page, last_page, per_page, total }`. The frontend normalizes both — treat `data` as optional and tolerate bare arrays.
- **`business_id`**: the storefront is hard-coded to `business_id=1`.
- **Media paths**: offer media and some images come back as raw storage paths → resolve to `{API_BASE}/storage/{path}` (see `storageUrl` in `src/lib/api.ts`).
- **`variation_name === "DUMMY"`** means "no real variation" — hide it from UI.

---

## 1. Auth

### `POST /contact/login` 🔓
Body: `{ mobile, password, device_type: "web" }` → `{ token, data: { id, name, email, mobile } }`. Store the token; it's the Bearer token for all 🔒 calls.

### `POST /contact/signup-email` 🔓
Body: `{ mobile, password, name?, email? }` → same shape as login (`AuthUserModel` + `token`).

### `POST /auth/check-phone` 🔓
Body: `{ mobile }` → `{ userFound, result, code, name, isSoftDeleted?, userId?, message? }`. Used by the login/register flow to decide which screen to show.

### `POST /contact/forgot-password` 🔓
Body: `{ mobile }` — sends an SMS reset OTP.

### `POST /contact/reset-password` 🔓
Body: `{ mobile, otp, new_password }` — verifies OTP and sets the new password.

### `POST /auth/verify-otp` 🔓
Verifies an OTP code (used in the OTP login flow).

### Social login (Google/Apple)

| Endpoint | Body | Notes |
|---|---|---|
| `POST /connector/api/auth/social-customer-login` | `{ medium: 'google'/'apple', unique_id, email?, name?, token?, authorization_code?, identity_token? }` | Returns `SocialAuthResponseModel` (below) |
| `GET  /connector/api/otp-setting` | — | `{ enable_otp_for_social_login: boolean }` |
| `POST /connector/api/auth/update-social-mobile` | `SocialPhoneBody` | binds phone to a fresh social account |
| `POST /connector/api/auth/send-phone-verification-otp` | `SocialPhoneBody` | sends OTP before binding |
| `POST /connector/api/auth/verify-phone-and-set-mobile` | `SocialPhoneBody + otp` | verify + bind |
| `POST /connector/api/auth/send-ownership-otp` | `{ existing_user_id, phone }` | account-merge flow |
| `POST /connector/api/auth/verify-and-merge-accounts` | `{ existing_user_id, phone, otp, social_email?, medium?, unique_id? }` | merges social into existing account |
| `POST /connector/api/auth/restore-deleted-account` | `{ user_id }` | undelete soft-deleted account |

`SocialPhoneBody`: `{ phone, email?, name?, medium?, unique_id?, user_id?, otp? }`

`SocialAuthResponseModel`: `{ success?, token?, phone_exist?, is_new_user?, is_soft_deleted?, user_id?, action?, message?, phone_already_linked?, existing_user?: {id,name,phone}, pending_social_user?: {name,email}, user? }` — `token` present = logged in; otherwise `action`/`phone_exist` drive the next step (ask phone → OTP → merge or bind).

---

## 2. Customer profile, cars & odometer

### `GET /connector/api/Info/customer` 🔒
→ `{ data: CustomerInfoModel }` = `{ id, first_name?, last_name?, name?, mobile, email?, cars: CustomerCarModel[] }`.
`CustomerCarModel`: `{ id, model, brand_name?, vin_model_code, device, car_logo, car_image, model_image, color, plate_number, manufacturing_year, chassis_number, car_type, motor_cc }` — `id` is the **device_id** used by bookings and contact-km.

### `PUT /connector/api/contactapi/{id}/basic-info` 🔒
Body: `{ first_name, last_name, mobile, email? }` → updated `CustomerInfoModel`. Profile edit screen.

### `POST /connector/api/add/car` 🔒
Body: `{ plate_number, brand_id, model_id, manufacturing_year, color, chassis_number, car_type }` — adds a car (device) to the customer.

### `GET /connector/api/customers/{id}` & `GET /connector/api/customers/{id}/cars` 🔒
Single customer / cars list (older screens; profile uses `Info/customer`).

### `GET /connector/api/customers/{id}/loyalty-points` 🔒
→ `{ success, data: { totalPoints, redeemablePoints, redeemableAmount, pointsUsed, pointsExpired, enableRp, rpName, minRedeemPoint, maxRedeemPoint, amountPerPoint, minOrderTotalForRedeem } }`.

### Odometer (per car) — `contact-km` 🔒

| Call | Params/Body | Response |
|---|---|---|
| `GET /connector/api/contact-km` | `?device_id={carId}` | `{ success, km: { value: number|null, source: 'car'/'jobsheet'/null, date: string|null } }` |
| `POST /connector/api/contact-km` | `{ device_id, km }` | same `km` block. **422** when `km <= current`: `{ success:false, message:"New KM must be greater than the last recorded KM", current_km }` |
| `POST /connector/api/contact-km/scan` | multipart `{ image, device_id? }` | `{ detected_km, current_km, is_greater }` — OCR for a dashboard photo |

`source: 'car'` = manual reading, `'jobsheet'` = last workshop order, `null` = none.

---

## 3. Catalog (public e-commerce products)

All 🔓.

### `GET /connector/api/public/ecom-products`
Params: `business_id, category_id?, car_brand_id?, car_model_id?, car_year?, device_brand_id?, selected_item_ids? ("1,2,3"), per_page?, page?`
→ array or `{data:[…]}` of `EcomProductInfiniteModel`. Used by the battery car-filter and `selected_item_ids` tire-finder results.

### `GET /connector/api/public/ecom-products-infinite`
Params: `business_id, per_page?, page?, category_id?, device_brand_id?, level_id?, selected_item_ids?`
→ Laravel paginator `PaginatedResponse<EcomProductInfiniteModel>` (tolerates bare array / `{data:{data:[…]}}`). Main infinite-scroll feed for shop/category pages.

### `GET /connector/api/public/ecom-products/featured?business_id` / `…/best-sell?business_id`
Home sections. Same product schema (non-paginated list).

### `GET /connector/api/public/ecom-products-search`
Params: `business_id, q, per_page?, page?` → same product list. Used by the product search tab + `/products?q=`.

### `EcomProductInfiniteModel`
```
{ id, name, sku, variation_id, default_sell_price, discount?, discount_type?: 'percentage'|'fixed',
  discounted_price?, qty_available?, brand_id?, brand_name?, brand_jobsheet_photo?,
  category_id?, sub_category_id?, category_id_master?: number[], description?,
  image_url?, images?: string[],
  variation?: { id, name, sub_sku, default_purchase_price, dpp_inc_tax, profit_percent,
                default_sell_price, sell_price_inc_tax } }
```
Display price = `discounted_price` if `0 < disc < default_sell_price` else `default_sell_price`. Out of stock = `qty_available <= 0`.

### `GET /connector/api/public/category-items/{itemId}/next-level-direct`
→ `{ success, item, level: {level_id, level, name, levelname_en?, items[]}, items: {id,name,name_en?,parent_id?}[] }` — drilldown for the tire/battery finder selectors.

---

## 4. Taxonomy / car data / legacy catalogs 🔓

| Endpoint | Params | Response | Used for |
|---|---|---|---|
| `GET /connector/api/taxonomy` | `type='product'/'device'/'car_brand'…, page?, name?, is_ecom?, business_id?, category_id?, level_id?, selected_item_ids?` | `TaxonomyModel[]` (nested `sub_categories`, `category_level_names` with `levelname_en`) | category trees, car brand/model pickers |
| `GET /connector/api/brands` | `business_id` | `BrandModel[] {id,name,image?,logo?,features}` | car brand selector |
| `GET /connector/api/models/{brandId}` | `business_id` | `{models: CarModelModel[]}` or array `{id,name,brandId}` | car model selector |
| `GET /connector/api/tires` | `size?, brand?, usage?` | array | legacy tire catalog |
| `GET /connector/api/tires/{id}` | — | object | tire detail (legacy) |
| `GET /connector/api/batteries` | `ah?, brand?` | array | legacy battery catalog |
| `GET /connector/api/products` | `brand?, category?` | paginated `SpareProductModel` | spare-parts listing |
| `GET /connector/api/products/{id}` | `business_id` | `SpareProductModel` | product detail |
| `GET /connector/api/vehicles` | `make?, model?, year?` | paginated `VehicleModel` | car-market listings |
| `GET /connector/api/vehicles/{id}` | — | `VehicleDetailsModel` (+`media[]`, `seller`) | vehicle detail |

`TaxonomyModel` key fields: `{ id, name, name_en, parent_id, level, infinite_levels, category_type, is_ecom, logo, car_image, jobsheet_photo, sub_categories[], category_level_names[] }`.

---

## 5. Home content 🔓

### `GET /connector/api/public/ecom-sliders?business_id`
→ `{ data: EcomSliderModel[] }` = `{ id, media_url, media_type: 'image'|'video', sort_order, link?: { type:'product'|'category', id, name } }`. Hero slider; sort by `sort_order`, `link` resolves to `/products/{id}` or a category page.

### `GET /connector/api/offers?business_id&location_id?`
→ `OfferModel[]`: `{ id, name, name_ar, description(_ar), media_type, media_en/media_ar, image_en/image_ar, video_en/video_ar ({url,type:'file'|'link'}), trigger_type: 'buy_x_get_same'|'buy_x_get_other'|'combo'|'min_order_total'…, trigger_product_id, min_trigger_quantity, min_order_total, combo_discount {type,value}, order_discount {type,value}, allow_reward_choice, priority, starts_at, ends_at, max_uses, used_count, branches[{id,name}], combo_items[{product_id,variation_id,quantity,product?,variation?}], rewards[{product_id,variation_id,quantity,reward_mode:'free'|'discount',discount_type?,discount_value?}] }`

### `GET /connector/api/offers/{id}?business_id`
→ **raw** `OfferRawModel` — media are storage paths (resolve via `/storage/`), discounts in `combo_discount_type/_value` + `order_discount_type/_value`, `branches` are pivot rows `{id, offer_id, location_id, location:{id,name}}`.

---

## 6. Cart (server cart) 🔒

Customer carts live server-side; guests are handled locally in the app.

| Call | Body | Response |
|---|---|---|
| `GET /connector/api/ecommerce/cart` | — | `{ cart: EcomCartModel }` or `{ data: … }` |
| `POST /connector/api/ecommerce/cart/items` | `{ product_id, variation_id?, quantity, note? }` | updated cart |
| `PUT /connector/api/ecommerce/cart/items/{itemId}` | `{ quantity?, note? }` | updated cart |
| `DELETE /connector/api/ecommerce/cart/items/{itemId}` | — | updated cart |
| `DELETE /connector/api/ecommerce/cart` | — | emptied cart |

`EcomCartModel`: `{ id?, contact_id?, items[], items_count?, total_quantity?, subtotal? }`
`EcomCartItemModel`: `{ id (cart-line id), product_id, product_name?, product_image?, variation_id?, variation_name?, quantity, unit_price?, discount_on_product?, discount_type?, final_unit_price?, line_total?, is_available?, note? }` — **always render `final_unit_price`** (live price); `is_available:false` blocks checkout.

---

## 7. Checkout / Orders / Payments 🔒

### `POST /connector/api/ecommerce/orders`
Body `CreateEcomOrderBody`:
```
{ contact_id, order_type: 'delivery'|'self_pickup'|'take_away',
  payment_method: 'cash_on_delivery'|'pay_at_branch'|<gateway slug>,
  callback_url,                       // gateway redirects here: ?flag=success|fail&token=…
  order_note?, products: [{ product_id, variation_id?, quantity, note? }],
  location_id?,                       // pickup branch (business location id)
  delivery_area_id?, distance?, shipping_latitude?, shipping_longitude?,
  delivery_date?, delivery_time?,
  delivery_address?: { name, mobile, address_line_1, city?, state?, country?, zip_code? },
  discount_amount?, discount_type?: 'fixed'|'percentage',
  offer_id?, offer_reward_id?, redeem_points?, transaction_reference? }
```
→ `{ order: EcomOrderModel, payment: EcomPaymentInitModel|null }` — `payment` set only for digital gateways: `{ payment_id, payment_url, amount, currency }` → redirect the customer to `payment_url`. `success:false`/422 `payment_not_available` = gateway off, **no order created**.

### `GET /connector/api/ecommerce/orders?order_filter=ongoing|history&per_page&page`
→ paginated `{ orders | data }` of `EcomOrderModel`.

### `GET /connector/api/ecommerce/orders/{id}`
→ `{ order | data }: EcomOrderModel` with `items[]` + `histories[]`.

`EcomOrderModel`: `{ id, order_no, order_status, payment_status, payment_method, order_type, location_id, location_name, order_amount, discount_amount, discount_type, offer?, delivery_charge, loyalty {redeemed,redeemed_amount,earned}, final_total, delivery_address?, delivery_area_name?, delivery_datetime?, order_note?, transaction_id?, invoice_no?, created_at, items[], histories[] }`
`EcomOrderItemModel`: `{ id, product_id, product_name, product_image?, variation_id?, variation_name?, quantity, unit_price, discount_on_product?, line_total, is_offer_reward?, note? }`

### `PUT /connector/api/ecommerce/orders/{id}/cancel` — body `{ note? }`; pending orders only.
### `POST /connector/api/ecommerce/orders/{id}/pay` — body `{ gateway?, callback_url, channel:'web' }` → `{ payment | data }: { payment_id, payment_url }` — retry/start online payment on an existing order.
### `GET /connector/api/ecommerce/payments/{payment_id}/status` → `{ data: { payment_id, is_paid, order_id?, order_status?, payment_status? } }` — poll after the gateway webview returns.

### Order messages (per-order chat) 🔒
- `GET /connector/api/ecommerce/orders/{id}/messages?after_id=` → `EcomOrderMessageModel[]` (poll with `after_id`)
- `POST /connector/api/ecommerce/orders/{id}/messages` — JSON `{message}` or multipart `{message?, image}`
- `POST /connector/api/ecommerce/orders/{id}/messages/read`

`EcomOrderMessageModel`: `{ id, order_id?, sender_type: 'customer'|'admin', message?, image_url?, is_read?, created_at? }`

---

## 8. Delivery & payment methods 🔓

| Endpoint | Params | Response |
|---|---|---|
| `GET /connector/api/delivery-areas` | — | `DeliveryAreaModel[] {id, area_name, delivery_charge?}` (may be under `data` or `data.general_areas`) |
| `GET /connector/api/delivery-fee` | `location_id?` | `{ data: DeliveryFeeConfigModel }` = `{ location_id, location_name, general_areas[], delivery_charge_setup {delivery_charge_type:'area'|'distance'|'fixed', delivery_charge_per_kilometer, minimum_delivery_charge, minimum_distance_for_free_delivery, fixed_delivery_charge, free_delivery_over_status, free_delivery_over_amount}, delivery_charge_by_area[] }` |
| `GET /connector/api/delivery-fee/calculate` | `location_id?, distance?, area_id?, order_amount?` | `{ data: { delivery_charge: number } }` |
| `GET /connector/api/ecommerce/payment-methods` | `business_id` | `{ data: { cash_on_delivery, digital_payment, offline_payment?, gateways: [{gateway, gateway_title, gateway_image}] } }` — gateway slugs drive Paymob/Gieda inline checkout |
| `GET /connector/api/ecommerce/available-payment-methods` | `business_id` | `{ data: [{ id, name_ar?, name_en?, name?, image? }] }` — admin-configured custom methods (Aman, Vodafone Cash, InstaPay…) shown in the payment strip |

---

## 9. Loyalty & invoices 🔒

### `GET /connector/api/ecommerce/loyalty`
→ `{ loyalty | data }: { enabled, points_name?, balance, redeemable_points, redeemable_amount, earn {amount_per_point, min_order_total, max_points_per_order}, redeem {amount_per_point, min_order_total, min_points, max_points}, expiry {period, type} }`

### `GET /connector/api/ecommerce/invoices?payment_status&invoice_type&status&start_date&end_date&per_page&page`
→ paginated `EcomInvoiceModel[]`: `{ id, invoice_no, status, payment_status, transaction_date, location_id, location_name, total_before_tax, tax_amount, discount_type, discount_amount, shipping_charges, final_total, total_paid, total_due, invoice_url, payment_link, invoice_type: 'pos'|'jobsheet'|'ecommerce', created_at }`

### `GET /connector/api/ecommerce/invoices/{id}`
→ `{ invoice | data }: EcomInvoiceDetailModel` + `items[]` (`product_name, product_image, variation_name, sub_sku, quantity, unit_price(_inc_tax), line_discount_*, warranty {name,duration,duration_type}, note`) + `payments[]` (`amount, method, paid_on, payment_ref_no`).

---

## 10. Notifications & notify-me 🔒

| Endpoint | Params/Body | Response |
|---|---|---|
| `GET /connector/api/user-notifications` | `per_page?, after_id?, type?, is_read?` | `{ data: UserNotificationModel[], meta: paginator }` — `type` values include `cart_price_update`, `cart_low_stock`, `back_in_stock` (`reference_id` = product id) |
| `GET /connector/api/user-notifications/unread-count` | — | `{ unread_count }` |
| `PATCH /connector/api/user-notifications/{id}/read` | — | mark one |
| `PATCH /connector/api/user-notifications/read-all` | — | mark all |
| `DELETE /connector/api/user-notifications/{id}` | — | delete |
| `POST /connector/api/ecommerce/products/{productId}/notify-me` | query `variation_id?` | subscribe to back-in-stock alert |
| `DELETE /connector/api/ecommerce/products/{productId}/notify-me` | query `variation_id?` | unsubscribe |
| `GET /connector/api/ecommerce/notify-me` | — | `{ alerts: [{ id, product_id, variation_id?, product_name?, product_image?, created_at }] }` |

`UserNotificationModel`: `{ id, title, body?, type?, reference_id?, is_read, created_at }` — frontend polls every 15 s (no WS/SSE).

---

## 11. Support chat 🔒

| Endpoint | Params/Body | Response |
|---|---|---|
| `GET /connector/api/ecommerce/messages` | `after_id?` | `{ messages: ChatMessageModel[] }` |
| `POST /connector/api/ecommerce/messages` | multipart `{ message?, image? }` | `{ message: ChatMessageModel }` |
| `POST /connector/api/ecommerce/messages/read` | — | `{ marked: number }` |

`ChatMessageModel`: `{ id, message?, image_url?, sender_type: 'customer'|'admin', created_at? }`

---

## 12. Branches, services & bookings

### `GET /connector/api/business-location-with-website-settings` 🔓
→ `{ data: BusinessLocationWithWebsiteSettingsModel[] }` = `{ id, name, latitude?, longitude?, coverage?, address?, website_settings: WebsiteSettingsModel|null }`.
`WebsiteSettingsModel` key fields: `{ is_master, master_name(_ar), master_branch_ids[], logo, hero_section_image, branch_image, title(_ar), subtitle(_ar), is_car_service, is_visible, latitude/longitude/coverage, address }`.
**The `id` here is the `location_id`** used by bookings, checkout pickup, delivery-fee and offers. Master locations group several branches (`master_branch_ids`).

### `GET /connector/api/branches` 🔓
→ `BranchModel[] {id,name,isCarStation?,address?,gov?,hours?,phone?,area?}` — legacy branch list.

### `GET /connector/api/services` 🔓
Params: `location_id?` → `ServiceModel[] {id,name,mobile?,duration?,priceFrom?,icon?}`.
Params: `location_ids="1,2,3"` → map `{ "1": ServiceModel[], … }` (master-branch booking).

### `GET /connector/api/customer/booking` 🔒
→ `CustomerBookingModel[] {id, job_sheet_no, booking_status, color (hex), plate_number, brand, model, service, booking_note, booking_start, location}`.

### `POST /connector/api/add/booking` 🔒
Body: `{ location_id, service_id? | service_ids?: number[], booking_start, device_id?, booking_note?, send_notification? }`
→ `AddBookingResultEntry[] { booking_id, location_id, location_name, service_id, service_name, booking_name, booking_status, duplicated? }` — `service_ids` = one booking per service, auto-routed across master-branch children.

### `POST /connector/api/add/booking-pickup` 🔒
Body: `{ contact_id?, customer_name?, customer_phone?, service_id, location_id?, device_id?, booking_start?, pickup_time?, address?, pickup_address?, pickup_latitude?, pickup_longitude?, notes? }` — mobile-service pickup booking.

---

## 13. Job orders (workshop) 🔒

| Endpoint | Params | Response |
|---|---|---|
| `GET /connector/api/customer/joborder` | — | `CustomerJobOrderModel[] {id, job_sheet_no, brand, model, color, plate_number, manufacturing_year, workshop, location, country_code, currency_code, currency_symbol}` |
| `GET /contact/check/phone/joborder` | `id={jobOrderId}&phone={last4}` | `JobOrderPhoneCheckModel` — `success` is a **message string**, plus `dataofcar {name,mobile,color,plate_number,chassisNumber,year,model,service,status,entry_date,due_date,job_sheet_no}`, countdown `days/hours/minutes/seconds`, `job_order[]`, `tagged_images[]`, `booking_images[]`, `videos[]`, `status_id` |
| `GET /connector/api/job-orders` / `{id}` | — | `JobOrderModel` / `JobOrderDetailsResponseModel {jobOrder, carInfo, spareParts[], status}` |
| `GET /connector/api/job-estimators` / `{id}` | — | `JobEstimatorModel[]` (quotations) |

---

## 14. CMS & misc

| Endpoint | Auth | Response | Used for |
|---|---|---|---|
| `GET /connector/api/ecommerce/social-media?business_id` | 🔓 | `{ data: [{id,name,icon_url,link}] }` | WhatsApp/social links (fallbacks exist — `wa.me/qr` links can't carry `?text=`) |
| `GET /connector/api/ecommerce/tracking?business_id` | 🔓 | `{ data: { ga_measurement_id?, facebook_pixel_id? } }` | inject gtag/fbq; either may be null |
| `GET /connector/api/legal-pages/{slug}` (`terms`, `return-policy`, `cancellation-policy`, `privacy-policy`) | 🔓 | `{ data: [{ slug, title_en, title_ar, content_en, content_ar }] }` (array of ≤1) | legal pages w/ local fallback |
| `GET /connector/api/about-us` | 🔓 | `{ about_us, aboutus_ar, + all legal bodies }` | `/about` page |
| `GET /connector/api/ecommerce/blogs?business_id&per_page&page` | 🔓 | paginated `EcomBlogPostModel[]` | blog list |
| `GET /connector/api/ecommerce/blogs/{slug}?business_id` | 🔓 | `{ data: EcomBlogPostModel }` (`title(_ar), excerpt(_ar), content(_ar), image_url, blog_date, category, seo(_ar)`) | blog post + SEO |
| `GET /connector/api/blog-posts` | 🔓 | `BlogPostModel[]` | legacy blog |
| `POST /connector/api/sell/proforma` | 🔒 | `{ contact_id?, sells: [{contact_id?, products:[{product_id,quantity,unit_price}]}], total }` | wholesale quote |
| `POST /connector/api/pickup-requests` | 🔒 | `PickupRequestModel` → `{success,message}` | roadside rescue request |
| `GET /connector/api/invoices?contact_id&page` / `…/{id}` | 🔒 | `SellInvoicesResponseModel` / `SellInvoiceModel` (+`sellLines[]`) | legacy invoices |
| `GET /connector/api/reviews` | 🔓 | array | testimonials |
| `GET /connector/api/orders`, `/bookings`, `/branches/{id}`, `/battery/{id}` | mixed | legacy | older screens |

---

## Flow cheat-sheet

- **Login**: `contact/login` → Bearer token → `Info/customer` gives profile + `cars[]` (car `id` = `device_id`).
- **Browse**: `public/ecom-products*` (+`taxonomy` for filters) → product detail route by `category_id` (`2217` tires, `2222` batteries).
- **Cart**: guest = local; logged-in = `ecommerce/cart` (`final_unit_price` is authoritative).
- **Checkout**: `business-location-with-website-settings` (branch) or `delivery-areas` + `delivery-fee/calculate` (shipping) → `ecommerce/payment-methods` → `POST ecommerce/orders` → `payment.payment_url` redirect → poll `payments/{id}/status`.
- **Booking**: locations → `services?location_id(s)` → `add/booking` → customer sees them in `customer/booking`.
- **Odometer**: pick car → `contact-km?device_id` read / `POST contact-km` write (must increase).
