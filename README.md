<div align="center">

# Pingo de Meio

**Back-office for a small food business: point of sale, orders, recipes, stock and consignment clients.**

🇧🇷 [Leia em português](README.pt-BR.md)

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white) ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white) ![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)

</div>

## About

Full-stack Next.js app built for a real small business. It replaces spreadsheets for daily sales, production costs and the accounts of shops that resell the products on consignment. Front-end and API run in the same Next.js process.

## Features

- Point of sale and "sales of the day" with CSV export
- Orders with payment status and customer
- Products with recipes (ingredients and cost)
- Stock, expenses, withdrawals and financial overview
- Consignment clients: deliveries, sales, payouts and per-client product rates
- Tasks, agenda and calendar

## Tech stack

| Layer | Technology |
|---|---|
| App | Next.js 16 (App Router + Route Handlers), React 19, TypeScript |
| UI | Tailwind CSS 4, shadcn/ui (Base UI), Lucide |
| Data | MySQL + Prisma (17 versioned migrations) |
| Auth | Single-account login with signed httpOnly cookie |

## Architecture

```
app/(app)/   authenticated pages (pdv, pedidos, produtos, estoque, financeiro, clientes...)
app/api/     REST Route Handlers per resource
app/login/   login page
lib/         Prisma client, auth and helpers
prisma/      schema, migrations and seed
proxy.ts     redirects unauthenticated page requests to /login
```

## Getting started

**Prerequisites:** Node.js 20+, MySQL 8

```bash
npm install
# create .env with the variables below
npx prisma migrate deploy
npm run db:seed
npm run dev        # http://localhost:3000
```

### Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | MySQL connection string |
| `AUTH_USERNAME / AUTH_PASSWORD` | Credentials of the single back-office account |
| `AUTH_SECRET` | Secret used to sign the session cookie |

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server |
| `npm run build / npm start` | Production build and server |
| `npm run db:seed` | Seed initial data |
| `npm run db:studio` | Prisma Studio |

## Team

- [Vinicius do Valle](https://github.com/vallevinicius)
