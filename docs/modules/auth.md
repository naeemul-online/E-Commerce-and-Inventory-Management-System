# Auth Module Documentation

## Overview

The Auth module provides registration, login, guest login, password setup, token refresh, logout, and profile retrieval.

Base path:

- `/api/v1/auth`

Core goals:

- Phone-based authentication (E.164 normalized)
- JWT-based access + refresh token handling
- HTTP-only cookie session support
- Role-protected profile endpoint

---

## Architecture

Files:

- `src/app/modules/auth/auth.route.ts`
- `src/app/modules/auth/auth.controller.ts`
- `src/app/modules/auth/auth.service.ts`
- `src/app/modules/auth/auth.validation.ts`

Supporting shared pieces:

- `src/app/middlewares/auth.ts`
- `src/app/middlewares/validateRequest.ts`
- `src/shared/sendResponse.ts`
- `src/utils/jwtHelpers.ts`
- `src/utils/cookieHelpers.ts`

Pattern:

1. **Route layer**: endpoint + middleware composition
2. **Validation layer**: Zod input validation and phone normalization
3. **Controller layer**: HTTP transport and consistent response shape
4. **Service layer**: business logic + DB operations

---

## API Endpoints

### 1) Register User

- **POST** `/api/v1/auth/register`
- Validation: `AuthValidation.register`
- Access: Public

Request body:

```json
{
  "phone": "+8801712345678",
  "fullName": "John Doe",
  "password": "123456"
}
```

Behavior:

- Validates and normalizes phone format
- Rejects existing phone
- Hashes password
- Creates user with `Role.USER`
- Creates refresh token row
- Sets auth cookies

---

### 2) Login

- **POST** `/api/v1/auth/login`
- Validation: `AuthValidation.login`
- Access: Public

Request body:

```json
{
  "phone": "+8801712345678",
  "password": "123456"
}
```

Behavior:

- Verifies account and password
- Issues access/refresh token
- Persists refresh token
- Sets auth cookies

---

### 3) Guest Login

- **POST** `/api/v1/auth/guest-login`
- Validation: `AuthValidation.guest`
- Access: Public

Request body:

```json
{
  "phone": "+8801712345678",
  "fullName": "Guest User"
}
```

Behavior:

- Creates user if not found (without password)
- Issues access/refresh token
- Sets auth cookies

---

### 4) Set Password

- **POST** `/api/v1/auth/set-password`
- Validation: `AuthValidation.setPassword`
- Access: Public (for guest upgrade flow)

Request body:

```json
{
  "phone": "+8801712345678",
  "password": "123456"
}
```

Behavior:

- Hashes and sets password for existing user
- Issues fresh tokens
- Sets auth cookies

---

### 5) Refresh Token

- **POST** `/api/v1/auth/refresh-token`
- Validation: `AuthValidation.refreshToken`
- Access: Public (requires refresh token)

Request body (optional when cookie exists):

```json
{
  "refreshToken": "jwt-refresh-token"
}
```

Behavior:

- Verifies refresh token signature
- Verifies refresh token DB record + expiry
- Returns new access token

---

### 6) Logout

- **POST** `/api/v1/auth/logout`
- Access: Public (best effort logout)

Request body (optional when cookie exists):

```json
{
  "refreshToken": "jwt-refresh-token"
}
```

Behavior:

- Deletes refresh token entry (if provided/found)
- Clears auth cookies

---

### 7) Get Profile

- **GET** `/api/v1/auth/profile`
- Access: Protected (`ADMIN`, `SUPER_ADMIN`, `USER`)

Behavior:

- Reads `req.user` from JWT auth middleware
- Returns minimal profile data

---

## Validation Rules

Phone:

- Uses `libphonenumber-js`
- Normalized to E.164 format
- Invalid formats rejected

Password:

- Minimum 6 characters
- Maximum 8 characters (current implementation)

Profile & role:

- Role checks are enforced by `auth(...)` middleware

---

## Security Notes

- Passwords hashed with `bcryptjs`
- Access and refresh tokens are separate
- Refresh token persisted and invalidated on logout
- Cookies are HTTP-only (configured by cookie helper)
- Unauthorized and forbidden access are blocked in middleware

---

## Standard Success Response Shape

```json
{
  "success": true,
  "message": "Operation message",
  "meta": null,
  "data": {}
}
```

---

## Known Improvements (Planned)

- Enforce stronger password policy (8+ with complexity)
- Add device/session tracking for refresh tokens
- Add refresh token rotation and reuse-detection
- Add endpoint-specific auth rate limiting on login/refresh
