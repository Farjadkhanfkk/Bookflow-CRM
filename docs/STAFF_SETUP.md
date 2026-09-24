# Admin and staff setup

Supabase **Authentication → Users** confirms an account exists. Dashboard authorization is a separate active row in `public.business_members`. Creating a second Auth account does not grant a role. Do not grant anonymous access to membership or appointment tables to fix a login error.

## Apply the database changes

1. Back up the database and check which migrations have already been applied. Follow `PRODUCTION.md` for the existing baseline. Do not rerun migrations 001–008 if already applied.
2. Apply `supabase/migrations/202609240009_staff_workflows.sql` in Supabase SQL Editor (or via the normal migration process).
3. Open `docs/bootstrap-owner.sql`, set `owner_email` to the intended existing Auth account, and execute it once in SQL Editor. It currently contains `admin@luminamedspa.com`, the original account shown in the supplied screenshot. It will refuse to replace a different active owner. No passwords change.
4. Sign in again with that account's existing password. In **Settings → Team and access**, link the second account by exact email and choose its role. The screenshot's second email is `adminn@luminamedspa.com` (two n characters). Do not share passwords in chat.

## Roles

| Role | Access |
| --- | --- |
| Owner | All appointments, business settings, staff and administrator access; last active owner is protected |
| Admin | All appointments, settings, add/invite/link staff and receptionists, remove their access |
| Receptionist | Operational appointments, customers, leads and tasks; no team administration |
| Staff | Assigned appointments and related customers; own availability and own notifications |

Staff roles must link to a provider. New provider records are not bookable until an admin configures services, locations, weekly hours and enables booking. Removing active access also disables booking for the linked provider; historical appointments remain for reassignment. Restoring dashboard access deliberately does not automatically reopen booking.

## Server setup

Vercel must contain the existing public Supabase URL/key plus server-only `SUPABASE_SERVICE_ROLE_KEY`, `APP_URL=https://luminamedspa.vercel.app`, and a stable random `BOOKING_TOKEN_SECRET` of at least 32 characters. Never expose the service-role key as a `NEXT_PUBLIC_` variable. Redeploy after changing environment variables. The server service key is required for team management and availability changes, not just login.

For new-account invitations, configure the Supabase email provider and URL allowlist. Use an invitation email link of the following form in Supabase **Email Templates → Invite user** so server-side sessions can verify the invitation:

```html
<a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=invite">Accept invitation and set password</a>
```

Set Site URL to the live app URL and allow `/auth/callback`. Existing accounts can be linked without sending invitations. Inviting a new account sends an email only when an administrator submits the Invite option in Team and access.

## Availability and notifications

Staff select first and last unavailable dates under **Calendar → My availability**. Dates are inclusive and use the business timezone, including daylight-saving changes. New reservations are blocked immediately. Existing bookings are retained, and administrators get a notification with the number requiring review. Staff can remove their own time-off entries.

Appointment creation, reassignment, time changes and status changes create private dashboard notifications for the assigned provider and admins. Previous providers also receive a reassignment notice. Dashboard inboxes refresh every 30 seconds while visible; they do not require a cron service. Notifications are read only by their recipient using RLS.

Staff email notifications additionally require `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CRON_SECRET`, and an authenticated scheduler calling `/api/jobs` every five minutes. Email content contains only a sign-in link, not customer details. The default Hobby deployment has no cron schedule; email cannot be promised until the external scheduler is configured. Supabase realtime publication is optional for appointment list refresh; the inbox polling works independently.

## Verification

Use two separate browser sessions: owner/admin sees all appointments; each staff account sees only its own. Create a booking for one provider and confirm the other provider receives no notification. Mark a future day unavailable, verify public slots disappear, then remove the block and check they return. Test removal of staff access and inspect historical appointments from the admin account. Local automated tests exercise these database boundaries, but live role assignment and integration configuration must also be checked in Supabase/Vercel.
