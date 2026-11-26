# Booking — Full API & Flow Documentation

Everything the storefront does for **service booking** (`/booking`), **mobile-service / rescue pickup** (`/rescue`), and **my bookings** (profile tab) — endpoints, bodies, auth requirements, and the master-branch routing logic.

## Auth summary

| Endpoint | Auth? |
|---|---|
| `business-location-with-website-settings` | 🔓 public |
| `services` | 🔓 public |
| `add/booking` | 🔒 Bearer token |
| `add/booking-pickup` | 🔒 Bearer token |
| `customer/booking` | 🔒 Bearer token |
| `Info/customer` (cars for `device_id`) | 🔒 Bearer token |

The booking wizard itself requires a logged-in user at the confirm step (`user` from `Info/customer` — `user.mobile` goes into WhatsApp confirmation, `cars[]` feeds the car picker).

---

## 1. Step 0 — Branch picker 🔓

### `GET /connector/api/business-location-with-website-settings`

→ `{ data: BusinessLocationWithWebsiteSettingsModel[] }`
```ts
{
  id: number;                       // ← this is the location_id everywhere
  name: string;
  latitude?: number | null;
  longitude?: number | null;
  coverage?: number | null;
  address?: string | null;
  website_settings: WebsiteSettingsModel | null;
}
```

`WebsiteSettingsModel` — fields the booking flow uses:
```ts
{
  is_master?: boolean;              // master group → books across child branches
  master_name?: string | null;      // localized display name (EN)
  master_name_ar?: string | null;   // localized display name (AR)
  master_branch_ids?: number[];     // child locations behind the master
  is_car_service: boolean;          // true → booking requires device_id (a car)
  is_visible?: boolean;
  branch_image?: string | null;
  latitude/longitude/coverage, address
}
```

**Display name rule** (`locationDisplayName`):
- `is_master` → `master_name_ar` (AR) / `master_name` (EN), fallback `name`.
- otherwise → `name`.

---

## 2. Step 1 — Service picker 🔓

### `GET /connector/api/services`

Two modes:

**Single branch** → `?location_id={id}`
→ `ServiceModel[]` (array or `{data:[…]}`):
```ts
{ id, name, mobile?: boolean, duration?: string, priceFrom?: number, icon?: string }
```

**Master group** → `?location_ids={id,id,id}` (comma-joined)
→ map keyed by location id:
```ts
{ "12": ServiceModel[], "34": ServiceModel[], ... }
```

**Frontend master logic** (`BookingPage`):
- If picked branch `website_settings.is_master` → `groupIds = [masterId, ...master_branch_ids]` → fetch `services?location_ids=…` → merge lists in candidate order (master first, dedup by `s.id`) → user can pick **multiple** services.
- For each service the UI shows which branch will take it = first candidate whose list contains `service_id` (same order the backend routes).
- Non-master branch → single `service_id` pick.

---

## 3. Step 2 — Date & time (local, no API)

The time step is a plain `<input type="date">` + `<input type="time">` — no slots endpoint. Values are joined into:
```
booking_start = "YYYY-MM-DD HH:mm:00"   // e.g. "2026-11-25 14:30:00"
```

---

## 4. Step 3 — Car picker (when required) 🔒

`device_id` (a customer car) is **required** when the booking may land on a car-service branch:

- single branch → `branch.website_settings.is_car_service`
- master → `is_car_service` on **any** candidate in `[master, ...master_branch_ids]`

Cars come from `GET /connector/api/Info/customer` → `cars[]` — `car.id` = `device_id`. No separate cars call is made in the wizard (add-car is `POST /connector/api/add/car` if needed).

---

## 5. Confirm — `POST /connector/api/add/booking` 🔒

**Request body** (`AddBookingBody`):
```ts
{
  location_id: number;              // picked branch (or master) id
  service_id?: number;              // single-branch flow
  service_ids?: number[];           // master flow — one booking per service
  booking_start: string;            // "YYYY-MM-DD HH:mm:00"
  device_id?: number;               // required for car-service branches
  booking_note?: string;
  send_notification?: boolean;      // storefront sends false
}
```

