# MallShop (モールショップ)

A full-stack Japanese-style online shopping mall.

**Live:** https://mallshop-8yc7f8h5b-zinwaiwainwe9999-8293s-projects.vercel.app/

## Architecture

```
onestopmarket/
├── frontend/          Next.js 15 (App Router) — Vercel
├── backend/           NestJS + Prisma — AWS EC2 (PM2)
├── infrastructure/    AWS provisioning
├── deployment/        Deploy scripts
├── docs/              Design docs (PDF)
└── docker-compose.yml Local PostgreSQL + Adminer
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Zustand, React Query |
| Backend | NestJS, Prisma ORM, PostgreSQL |
| Database | PostgreSQL (AWS RDS) |
| Payments | Stripe |
| Infra | AWS EC2, RDS, Vercel, PM2, Docker |

## Features

- Product catalog with categories, search, filters, and pagination
- Shopping cart with quantity management
- Multi-step checkout (address, delivery, payment, confirmation)
- Order history with status tracking and invoice download
- User profiles with structured Japanese-style name/address fields
- Favorites/wishlist
- Coupon system (acquire, apply at checkout)
- Hot deals page with discount pricing
- Admin dashboard (products, categories, orders, users)
- JWT authentication with role-based access (CUSTOMER / ADMIN)
- Support/FAQ, About, Terms, Privacy, Legal pages

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home |
| `/products` | Product listing |
| `/products/[id]` | Product detail |
| `/hot-deals` | Sales & deals |
| `/cart` | Shopping cart |
| `/checkout` | Checkout flow |
| `/checkout/complete` | Order confirmation |
| `/favorites` | Wishlist |
| `/mypage` | Account dashboard |
| `/mypage/profile` | Profile (name, address, phone) |
| `/mypage/orders` | Order history & invoices |
| `/mypage/password` | Password change |
| `/mypage/coupons` | Coupon acquisition & management |
| `/admin` | Admin dashboard |
| `/admin/products` | Product CRUD |
| `/admin/categories` | Category CRUD |
| `/admin/orders` | Order management |
| `/admin/users` | User & role management |
| `/support` | FAQ |
| `/about` | Company info |
| `/terms` | Terms of service |
| `/privacy` | Privacy policy |
| `/legal` | Legal notice |
| `/login` | Login |
| `/register` | Registration |

## Database Schema

User, Product, Category, Cart, CartItem, Order, OrderItem, Favorite, Coupon, UserCoupon

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (or use Docker)

### 1. Database (local)

```bash
docker compose up -d
```

Adminer: http://localhost:8080

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # configure DATABASE_URL, JWT_SECRET, STRIPE_SECRET_KEY
npx prisma migrate dev
npm run start:dev       # http://localhost:3001
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL
npm run dev                  # http://localhost:3000
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | — | Register |
| POST | `/auth/login` | — | Login |
| GET | `/users/me` | JWT | Get profile |
| PATCH | `/users/me` | JWT | Update profile |
| GET | `/products` | — | List products |
| GET | `/products/:id` | — | Product detail |
| GET | `/categories` | — | List categories |
| GET | `/cart` | JWT | Get cart |
| POST | `/cart/items` | JWT | Add to cart |
| POST | `/orders/checkout` | JWT | Place order |
| GET | `/orders` | JWT | Order history |
| GET | `/coupons` | — | List coupons |
| POST | `/coupons/:id/acquire` | JWT | Acquire coupon |
| GET | `/favorites` | JWT | List favorites |
| POST | `/favorites` | JWT | Add favorite |

## Deployment

- **Frontend:** Vercel (auto-deploy on push to `main`)
- **Backend:** AWS EC2 with PM2, connected to AWS RDS PostgreSQL

## Docs

Design documents are in the `docs/` folder (PDF).
