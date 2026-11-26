# Add Car — API Documentation

Everything behind the "أضف عربية" dialog in the profile: brand/model picklists, the create call, and how the new car becomes usable (`device_id` for booking & odometer).

## Auth summary

| Endpoint | Auth? |
|---|---|
| `brands` | 🔓 public |
| `models/{brand_id}` | 🔓 public |
| `add/car` | 🔒 Bearer token |
| `Info/customer` (refetch cars) | 🔒 Bearer token |

---

## 1. Brands picklist — `GET /connector/api/brands?business_id=1` 🔓

→ bare array **or** `{ data: [...] }` — handle both:

```ts
{
  id: number;          // ← brand_id in the POST body
  name: string;        // "Toyota", "هيونداي"…
  image?: string;
  logo?: string;
  features: number;
}
```

## 2. Models picklist — `GET /connector/api/models/{brand_id}?business_id=1` 🔓

Fetched **only after a brand is picked** (dependent select). Response is the most inconsistent of the three — may be `{ models: [...] }`, `{ data: [...] }`, or a bare array:

```ts
{
  id: number;          // ← model_id in the POST body
  name: string;        // "Corolla"…
  brandId: number;     // the brand it belongs to
}
```

```bash
GET /connector/api/models/5?business_id=1
```

## 3. Create — `POST /connector/api/add/car` 🔒

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body — all 7 fields are sent, no optional omissions:**

```json
{
  "plate_number": "أ ب ج 1234",
  "brand_id": 5,
  "model_id": 42,
  "manufacturing_year": "2019",
  "color": "أسود",
  "chassis_number": "-",
  "car_type": "ملاكي"
}
```

| field | type | notes |
|---|---|---|
| `plate_number` | string | UI sends `"بدون لوحة"` if left empty |
| `brand_id` | number | from `brands[].id` — **required in UI** |
| `model_id` | number | from `models[].id` — **required in UI** |
| `manufacturing_year` | string (not number) | e.g. `"2019"` — **required in UI** |
| `color` | string | UI sends `"غير محدد"` if left empty |
| `chassis_number` | string | not in the UI — hardcoded `"-"` |
| `car_type` | string | not in the UI — hardcoded `"ملاكي"` (private/sedan) |

**Response:** generic envelope — `{ success, message, data? }`. The storefront doesn't read fields from it; on success it just **refetches `GET /connector/api/Info/customer`** to get the updated `cars[]`.

## 4. The car comes back via `Info/customer` → `cars[]`

```ts
{
  id: number;              // ← device_id: used in booking, odometer, pickup
  model: string;
  brand_name?: string;     // also sent as car_brand / make — read whichever exists
  car_logo: string | null;
  car_image: string | null;
  color: string;
  plate_number: string;
  manufacturing_year: string;
  chassis_number: string;
  car_type: string;
  vin_model_code: string;
  device: string;
  motor_cc: string | null;
  model_image: string | null;
  tax: string | null;
}
```

**`car.id` is the `device_id`** used by:
- `POST /connector/api/add/booking` (`device_id` for car-service branches)
- `POST /connector/api/add/booking-pickup`
- `GET/POST /connector/api/contact-km?device_id=` (per-car odometer)

## 5. Flow

```
GET brands?business_id=1            → pick brand
GET models/{brand_id}?business_id=1 → pick model (dependent — reset on brand change)
        ▼  user types year + plate (+ optional color)
POST add/car { plate_number, brand_id, model_id,
               manufacturing_year, color, chassis_number, car_type }
        ▼
GET Info/customer                   → cars[] refreshed → new car.id = device_id
```

## Gotchas

- **Required in practice:** only `brand_id`, `model_id`, `manufacturing_year` gate the submit button — the rest get fallback strings.
- `manufacturing_year` is a **string** — don't send a number.
- `chassis_number` and `car_type` aren't collected in the UI; the API expects them, so always send placeholders.
- There's **no update/delete car endpoint** in the current client — add + refetch only.
- The `models` response envelope varies (`models` / `data` / bare array) — normalize like `getModels()` does.
