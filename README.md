# MindWell

Full-stack web app (Vite + React + Clerk + Tailwind/shadcn style) with Express + Prisma + PostgreSQL backend.

## Quickstart

1. Backend

```bash
cd backend
cp .env.example .env # fill DATABASE_URL, CLERK, GEMINI, SPOTIFY
npm i
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

2. Frontend

```bash
cd frontend
cp .env.example .env # fill VITE_CLERK_PUBLISHABLE_KEY and VITE_API_URL
npm i
npm run dev
```


