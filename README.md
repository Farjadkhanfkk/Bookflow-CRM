# Lumina Med Spa / BookFlow CRM

A fictional med-spa portfolio with Next.js, Supabase, server-validated appointment booking, Stripe deposits, customer/lead CRM, and queued integrations.

Use Node 24. Run `npm ci`, copy `.env.example` to `.env.local`, configure the private environment, and run `npm run dev`.

Before connecting a real database, read [Production setup](docs/PRODUCTION.md) and [Architecture](docs/ARCHITECTURE.md). Apply the additive migrations on staging first; the original repository did not include its deployed schema.

Checks: `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, `npm run build`. Browser tests require `npx playwright install chromium`.

Marketing content is explicitly illustrative. Bookings fail safely when backend configuration is missing. Use test data and Stripe test mode. No deployment is performed by these local changes.
