# Category Module Documentation

## Overview

The Category module manages category CRUD operations, including optional Cloudinary image upload for create/update.

Base path:

- `/api/v1/category`

Goals:

- Secure admin-only write operations
- Optional image upload support without breaking JSON clients
- Slug-based category identity for filtering and clean URLs
- Safe image replacement on update (old image deletion)

---

## Architecture

Files:

- `src/app/modules/category/category.route.ts`
- `src/app/modules/category/category.controller.ts`
- `src/app/modules/category/category.service.ts`
- `src/app/modules/category/category.validation.ts`

Shared dependencies:

- `src/app/middlewares/fileUpload.ts` (`upload.single("image")`)
- `src/helpers/parseMultipartData.ts` (parse `data` JSON in multipart)
- `src/helpers/fileUploader.ts` (Cloudinary upload + delete)
- `src/utils/slug.ts` (unique slug generation)

---

## API Endpoints

### 1) Create Category

- **POST** `/api/v1/category`
- Access: Protected (`ADMIN`, `SUPER_ADMIN`)
- Supports both:
  - `application/json`
  - `multipart/form-data` with `data` + optional `image`
- Middleware chain:
  1. `auth(Role.ADMIN, Role.SUPER_ADMIN)`
  2. `upload.single("image")`
  3. `parseMultipartData`
  4. `validateRequest(CategoryValidation.create)`

Request body:

```json
{
  "name": "Laptops"
}
```

Multipart fields:

- `data` (text): stringified JSON body
- `image` (file): optional image file

Business rules:

- Category name must be unique
- Slug is auto-generated from `name`
- If image provided, uploaded URL is stored in `image`

---

### 2) Get All Categories

- **GET** `/api/v1/category`
- Access: Public
- Returns all categories sorted by `createdAt desc`

---

### 3) Get Single Category

- **GET** `/api/v1/category/:id`
- Access: Public
- Validation: `id` is required

---

### 4) Update Category

- **PATCH** `/api/v1/category/:id`
- Access: Protected (`ADMIN`, `SUPER_ADMIN`)
- Supports both:
  - `application/json`
  - `multipart/form-data` with `data` + optional `image`

Rules:

- If `name` is changed, slug is regenerated
- If a new image is uploaded:
  - new image is uploaded to Cloudinary
  - previous Cloudinary image is deleted
  - `image` field is updated with new URL
- If no image is uploaded, existing `image` remains unchanged

---

### 5) Delete Category

- **DELETE** `/api/v1/category/:id`
- Access: Protected (`ADMIN`, `SUPER_ADMIN`)
- Deletes category record from DB

---

## Validation Rules

- `name`: 2-50 characters (trimmed)
- `file` (optional): must be image MIME type
- `id` param: required for get/update/delete

---

## Common Error Cases

- Duplicate category name on create
- Invalid image file type
- Invalid JSON in multipart `data` field
- Category not found for update/delete operations
