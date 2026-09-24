# BookFlow production setup

This is a fictional single-business portfolio application. Use test customer details and Stripe test mode. Nothing in the local production pass applies database changes or deploys the live site.

## Runtime and checks

Use Node 24 and npm. Run `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, and `npm run build`. Install the test browser with `npx playwright install chromium` first.

## Database rollout

1. Take a database backup and restore to a staging project. Existing repository history did not contain a schema migration baseline. The additive migrations assume UUID IDs and the legacy `services`, `staff_members`, `customers`, and `appointments` column names used by this repository. Compare the staging schema before applying them. Existing conflicting appointments intentionally cause the exclusion constraint to fail; reconcile those records rather than deleting them or disabling constraints.
2. Apply `supabase/migrations` in filename order with the Supabase CLI or SQL editor. Do not rerun the old `supabase/rls_policies.sql`: it represents superseded public table access. The new policies remove direct public access to staff and service tables and serve a field allowlist through `/api/catalog` instead.
3. Create an Auth user, then add its UUID to `business_members` with the configured business ID, role `owner`, and `is_active=true`. Membership is never derived from user-editable auth metadata. Use the settings membership form for later accounts. A provider role also needs its own `staff_id`.
4. Configure locations, reviewed service prices/deposits (integer minor units), provider records, staff-service assignments, staff-location assignments, location hours, and weekly provider intervals. Split intervals for breaks; add dated time-off periods. New records stay inactive until deliberately enabled. Historical rows have no inferred payment history: enter/reconcile actual financial records before treating reports as historical accounting.
5. Verify RLS as anonymous, non-member, disabled member, receptionist, and assigned/unassigned provider against staging. The PGlite test suite exercises the local migration SQL, not a live Supabase deployment or multi-process PostgreSQL load.

## Server environment

Copy `.env.example` to a private environment file. The catalog/booking APIs fail closed until Supabase service-role credentials, `APP_URL`, and `BOOKING_TOKEN_SECRET` exist. Marketing pages remain available. Never rotate `BOOKING_TOKEN_SECRET` without considering existing management links and queued notifications. Never expose a service key to the browser.

## Payments

Configure Stripe test credentials and webhook endpoint `/api/stripe/webhook` for `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_failed`, and `charge.refunded`. Only verified, paid Checkout events fulfill deposits. The database checks session ID, amount, currency, and hold identity; it atomically creates the customer match, appointment, payment, and outbox records. The return page only reads committed status.

Holds last 45 minutes so a Checkout session can satisfy Stripe's 30-minute minimum even after entering contact information. Starting a new checkout with less than 31 minutes left requires a fresh hold. Unfulfilled late payments are recorded and queued for refund instead of overriding booking conflicts. Eligible customer cancellations and business cancellations queue captured deposit refunds. Refund completion is recorded by signed Stripe webhook, not by optimistic UI.

## Calendar

Enable Google Calendar API, create web OAuth credentials, and allow the exact callback `APP_URL/api/google/callback`. Configure consent-screen test users or complete Google's production verification as applicable. Store an independently generated base64 32-byte AES key in `GOOGLE_TOKEN_ENCRYPTION_KEY`. Accounts linked to a provider can connect their own primary calendar. State is bound to the signed-in account, HTTP-only cookie, one-time database record, and expiry. Refresh tokens are authenticated-encrypted at rest.

Availability imports expanded Google events, excluding application-owned events so rescheduling does not conflict with its own synchronized copy. All-day external events conservatively block adjacent timezone offsets. A failed refresh fails the availability request; it does not erase cached busy periods. Event IDs are deterministic for idempotent creation; rescheduling between providers removes the previous event first. Reconnect a disconnected previous provider if an existing event needs cleanup.

## Communications and automation

Configure a verified Resend sender, Twilio sender/account, and the external n8n HTTPS webhook. Email, SMS, and WhatsApp are separate opt-ins. WhatsApp requires `TWILIO_WHATSAPP_FROM` (including the `whatsapp:` prefix) and an approved `TWILIO_WHATSAPP_TEMPLATE_SID` whose variable `1` is the private booking URL; use the sandbox/approved test recipients before production. Set the Twilio status callback to `APP_URL/api/twilio/status` (the sender also supplies it). The callback validates the Twilio signature. Do not put medical content in notification templates.

Run authenticated `GET /api/jobs` every five minutes with `Authorization: Bearer CRON_SECRET`. The default `vercel.json` intentionally has no cron declaration so the site can deploy on Vercel Hobby. Before enabling live bookings, configure an external authenticated scheduler at this cadence, or use Vercel Pro and add a `crons` entry with path `/api/jobs` and schedule `*/5 * * * *`. Without that scheduler, queued notifications, calendar synchronization, and refunds are not processed automatically. Jobs use database leases, retry backoff, and unique event keys. The settings monitor shows pending/failed/uncertain deliveries. Twilio ambiguous outcomes require provider-log reconciliation before a trusted operator changes the job state; automatic retries would risk duplicate SMS. Resend retry attempts beyond its safe idempotency window also require review. A scheduler outage does not roll back bookings.

n8n receives only event identity, event type, and appointment ID. Verify HMAC-SHA256 of `timestamp + '.' + rawBody` using `N8N_WEBHOOK_SECRET`, require a fresh timestamp, and deduplicate `eventId` before side effects. Headers: `X-BookFlow-Timestamp`, `X-BookFlow-Signature`, `Idempotency-Key`. n8n never authorizes bookings or changes application state directly.

## Authentication and hosting

Configure Supabase Site URL and redirect allowlist for `APP_URL/auth/callback`. Recovery supports PKCE code exchange and `token_hash` recovery links. Staff must have active database membership even after authentication. Set all server variables in Vercel, run the production checks, apply reviewed migrations to the target database, and verify webhooks/scheduler in test mode before opening booking.

Review the fictional marketing content, privacy notice, retention process, cancellation policy, and consent language for any real operator before collecting real information. This project makes no compliance certification claims.
