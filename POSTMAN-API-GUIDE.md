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

## 4. Categories (Public & Admin)

**Category types:** `main` = navbar categories (can have subcategories). `material` = material-wise categories (below hero, with image).

### 4.1 Public – List categories (no auth)

| Method | Endpoint | Auth | Query |
|--------|----------|------|-------|
| GET | `/api/categories` | No | optional `type=main` or `type=material` |

**Examples:**  
- GET `http://localhost:5000/api/categories` → all active categories (main include subCategories).  
- GET `http://localhost:5000/api/categories?type=main` → navbar categories with subCategories.  
- GET `http://localhost:5000/api/categories?type=material` → material-wise categories (for below-hero tiles).

**Success (200):** `{ "success": true, "categories": [ { "id", "uuid", "slug", "name", "description", "image", "type", "sortOrder", "subCategories"? } ] }`

---

### 4.2 Admin – List categories (protected)

| Method | Endpoint | Auth | Query |
|--------|----------|------|-------|
| GET | `/api/admin/categories` | **Admin token** | optional `type=main` or `type=material` |

**Header:** `Authorization: Bearer <adminAccessToken>`

**Success (200):** `{ "success": true, "categories": [ ... ] }`

---

### 4.3 Admin – Get category by ID

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/admin/categories/:id` | **Admin token** |

**Success (200):** `{ "success": true, "category": { ... } }`

---

### 4.4 Admin – Create category

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/api/admin/categories` | **Admin token** | JSON below |

**Body (raw JSON):**
```json
{
  "name": "Rudraksha",
  "slug": "rudraksha",
  "description": "Sacred beads",
  "image": "https://example.com/rudraksha.jpg",
  "type": "main",
  "status": "active",
  "sortOrder": 0
}
```
- `type`: `"main"` (navbar) or `"material"` (material-wise). Default `main`.  
- `slug`: optional; auto-generated from name if omitted.  
- `status`: `"active"` or `"inactive"`. Default `active`.

**Success (201):** `{ "success": true, "category": { ... } }`

---

### 4.5 Admin – Update category

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| PUT | `/api/admin/categories/:id` | **Admin token** | JSON (any subset of fields) |

**Body example:** `{ "name": "Rudraksha Beads", "sortOrder": 1 }`

**Success (200):** `{ "success": true, "category": { ... } }`

---

### 4.6 Admin – Delete category

| Method | Endpoint | Auth |
|--------|----------|------|
| DELETE | `/api/admin/categories/:id` | **Admin token** |

**Success (200):** `{ "success": true, "message": "Category deleted" }`

---

### 4.7 Admin – List subcategories of a category

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/admin/categories/:id/subcategories` | **Admin token** |

**Success (200):** `{ "success": true, "subCategories": [ ... ] }`

---

### 4.8 Admin – Subcategories CRUD

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| GET | `/api/admin/subcategories` | **Admin token** | optional query `parentId` or `categoryId` |
| GET | `/api/admin/subcategories/:id` | **Admin token** | — |
| POST | `/api/admin/subcategories` | **Admin token** | JSON below |
| PUT | `/api/admin/subcategories/:id` | **Admin token** | JSON (partial) |
| DELETE | `/api/admin/subcategories/:id` | **Admin token** | — |

**Create subcategory body:**
```json
{
  "parentId": 1,
  "name": "Rudraksha Beads",
  "slug": "beads",
  "description": "Optional",
  "image": "",
  "status": "active",
  "sortOrder": 0
}
```
Use `parentId` or `categoryId` (same thing).

**Success (201):** `{ "success": true, "subCategory": { ... } }`

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
9. **Public categories:** GET `/api/categories` or `/api/categories?type=main` or `?type=material`.
10. **Admin categories:** GET/POST `/api/admin/categories`, GET/PUT/DELETE `/api/admin/categories/:id` (with admin token).
11. **Admin subcategories:** GET/POST `/api/admin/subcategories`, GET/PUT/DELETE `/api/admin/subcategories/:id`, GET `/api/admin/categories/:id/subcategories`.

---

## Tips for your Postman collection

- **Environment:** Add variable `baseUrl` = `http://localhost:5000/api` and use `{{baseUrl}}/auth/...`.
- **Auth:** Create two env variables: `userToken` and `adminToken`. In the “Tests” tab of login/verify-otp scripts, run:
  - User: `pm.environment.set("userToken", pm.response.json().accessToken);`
  - Admin login: `pm.environment.set("adminToken", pm.response.json().accessToken);`
- **Protected requests:** Set Authorization to Bearer Token and value `{{userToken}}` or `{{adminToken}}`.
