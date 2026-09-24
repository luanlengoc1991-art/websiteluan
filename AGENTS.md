# Alpha Hub

- Next.js App Router, React, TypeScript, Tailwind, Node.js 24.
- Keep Vietnamese user-facing text and the Alpha HUB green brand.
- Run npm run typecheck and npm run build after meaningful changes; npm test verifies the backend against disposable data.
- Never commit .env.local, admin passwords, session tokens, data/, uploads, or customer records.
- Preserve same-origin native links and per-project routes. Do not restore the ChatGPT Sites auth headers or cloudflare:workers imports.
- Auth uses single-admin, hashed opaque sessions in Supabase. Records use Supabase Postgres and files use the private alpha-assets Storage bucket. Secret keys are server-only. Keep RLS enabled and browser roles denied direct access. npm test uses a disposable HTTP fixture, not a live Supabase project.
- GitHub source and the old chatgpt.site deployment are separate. Do not claim automatic synchronization.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
