# MallShop (モールショップ) — Frontend

A Japanese-style online shopping mall built with Next.js.

**Live Demo:** [https://mallshop-8yc7f8h5b-zinwaiwainwe9999-8293s-projects.vercel.app/](https://mallshop-8yc7f8h5b-zinwaiwainwe9999-8293s-projects.vercel.app/)

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **State Management:** Zustand (auth), React Query (server state)
- **Styling:** Tailwind CSS
- **Payments:** Stripe
- **Backend:** NestJS + Prisma + PostgreSQL (see `../backend`)

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home page |
| `/products` | Product listing with filters and pagination |
| `/products/[id]` | Product detail with reviews, Q&A, and related products |
| `/hot-deals` | Sale/hot deals page with countdown timers and coupons |
| `/cart` | Shopping cart with coupons, points, and save-for-later |
| `/checkout` | Multi-step checkout (address, delivery, payment, confirm) |
| `/checkout/complete` | Order completion page |
| `/favorites` | Favorites/wishlist with folders, tags, and grid/list views |
| `/login` | Login |
| `/register` | Registration |
| `/mypage/profile` | User profile |
| `/mypage/orders` | Order history |
| `/mypage/password` | Password change |
| `/admin` | Admin dashboard |
| `/admin/products` | Product management |
| `/admin/categories` | Category management |
| `/admin/orders` | Order management |
| `/admin/users` | User management |
| `/about` | About page |
| `/support` | Support/FAQ page |

## Getting Started

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your API URL

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `/api` |

## Build

```bash
npm run build
npm run start
```

## Deployment

Deployed on [Vercel](https://vercel.com). Push to `main` to trigger auto-deploy.
