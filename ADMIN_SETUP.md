# Alpha HUB Admin

Admin entry: `/admin`. This change stays on a feature branch until Vercel credentials are configured and the preview is verified.

## What is implemented

- Separate responsive green administration interface: overview, projects, inventory with CSV import, customers, reservations, image/PDF library, articles, settings.
- Public consultation form creates a new customer in the admin system. No email is sent.
- Server-verified single-admin login, scrypt password hashes, opaque HttpOnly session cookie, database-backed throttling and logout revocation.
- Data persisted in Supabase Postgres; uploads in private `alpha-assets` bucket. Images are intentionally served publicly through `/api/files/:id` for website use. PDF downloads require an admin session.
- Customer records, sessions, and reservation customer details are never returned by the public state endpoint. The public site reads published project/unit/article changes and contact settings.
- Initial catalogue and inventory contain demo data. Dashboard distinguishes saved units and demo catalogue. Replace sample inventory before commercial use.

## Already applied to Supabase

Project `alphahub` (`qhxjlqtuupisysdirwct`):

1. `sql/alpha-admin.sql`: five prefixed tables with RLS, private Storage bucket, server-only RPC functions.
2. `sql/alpha-atomic-records.sql`: atomic record writes, unit-code uniqueness, transaction locking for reservations.

The connected SQL reader is not allowed to call the service-role functions. Schema/RLS/bucket were inspected; a live service-role integration test remains required. No production service key or admin password was retrieved or created in this task.

Tables intentionally have no browser RLS policies: direct `anon` / `authenticated` access is revoked; the server enforces the single-admin access model and uses `service_role`.

## Vercel environment

Set these in the existing `websiteluan` project, on the appropriate Preview and Production environments:

| Variable | Value |
| --- | --- |
| `SUPABASE_URL` | `https://qhxjlqtuupisysdirwct.supabase.co` |
| `SUPABASE_SECRET_KEY` | Supabase secret key, server only; legacy `SUPABASE_SERVICE_ROLE_KEY` is also supported |
| `ALPHA_ADMIN_EMAIL` | Owner's chosen admin email |
| `ALPHA_ADMIN_PASSWORD_HASH` | Existing scrypt hash, or generate securely with `npm run setup` on a local machine |

Do not prefix secret keys with `NEXT_PUBLIC_`. Leave `ALPHA_SECURE_COOKIE` unset in Vercel. The optional `ALPHA_PUBLIC_ORIGIN` must match the environment's actual origin; normally leave it unset to support preview hosts.

`npm run setup` is for generating local credentials. Copy the hash to Vercel privately, not through chat or GitHub. Never commit `.env.local`.

Node.js 24; `npm run build`. Upload cap is 4 MiB per file to fit the Vercel request body limit. Larger uploads need signed direct uploads and are not implemented here.

## Validation performed

- `npm run typecheck`: passed.
- `npm run build`: passed.
- `npm test`: passed against a disposable local HTTP contract fixture (authentication, CSRF, public/private separation, customer save, reservation operations, upload/download, restart persistence, logout, admin server rendering, lead form API).
- Cloud database schema: five tables with RLS enabled and private 4 MiB Storage bucket verified.
- Cloud browser could not open the local test server (`ERR_BLOCKED_BY_CLIENT`); responsive styling is implemented but visual browser verification remains pending.

Before merging: restore Vercel access, configure environment, open the branch preview, test real admin login, image upload and consultation submission, then merge and verify Production.

## Scope and remaining limits

Single admin; no staff roles, delete/archive workflow, automated emails, or real-time subscriptions. Public changes refresh on reload or the current 60-second polling cycle. No old SQLite database/files were migrated because no source runtime data was accessible. The existing source catalogue remains intact.
