# Alpha Hub

- Next.js App Router, React, TypeScript, Tailwind, Node.js 24.
- Keep Vietnamese user-facing text and the Alpha HUB green brand.
- Run npm run typecheck and npm run build after meaningful changes. npm test checks anonymous access and public routes.
- Data, authentication and private files use Supabase with RLS. Never use a secret/service-role key in browser code or commit credentials, sessions, data/, uploads or customer records.
- Keep Alpha Hub tables prefixed alpha_ so other CRM tables in the Supabase project remain untouched. Use migrations and verify RLS.
- Preserve same-origin native links and per-project routes. Do not restore the ChatGPT Sites auth headers or cloudflare:workers imports.
- GitHub source and the old chatgpt.site deployment are separate. Do not claim automatic synchronization.
