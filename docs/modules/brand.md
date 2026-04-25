# Brand Module Documentation

## Overview

The Brand module handles brand CRUD operations, including optional Cloudinary image upload for create/update.

Base path:

- `/api/v1/brand`

Goals:

- Secure admin-only write operations
- Optional image upload with backward-compatible JSON requests
- Slug generation from brand name
- Safe image replacement by deleting old Cloudinary assets

---

## Architecture

Files:

- `src/app/modules/brand/brand.route.ts`
- `src/app/modules/brand/brand.controller.ts`
- `src/app/modules/brand/brand.service.ts`
- `src/app/modules/brand/brand.validation.ts`

Shared dependencies:

- `src/app/middlewares/fileUpload.ts` (`upload.single("image")`)
- `src/helpers/parseMultipartData.ts` (parse multipart `data`)
- `src/helpers/fileUploader.ts` (Cloudinary upload + delete)
- `src/utils/slug.ts` (slug generation)

---

## API Endpoints

### 1) Create Brand

- **POST** `/api/v1/brand`
- Access: Protected (`ADMIN`, `SUPER_ADMIN`)
- Supports both:
  - `application/json`
  - `multipart/form-data` with `data` + optional `image`
- Middleware chain:
  1. `auth(Role.ADMIN, Role.SUPER_ADMIN)`
  2. `upload.single("image")`
  3. `parseMultipartData`
  4. `validateRequest(BrandValidation.create)`

Request body:

```json
{
  "name": "Apple"
}
```

Multipart fields:

- `data` (text): stringified JSON body
- `image` (file): optional image file

Business rules:

- Brand name must be unique
- Slug is auto-generated from `name`
- If image provided, URL is saved in `image`

---

### 2) Get All Brands

- **GET** `/api/v1/brand`
- Access: Public
- Returns all brands sorted by `createdAt desc`

---

### 3) Get Single Brand

- **GET** `/api/v1/brand/:id`
- Access: Public
- Validation: `id` is required

---

### 4) Update Brand

- **PATCH** `/api/v1/brand/:id`
- Access: Protected (`ADMIN`, `SUPER_ADMIN`)
- Supports both:
  - `application/json`
  - `multipart/form-data` with `data` + optional `image`

Rules:

- If `name` changes, slug is regenerated
- If a new image is uploaded:
  - new image is uploaded to Cloudinary
  - previous Cloudinary image is deleted
  - `image` is replaced with new URL
- If no image is uploaded, existing `image` remains unchanged

---

### 5) Delete Brand

- **DELETE** `/api/v1/brand/:id`
- Access: Protected (`ADMIN`, `SUPER_ADMIN`)
- Deletes brand record from DB

---

## Validation Rules

- `name`: 2-50 characters (trimmed)
- `file` (optional): must be image MIME type
- `id` param: required for get/update/delete

---

## Common Error Cases

- Duplicate brand name on create
- Invalid image file type
- Invalid JSON in multipart `data` field
- Brand not found for update/delete operations
