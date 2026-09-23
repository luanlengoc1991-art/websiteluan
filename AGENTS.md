# Alpha Hub

- Next.js App Router, React, TypeScript, Tailwind, Node.js 24.
- Keep Vietnamese user-facing text and the Alpha HUB green brand.
- Run npm run typecheck and npm run build after meaningful changes; npm test verifies the backend against disposable data.
- Never commit .env.local, admin passwords, session tokens, data/, uploads, or customer records.
- Preserve same-origin native links and per-project routes. Do not restore the ChatGPT Sites auth headers or cloudflare:workers imports.
- Auth/storage are single-admin sessions + persistent SQLite/filesystem. Do not describe this backend as Vercel-compatible without migrating storage.
- GitHub source and the old chatgpt.site deployment are separate. Do not claim automatic synchronization.
