# Authentication — Full API & Flow Documentation

Everything the storefront does for **Login**, **Register**, **Google sign-in**, and **Forgot password** — endpoints, request bodies, response shapes, and the exact decision logic the frontend applies.

## General

- **Base URL**: `https://erp.emadgad.com` (prod) / Vite proxy in dev.
- **Token**: a successful auth call returns a `token`. Store it (localStorage `emadgad-token`) and send `Authorization: Bearer <token>` on every authenticated request.
- **Token location varies**: it can be at `res.token`, `res.data.token`, or `res.data.data.token` — probe all three.
- **After login**: call `GET /connector/api/Info/customer` → `{ data: CustomerInfoModel }` (profile + `cars[]`).
- **Phones**: Egyptian mobiles are sent normalized to `+20xxxxxxxxxx` for social endpoints; password login accepts the raw `01xxxxxxxxx`.

---

## 1. Password Login

### `POST /contact/login`

**Request**
```json
{ "mobile": "01xxxxxxxxx", "password": "secret", "device_type": "web" }
```

**Response** (envelope varies)
```json
{ "success": true, "token": "<bearer-token>", "data": { "id": 123, "name": "...", "email": "...", "mobile": "..." } }
```
- `401/422` with a message on bad credentials — UI shows a generic "wrong mobile or password" error.
- `device_type` is always sent as `"web"`.

**Frontend flow** (`LoginPage` → `auth.tsx`):
1. `POST /contact/login` → `storeToken(res)`
2. `GET /connector/api/Info/customer` → user object cached in `AuthProvider`.

---

## 2. Register

### `POST /contact/signup-email`

**Request** — the register form collects first/last name and joins them:
```json
{ "mobile": "01xxxxxxxxx", "password": "min-6-chars", "name": "First Last", "email": "user@mail.com" }
```
(`name`/`email` optional per API but the UI requires all fields.)

**Response**: success envelope (no reliable token in the body).

**Frontend flow** (`auth.tsx` `register()`): 2-step chain —
1. `POST /contact/signup-email`
2. Immediately `POST /contact/login` with the same `{mobile, password}` to obtain the token (login identity is the mobile). If step 2 fails the account still exists — UI shows "account created, log in manually".

---

## 3. Forgot / Reset Password

Two public endpoints, SMS-based. The backend enforces a **30 s gap** between OTP requests (UI mirrors it with a resend cooldown). OTP is **5 digits**.

### `POST /contact/forgot-password`

**Request**
```json
{ "mobile": "01xxxxxxxxx" }
```
**Response**: success envelope — SMS with the OTP is sent to the mobile.

### `POST /contact/reset-password`

**Request**
```json
{ "mobile": "01xxxxxxxxx", "otp": "12345", "new_password": "new-secret" }
```
**Response**: success envelope → password changed; user logs in normally with `POST /contact/login`.

**Frontend flow** (`ForgotPasswordPage`):
`mobile → forgot-password → (OTP + new password + confirm) → reset-password → done → /login`

---

## 4. Google Sign-In (complete social flow)

The button runs Google Identity Services (`VITE_GOOGLE_CLIENT_ID` — Web client ID) using the **access-token client**, then drives a multi-step backend flow. Apple uses the same endpoints with `medium: 'apple'`.

`signInWithGoogle(clientId)` resolves with:
```ts
{ uniqueId: info.sub, email, name, token: accessToken }   // Google OAuth access token + userinfo
```

### Shared response model — `SocialAuthResponseModel`
```ts
{
  success?: boolean;
  token?: string | null;            // ← if present: LOGGED IN. Store & done.
  phone_exist?: boolean;
  is_new_user?: boolean;
  is_soft_deleted?: boolean;
  user_id?: number | null;
  action?: string;                  // e.g. 'confirm_ownership'
  message?: string;
  phone_already_linked?: boolean;
  existing_user?: { id: number; name?: string; phone?: string };
  pending_social_user?: { name?: string; email?: string };
  user?: { id, name, email, mobile, phone? };
}
```

**Response router** (applied after every social call):
1. `is_soft_deleted && user_id` → **restore screen** (step E).
2. `token` → **logged in, done**.
3. `phone_already_linked || action === 'confirm_ownership'` → **ownership-merge screen** (step C).
4. `success !== false` (no token) → **ask for phone** (step B).
5. otherwise → error message.

### Step A — `POST /connector/api/auth/social-customer-login`

**Request**
```json
{
  "medium": "google",
  "unique_id": "<google sub>",
  "email": "user@gmail.com",
  "name": "User Name",
  "token": "<google access token>"
}
```
(Apple: `{ medium: "apple", unique_id, email?, name?, authorization_code?, identity_token? }`.)

**Response** = `SocialAuthResponseModel`, routed as above.
- New user with no linked phone → no token → step B.
- Existing account → `token` → done.
- Soft-deleted → `is_soft_deleted: true` + `user_id` → step E.

### Step B — phone binding (new social user)

