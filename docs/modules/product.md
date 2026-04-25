# Product Module Documentation

## Overview

The Product module handles product CRUD, listing with filters/sorting/pagination, and search autocomplete support.

Base paths:

- `/api/v1/product`
- `/api/v1/products` (alias)

Goals:

- Secure admin-only write operations
- Reusable query and search architecture
- Cloudinary-backed image uploads
- Frontend-optimized search results

---

## Architecture

Files:

- `src/app/modules/product/product.route.ts`
- `src/app/modules/product/product.controller.ts`
- `src/app/modules/product/product.service.ts`
- `src/app/modules/product/product.validation.ts`

Shared dependencies:

- `src/shared/queryBuilder.ts` (generic parsers + product mapper)
- `src/shared/searchService.ts` (reusable model search utility)
- `src/helpers/fileUploader.ts` (Cloudinary upload)
- `src/app/middlewares/fileUpload.ts` (multer disk upload)
- `src/app/middlewares/rateLimiter.ts` (`searchLimiter`)
- `src/utils/slug.ts` (unique slug generation)

---

## API Endpoints

### 1) Create Product

- **POST** `/api/v1/products`
- Access: Protected (`ADMIN`, `SUPER_ADMIN`)
- Content-Type: `multipart/form-data`
- Middleware chain:
  1. `auth(Role.ADMIN, Role.SUPER_ADMIN)`
  2. `upload.array("images", 6)`
  3. `parseMultipartData` (parse `data` JSON string)
  4. `validateRequest(ProductValidation.create)`

Form-data structure:

- `data` (text): stringified JSON payload
- `images` (files): 1..6 image files

`data` example:

```json
{
  "title": "MacBook Pro M3",
  "description": "High performance laptop",
  "regularPrice": 2500,
  "discountedPrice": 2300,
  "stock": 15,
  "isNew": true,
  "isOffered": true,
  "categoryId": "clx123abc456def78",
  "brandId": "clx987xyz654uvw32",
  "tags": ["apple", "laptop"]
}
```

Business rules:

- At least one image required
- `discountedPrice < regularPrice`
- `categoryId` and `brandId` must exist in DB
- Slug auto-generated from title
- Images uploaded to Cloudinary and stored as `secure_url[]`

---

### 2) Get Products (Listing)

- **GET** `/api/v1/products`
- Access: Public

Query params:

- `page` (default: `1`)
- `limit` (default: `5`)
- `sort` (`latest`, `oldest`, `price_high_low`, `price_low_high`)
- `category` (category slug)
- `brand` (brand slug)
- `minPrice`
- `maxPrice`
- `isNew` (`true|false`)
- `isOffered` (`true|false`)

Response meta:

- `totalData`
- `totalPages`
- `currentPage`
- `limit`

---

### 3) Search Products (Autocomplete)

- **GET** `/api/v1/products/search?searchTerm=...`
- Access: Public
- Protection: `searchLimiter` applied
- Validation: `searchTerm` required, trimmed, min 2 chars

Search behavior:

- Fields: `title`, `description`
- Matching: Prisma `contains` with `mode: "insensitive"`
- Result ranking for better dropdown relevance:
  - exact title match
  - title starts with term
  - title contains term
  - description contains term

Response shape (optimized for frontend search dropdown):

```json
[
  {
    "id": "cm123...",
    "title": "MacBook Pro M3",
    "slug": "macbook-pro-m3",
    "images": ["https://res.cloudinary.com/..."],
    "price": 2500
  }
]
```

---

### 4) Get Single Product

- **GET** `/api/v1/products/:slug`
- Validation: slug is required
- Access: Public

---

### 5) Update Product

- **PATCH** `/api/v1/products/:id`
- Access: Protected (`ADMIN`, `SUPER_ADMIN`)
- Supports `multipart/form-data` (`data` + optional `images`)

Rules:

- Optional slug regeneration when title changes
- Optional category/brand existence re-check
- Optional price rule re-check (`discountedPrice < regularPrice`)
- When images uploaded:
  - old Cloudinary images are deleted
  - stored image list is replaced with new Cloudinary URLs

---

### 6) Delete Product

- **DELETE** `/api/v1/products/:id`
- Access: Protected (`ADMIN`, `SUPER_ADMIN`)

---

## Reusable Building Blocks

### Query Builder

`src/shared/queryBuilder.ts` provides:

- generic parsers: number, boolean, trimmed string
- reusable pagination parser with strict allowed limits
- reusable sort option parser
- module-specific mapper: `buildProductQuery`

This pattern keeps parsing DRY while allowing each module to define custom filters safely.

### Search Service

`src/shared/searchService.ts` provides:

```ts
searchService.search({
  model: "product",
  fields: ["title", "description"],
  searchTerm,
  select: { ... },
  take: 12
});
```

Reusable for `category`, `brand`, and future modules.

---

## Security and Stability Notes

- Admin-only write operations for products
- Search endpoint is rate-limited
- Input validation with Zod for params/query/body/files
- Defensive business validation in service layer (not only request layer)
- Cloudinary upload cleanup is handled in uploader helper

---

## Common Error Cases

- Invalid JSON in form-data `data` field
- Missing `searchTerm` or too short
- Missing images on product create
- Invalid `categoryId` or `brandId`
- Invalid price relation (`discountedPrice >= regularPrice`)
- Product not found on get/update/delete

---

## Frontend Integration Tips

- Use debounced search (250ms-400ms) for autocomplete
- Navigate to details page by `slug`
- Use listing API meta for robust pagination UI
