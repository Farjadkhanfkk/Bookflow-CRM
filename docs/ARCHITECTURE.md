# Implementation boundaries

- Existing Next.js App Router marketing and dashboard components are retained. Public editorial content is explicitly fictional seed data; bookable inventory is a server-projected database catalog with no fallback slots.
- Cookie-based Supabase SSR verifies staff identity. Active business membership is required; private direct reads are RLS-scoped. Business mutations go through authenticated, origin-checked routes with Zod schemas and database authorization for transaction functions.
- PostgreSQL calculates timezone-aware slots including service preparation/cleanup, location/provider intervals, assignments, time off, external events, active appointments, and unexpired holds. A business advisory transaction lock serializes reservation/confirmation/reschedule/configuration changes. Appointment GiST exclusion constraints independently block overlapping active appointments. Reschedule holds retain the old appointment until replacement validation succeeds atomically.
- Stripe commercial terms are snapshotted from the database. Security tokens are SHA-256 hashed. Management tokens are deterministic HMAC values derived from the hold ID using a server secret; only hashes persist. Server responses for manage links expose appointment details but no customer profile/internal notes.
- Outbox rows are written within booking/status transactions. Provider work is asynchronous and retryable with channel-specific duplicate handling. Core booking authority remains in PostgreSQL.
- Reports aggregate real payment and appointment data inside PostgreSQL for a bounded period; they do not equate treatment completion with payment collection.

## Local verification

Vitest runs the complete migration set in an isolated PostgreSQL-compatible PGlite instance with btree_gist and tests authorization, holds, overlap/buffers, rescheduling, payment validation/idempotency, refunds, and lead conversion. Provider tests mock network access. Playwright exercises public routes and responsive layouts, simulated API booking, error states, dialog keyboard behavior, and anonymous dashboard protection. Staging remains necessary to verify the actual pre-existing Supabase schema and real provider configuration.