Storefront sends exactly:
```json
{
  "location_id": 12,
  "service_ids": [5, 7],            // or "service_id": 5 when not master
  "booking_start": "2026-11-25 14:30:00",
  "device_id": 8,
  "booking_note": "",
  "send_notification": false
}
```

**Response** — `{ data: AddBookingResultEntry[] }`, **one entry per booked service**:
```ts
{
  booking_id: number;
  location_id: number;              // the branch each service actually landed on
  location_name?: string;
  service_id: number;
  service_name?: string;
  booking_name?: string;
  booking_status?: string;
  duplicated?: boolean;             // duplicate booking, reused existing
}
```
- Master flow: backend auto-routes each `service_id` to the first branch offering it — `location_id`/`location_name` per entry tells you where it landed.
- Confirmation reference shown to the user: `BK-{id1}-{id2}-…` joined booking ids.

---

## 6. Mobile service / Rescue — `POST /connector/api/add/booking-pickup` 🔒

Used by the rescue form (`/rescue` + popup dialog). Same idea as booking but the service comes to the customer — needs address + geo + a car + login.

**Request body** (`AddBookingPickupBody`):
```ts
{
  contact_id?: number;              // user.id
  customer_name?: string;           // user.name
  customer_phone?: string;          // user.mobile
  service_id: number;               // required
  location_id?: number;             // optional preferred branch
  device_id?: number;               // customer car — required in UI
  booking_start?: string;           // "YYYY-MM-DD HH:mm:00"
  pickup_time?: string;             // same value sent
  address?: string;                 // auto-detected or typed
  pickup_address?: string;          // same value sent
  pickup_latitude?: number;         // browser geolocation
  pickup_longitude?: number;
  notes?: string;
}
```
→ `{ success, message, data? }` envelope. UI blocks submit until: logged in + car + service + (geo resolved **or** address ≥ 8 chars) + date + time.

---

## 7. My bookings — `GET /connector/api/customer/booking` 🔒

Profile → "حجوزاتي" tab.

→ `CustomerBookingModel[]` (bare array or `{data:[…]}`):
```ts
{
  id: number;
  job_sheet_no?: string | null;
  booking_status?: string | null;
  color?: string | null;            // hex for the status badge, e.g. "#FF0000"
  plate_number?: string | null;
  brand?: string | null;
  model?: string | null;
  service?: string | null;
  booking_note?: string | null;
  booking_start?: string | null;    // "YYYY-MM-DD HH:mm:ss"
  location?: string | null;
}
```
`color` is rendered as the status badge background — use it as-is, don't map statuses yourself.

---

## 8. Full flow

```
GET business-location-with-website-settings        (public) → pick branch
        │
        ├─ is_master? → GET services?location_ids=M,C1,C2    (public)
        └─ normal     → GET services?location_id=ID          (public)
        │
        ▼  pick date+time locally → "YYYY-MM-DD HH:mm:00"
        ▼  is_car_service → pick car (user.cars[].id = device_id)   (auth)
        ▼
POST add/booking { location_id, service_id(s), booking_start, device_id? }   (auth)
        └─ data[] = per-service booking_id + resolved location_name
        ▼
GET customer/booking                                (auth) → profile "حجوزاتي" list
```

## Related / legacy endpoints

| Endpoint | Status |
|---|---|
| `POST /connector/api/bookings` (`createBooking`) | exists in the client, **not used** by the current wizard — `add/booking` is the live path |
| `GET /contact/check/phone/joborder?id&phone` | job-order status check (last-4 mobile) — separate feature, see `API_DOCS.md` §13 |
| `POST /connector/api/pickup-requests` | older rescue endpoint; current rescue uses `add/booking-pickup` |

## Gotchas

- **`location_id` = the `id` from `business-location-with-website-settings`** — not the legacy `/branches` id.
- Master bookings return **an array in `data`** — a single booking returns entries too; always handle `data[]`, not a single object.
- `booking_start` is a **local datetime string**, not ISO/UTC — send exactly `"YYYY-MM-DD HH:mm:00"`.
- `device_id` is the car's `id` from `Info/customer.cars[]` — required only when the target branch (or any master candidate) has `is_car_service`.
- `send_notification: false` — the store sends its own WhatsApp confirmation instead of the backend notification.
