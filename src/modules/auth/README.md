# Auth API

Base URL: `http://localhost:5000/api/auth` (or your `BACKEND_URL`)

- OTP is stored on the **User** model (`emailOtp`, `emailOtpExpires`, `otpLastSentAt`, `otpAttempts`).
- OTP is sent via **SMTP** (see `.env`: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL`, `FROM_NAME`).
- In development, `devOtp` is included in register/send-otp responses when NODE_ENV=development.

## Endpoints

### POST /register
Create account and send OTP to email.

**Body:** `{ name, email, phone?, password }`

**Response:** `{ success, message, userId, email, devOtp? }`  
- In development, `devOtp` is included so you can verify without email.

---

### POST /send-otp
Resend OTP to an existing user's email.

**Body:** `{ email }`

**Response:** `{ success, message, devOtp? }`

---

### POST /verify-otp
Verify OTP and get user + JWT.

**Body:** `{ email, otp }` (otp = 6 digits)

**Response:** `{ success, message, user, accessToken }`

---

### POST /login
Sign in with email and password.

**Body:** `{ email, password }`

**Response:** `{ success, message, user, accessToken }`

---

### GET /me
Get current user. Requires header: `Authorization: Bearer <accessToken>`.

**Response:** `{ success, user }`

---

## User object (in responses)

- `id`, `uuid`, `slug`, `email`, `name`, `phone`, `avatar`, `memberSince`, `spiritualLevel`, `emailVerified`

## Frontend usage

1. **Sign up:** POST /register → show OTP dialog → POST /verify-otp with `email` + `otp` → store `accessToken` and `user`, redirect to profile.
2. **Sign in:** POST /login → store `accessToken` and `user`, redirect to profile.
3. **Authenticated requests:** Send `Authorization: Bearer <accessToken>` for /me and other protected routes.