First check `GET /connector/api/otp-setting` → `{ enable_otp_for_social_login: boolean }` (defaults `true` on error).

`SocialPhoneBody`:
```ts
{ phone: "+20xxxxxxxxxx", email?, name?, medium?, unique_id?, user_id?, otp? }
```

**If OTP required** → `POST /connector/api/auth/send-phone-verification-otp` with `SocialPhoneBody` (no otp):
- returns `token` → done; `phone_already_linked`/`confirm_ownership` → step C; `is_soft_deleted` → step E; otherwise → OTP input screen.

Then `POST /connector/api/auth/verify-phone-and-set-mobile` with `SocialPhoneBody + { otp }`:
- `token` → done; `is_soft_deleted` → step E; else "wrong code".

**If OTP not required** → `POST /connector/api/auth/update-social-mobile` with `SocialPhoneBody` → route response normally.

### Step C — phone already linked to another account (merge)

Backend replied `phone_already_linked`/`action: 'confirm_ownership'` + `existing_user { id, name }`.

1. `POST /connector/api/auth/send-ownership-otp`
   ```json
   { "existing_user_id": 456, "phone": "+20xxxxxxxxxx" }
   ```
2. `POST /connector/api/auth/verify-and-merge-accounts`
   ```json
   {
     "existing_user_id": 456,
     "phone": "+20xxxxxxxxxx",
     "otp": "12345",
     "social_email": "user@gmail.com",
     "medium": "google",
     "unique_id": "<google sub>"
   }
   ```
   → `token` → the Google identity is merged into the existing phone account.

### Step D — feature flag

`GET /connector/api/otp-setting` → `{ enable_otp_for_social_login?: boolean }` — controls whether step B needs OTP verification or binds directly. Default `true` on error.

### Step E — soft-deleted account restore

When any step returns `is_soft_deleted: true` + `user_id`:

1. `POST /connector/api/auth/restore-deleted-account`
   ```json
   { "user_id": 789 }
   ```
2. **Replay** `POST /connector/api/auth/social-customer-login` with the original Google payload (including `token`) → now returns a `token` → done.

### Flow diagram

```
signInWithGoogle() → { uniqueId, email, name, token }
        │
        ▼
POST social-customer-login
        ├─ token ────────────────────────────► DONE (store token, GET Info/customer)
        ├─ is_soft_deleted ──► restore-deleted-account → replay login → token → DONE
        ├─ phone_already_linked/confirm_ownership
        │      └─► send-ownership-otp → verify-and-merge-accounts → token → DONE
        └─ (no token, success)
               └─► ask phone → otp-setting?
                      ├─ true  → send-phone-verification-otp → verify-phone-and-set-mobile → token → DONE
                      └─ false → update-social-mobile → route again
```

### Endpoint summary table

| Endpoint | Method | Body | Returns |
|---|---|---|---|
| `/connector/api/auth/social-customer-login` | POST | `{medium, unique_id, email?, name?, token?, authorization_code?, identity_token?}` | `SocialAuthResponseModel` |
| `/connector/api/otp-setting` | GET | — | `{enable_otp_for_social_login}` |
| `/connector/api/auth/update-social-mobile` | POST | `SocialPhoneBody` | `SocialAuthResponseModel` |
| `/connector/api/auth/send-phone-verification-otp` | POST | `SocialPhoneBody` | `SocialAuthResponseModel` |
| `/connector/api/auth/verify-phone-and-set-mobile` | POST | `SocialPhoneBody + otp` | `SocialAuthResponseModel` |
| `/connector/api/auth/send-ownership-otp` | POST | `{existing_user_id, phone}` | success envelope |
| `/connector/api/auth/verify-and-merge-accounts` | POST | `{existing_user_id, phone, otp, social_email?, medium?, unique_id?}` | `SocialAuthResponseModel` |
| `/connector/api/auth/restore-deleted-account` | POST | `{user_id}` | success envelope |

---

## 5. Legacy / extra auth endpoints (available, not on the main UI path)

| Endpoint | Body | Notes |
|---|---|---|
| `POST /auth/check-phone` | `{mobile}` | `{userFound, result, code, name, isSoftDeleted?, userId?, message?}` — can gate login vs register |
| `POST /auth/verify-otp` | `{mobile/code…}` | generic OTP verification |
| `PUT /connector/api/contactapi/{id}/basic-info` 🔒 | `{first_name,last_name,mobile,email?}` | profile edit after login |

## Gotchas

- **`success` isn't always boolean** (e.g. job-order phone-check returns a string) — social responses should be routed on `token` / flags, not `success` alone.
- **Every social call can return a `token` at any step** — always check `res.token` first.
- `verifyPhoneAndSetMobile` and merge errors come back in `message` — show them as "wrong code" style errors.
- OTP lengths differ per flow: forgot-password = **5 digits**, social phone bind accepts 4–6.
- After any token is stored: call `GET /connector/api/Info/customer` to hydrate the profile.
