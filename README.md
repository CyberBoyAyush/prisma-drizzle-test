# ORM Benchmark: Prisma vs Drizzle on Neon

[![Next.js](https://img.shields.io/badge/Next.js-16.0.7-000000?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-7.1.0-2D3748?logo=prisma)](https://www.prisma.io)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-0.45.0-0A7EA4?logo=drizzle)](https://orm.drizzle.team)
[![Neon](https://img.shields.io/badge/Neon-PostgreSQL-008F5A?logo=neondatabase)](https://neon.tech)
[![Railway](https://img.shields.io/badge/Hosted_on-Railway-0B0D0E?logo=railway)](https://railway.app)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-F69220?logo=pnpm)](https://pnpm.io)

A live side by side benchmark comparing Prisma 7.1.0 and Drizzle ORM 0.45.0 on the same Neon PostgreSQL database. The app runs on Next.js App Router with server actions; each test executes Prisma and Drizzle flows back to back against the identical `DATABASE_URL`.

## What we test
- CRUD operations on users and posts
- Complex joins across users, posts, comments, categories, and tags
- Aggregations: count, sum, average, group by, having
- Subqueries and correlated selections
- Transactions for create update delete flows
- Bulk insert update delete for 100 row batches

Query shapes, filters, joins, limits, and payload sizes are mirrored between ORMs wherever the APIs allow.

## Dataset and schema
- Seeded volume: 100 users, 400 posts (mixed published), 1,000 comments
- Taxonomy: 20 categories, 40 tags, with many to many links through `post_categories` and `post_tags`
- Schema tables: `users`, `posts`, `comments`, `categories`, `tags`, `post_categories`, `post_tags`
- Seed script: `prisma/seed.ts` generates realistic names, emails, titles, content, view counts up to 50k, and relational links

## Infrastructure
- Database: Neon PostgreSQL serverless, region ap-southeast-1
- Hosting: Railway in ap-southeast-1 to keep latency aligned with the database
- Prisma uses `@prisma/adapter-neon`; Drizzle uses `@neondatabase/serverless` with the same connection string

## Measurement approach
- Each click runs one Prisma pass and one Drizzle pass sequentially
- Timers wrap the full server action using `performance.now()` to include network, Postgres, and ORM overhead
- Results are rounded to two decimals; minor run to run variance is expected
- Write heavy tests create timestamped data and delete it before returning to keep the seeded baseline stable

## Running locally
Prerequisites: pnpm, Node 18+, a Neon (or any Postgres) `DATABASE_URL`.

```bash
pnpm install
pnpm prisma generate
pnpm db:seed             # optional, seeds the dataset described above
pnpm dev                 # starts Next.js on http://localhost:3000
```

To build for production:
```bash
pnpm build
pnpm start
```

## How to use the UI
1. Open `/` and run individual tests or “Run All Tests”.
2. Switch to the Chart tab for aggregated comparisons.
3. Visit `/about` for methodology details and example snippets.
4. Use the “Suggest new tests” button (home or about) to open a GitHub issue with ideas.

## Tech stack
- Next.js App Router with server actions
- TypeScript and Tailwind CSS
- Prisma 7.1.0 with PrismaNeon adapter
- Drizzle ORM 0.45.0 with Neon serverless driver
- Neon PostgreSQL
- Recharts for visualization
- Biome for lint and format

## Repo layout
- `src/app` pages, server actions, and UI
- `src/db` Prisma and Drizzle clients plus schema mapping
- `src/app/actions/tests` test runners for each scenario
- `src/config/tests.ts` test metadata
- `prisma/schema.prisma` data model for Prisma
- `prisma/seed.ts` dataset generator

## Contributing tests
Have a query pattern we should add? Open an issue at `https://github.com/CyberBoyAyush/orm-test/issues/new/choose` with the test idea, the shape you expect for Prisma and Drizzle, and any edge cases to measure.*** End Patch줘
