# 🛒 E-Commerce + Inventory Management System

> A scalable, production-ready backend system built step-by-step — designed for real business use.

![Status](https://img.shields.io/badge/Status-In%20Progress-yellow)
![Phase](https://img.shields.io/badge/Phase%201-Authentication%20✅-brightgreen)
![Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20PostgreSQL%20%7C%20Prisma-blue)

---

## 📌 Overview

This is a **solo developer challenge** to build a full-featured E-Commerce and Inventory Management backend from the ground up — developed in phases, just like real production systems.

**Core focus areas:**
- Clean, maintainable architecture
- Scalability and performance
- Real-world use cases for actual business owners
- Developer-friendly structure

---

## 🗺️ Project Phases

| Phase | Title | Status |
|-------|-------|--------|
| 1 | Authentication System | ✅ Complete |
| 2 | Product & Category | 🚧 Upcoming |
| 3 | Inventory Management | 🚧 Upcoming |
| 4 | Cart & Orders | 🚧 Upcoming |
| 5 | Payment Integration | 🚧 Upcoming |
| 6 | Advanced Security | 🚧 Upcoming |

---

## 🔐 Phase 1: Authentication System

### Features

#### 👤 User System
- User registration with or without a password
- Phone-based unique identity
- Optional password support for guest-to-full account upgrades

#### 🔐 Authentication
- JWT-based authentication
- HTTP-only cookie sessions
- Secure login and logout

#### 🟢 Guest User System
- Register with name and phone only (no password required)
- Instant access to dashboard and order-related features
- Upgrade to a full account at any time by setting a password

#### 🔄 Login System
- Phone number login
- Supports Bangladeshi 🇧🇩 and international 🌍 numbers

#### 🍪 Cookie Management
- HTTP-only cookies
- `sameSite` CSRF protection
- Secure configuration for production environments

#### 🛡️ Security
- Password hashing with bcrypt
- JWT verification middleware
- Role-based authorization (`USER` / `ADMIN`)
- Basic XSS and CSRF protection

#### 🧠 Architecture
- **Service layer** — business logic
- **Controller layer** — HTTP handling
- **Middleware** — auth and validation
- **Utilities** — reusable JWT and cookie helpers

---

### 🔁 Authentication Flows

**Guest User Flow**
1. Register with name and phone number
2. Receive access token immediately
3. Access dashboard and order features
4. Optionally set a password to upgrade to a full account

**Full User Flow**
1. Register or log in with phone and password
2. Receive full account access
3. Secure session maintained via HTTP-only cookies

---

### 🧪 API Testing

All endpoints are tested using Postman:

- `POST` Register (guest + full user)
- `POST` Login
- `GET` Protected routes
- `POST` Logout
- Cookie-based authentication flows

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT |
| Validation | Zod |
| Security | bcrypt, cookie-parser |

---

## 🚧 Upcoming Phases

### Phase 2 — Product & Category
- Product CRUD operations
- Category management system
- Search and filtering

### Phase 3 — Inventory
- Real-time stock tracking
- Inventory update workflows
- Activity logs

### Phase 4 — Cart & Orders
- Cart management system
- Checkout flow
- Order tracking

### Phase 5 — Payment
- Payment gateway integration
- Order confirmation and receipts

### Phase 6 — Advanced Security
- OTP verification
- Refresh token rotation
- Rate limiting

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-link>
cd <project-folder>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_secret
```

### 4. Run database migrations

```bash
npx prisma migrate dev
```

### 5. Start the development server

```bash
npm run dev
```

---

## 🤝 Contributing

Contributions are welcome! This is an open-source project and any kind of help is appreciated.

### How to Contribute

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create a branch** for your feature:

```bash
git checkout -b feature/your-feature-name
```

4. **Make your changes**
5. **Commit** with a meaningful message:

```bash
git commit -m "feat: describe your change"
```

6. **Push** to your branch:

```bash
git push origin feature/your-feature-name
```

7. **Open a Pull Request**

### Guidelines

- Follow the existing code structure and naming conventions
- Write clean, readable, and well-commented code
- Keep PRs small and focused on a single concern
- Use meaningful commit messages (e.g., `feat:`, `fix:`, `refactor:`)

### Good First Issues

New to the project? Start here:

- Improve input validation
- Enhance error handling and messages
- Add small utility features
- Refactor and clean up existing code

---

## 📌 Notes

- This project is actively developed and will be updated regularly
- Code will be improved and refactored as each phase progresses
- Feedback and suggestions are highly appreciated

---

## 🎯 Goal

Build a **production-ready, scalable E-Commerce + Inventory Management system** that follows real-world backend engineering best practices — usable by actual businesses.

---

## ⭐ Support

If you find this project useful:

- Give it a **star** ⭐
- Share it with others
- Open an issue or PR to contribute

---

## 🔗 Links

- **Repository:** *([Add your GitHub link here](https://github.com/naeemul-online/E-Commerce-and-Inventory-Management-System.git))*
- **Author:** *(Naeemul.Developer)*