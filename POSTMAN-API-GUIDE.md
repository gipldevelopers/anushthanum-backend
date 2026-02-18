# Anushthanum Backend – Postman API Guide

**Base URL:** `http://localhost:5000/api`  
**Content-Type:** `application/json` for all request bodies.

---

## 1. Health

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| GET | `/api/health` | No | — |

**Postman:** GET `http://localhost:5000/api/health`  
**Success (200):** `{ "success": true, "message": "Anushthanum API", "timestamp": "..." }`

---

## 2. User (Customer) Auth

### 2.1 Register (sends OTP to email)

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/api/auth/register` | No | JSON below |

**Body (raw JSON):**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "phone": "",
  "password": "min6chars"
}
```

**Success (201):** `{ "success": true, "message": "...", "email": "..." }`  
*(In dev, response may include `devOtp` for testing.)*

---

### 2.2 Send OTP

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/api/auth/send-otp` | No | JSON below |

**Body:**
```json
{ "email": "user@example.com" }
```

---

### 2.3 Verify OTP (complete signup / get user + token)

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/api/auth/verify-otp` | No | JSON below |

**Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Success (200):** `{ "success": true, "user": {...}, "accessToken": "..." }`  
**Use:** Copy `accessToken` for **User** protected requests.

---

### 2.4 User Login

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/api/auth/login` | No | JSON below |

**Body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Success (200):** `{ "success": true, "user": {...}, "accessToken": "..." }`

---

### 2.5 Get current user (protected)

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| GET | `/api/auth/me` | **User token** | — |

**Header:**  
`Authorization: Bearer <accessToken>`

**Postman:** Auth tab → Type: Bearer Token → Token: paste `accessToken` from login/verify-otp.

**Success (200):** `{ "success": true, "user": {...} }`

---

## 3. Admin Auth

### 3.1 Admin Login

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/api/auth/admin/login` | No | JSON below |

**Body:**
```json
{
  "email": "admin@anushthanum.com",
  "password": "Admin@123"
}
```

*(Use seeded admin or your own. Default seed: `admin@anushthanum.com` / `Admin@123`.)*

**Success (200):** `{ "success": true, "admin": {...}, "accessToken": "..." }`  
**Use:** Copy `accessToken` for **Admin** protected requests.

---

### 3.2 Get current admin (protected)

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| GET | `/api/auth/admin/me` | **Admin token** | — |

**Header:**  
`Authorization: Bearer <adminAccessToken>`

**Postman:** Auth → Bearer Token → paste admin `accessToken`.

**Success (200):** `{ "success": true, "admin": {...} }`

---

## Quick checklist for Postman

1. **Health:** GET `http://localhost:5000/api/health`
2. **User register:** POST `/api/auth/register` with name, email, password (and optional phone).
3. **Send OTP:** POST `/api/auth/send-otp` with `{ "email": "..." }`.
4. **Verify OTP:** POST `/api/auth/verify-otp` with `email` + `otp` → save `accessToken`.
5. **User login:** POST `/api/auth/login` with email, password → save `accessToken`.
6. **User me:** GET `/api/auth/me` with header `Authorization: Bearer <user accessToken>`.
7. **Admin login:** POST `/api/auth/admin/login` with admin email/password → save `accessToken`.
8. **Admin me:** GET `/api/auth/admin/me` with header `Authorization: Bearer <admin accessToken>`.

---

## Tips for your Postman collection

- **Environment:** Add variable `baseUrl` = `http://localhost:5000/api` and use `{{baseUrl}}/auth/...`.
- **Auth:** Create two env variables: `userToken` and `adminToken`. In the “Tests” tab of login/verify-otp scripts, run:
  - User: `pm.environment.set("userToken", pm.response.json().accessToken);`
  - Admin login: `pm.environment.set("adminToken", pm.response.json().accessToken);`
- **Protected requests:** Set Authorization to Bearer Token and value `{{userToken}}` or `{{adminToken}}`.
