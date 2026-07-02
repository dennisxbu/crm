# Supabase Connection Check

Checklist to verify the Vite frontend is correctly connected to Supabase.

**Scope:** Connection setup only — no CRM features, no Auth flows.

## 1. Install dependencies

```bash
pnpm install
```

## 2. Create local environment file

```bash
cp .env.example .env.local
```

Fill `.env.local` manually (never commit this file):

```env
VITE_SUPABASE_URL=https://fzormgxabytjfnqjtruy.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<paste-your-supabase-publishable-key-here>
```

Get the publishable key from **Supabase Dashboard → Project Settings → API → Publishable key**.

Never add a secret key or service role key here.

## 3. Lint and build

```bash
pnpm lint
pnpm build
```

## 4. Start dev server

```bash
pnpm dev
```

Open http://localhost:5173 — the Phase 1 status page shows:

- `VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY configured`
- Supabase connection health (reachable / schema status)

## 5. Repo grep checks

Verify no old env variable names remain in active code:

```bash
grep -R "NEXT_PUBLIC_SUPABASE" .
grep -R "VITE_SUPABASE_ANON_KEY" .
grep -R "VITE_SUPABASE_PUBLISHABLE_KEY" src .env.example README.md DEVELOPMENT.md docs
```

**Expected:**

- First two greps: no active hits (historical ADR text may mention old names in context)
- Third grep: shows the new correct references

On Windows (PowerShell), use `rg` if installed, or:

```powershell
rg "NEXT_PUBLIC_SUPABASE" .
rg "VITE_SUPABASE_ANON_KEY" .
rg "VITE_SUPABASE_PUBLISHABLE_KEY" src .env.example README.md DEVELOPMENT.md docs
```

## 6. Optional — Supabase CLI (local Docker)

For local Supabase instead of the remote project:

```bash
npx supabase --version
pnpm db:start
pnpm exec supabase status
```

Copy the local URL and anon/publishable key from CLI output into `.env.local`:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=<local-anon-key-from-supabase-status>
```

Then apply migrations:

```bash
pnpm db:reset
```

## 7. Optional — Link remote project (CLI)

To link the Supabase CLI to the hosted project (does **not** push migrations automatically):

```bash
npx supabase login
npx supabase link --project-ref fzormgxabytjfnqjtruy
```

Do not run `db push` unless explicitly requested — it changes the production database.

## Troubleshooting

| Problem                     | Fix                                                               |
| --------------------------- | ----------------------------------------------------------------- |
| Status page: missing env    | Create `.env.local` from `.env.example` and fill both variables   |
| Status page: unreachable    | Check URL and key; verify project is active in Supabase Dashboard |
| Status page: schema missing | Run `pnpm db:reset` (local) or apply migrations to remote         |
| Build fails on env types    | Ensure `src/vite-env.d.ts` declares both `VITE_*` variables       |

## Further reading

- [docs/dev-setup.md](dev-setup.md) — Full local development guide
- [docs/supabase-and-rls.md](supabase-and-rls.md) — RLS and environment variables
- [docs/adr/007-vite-env-vars.md](adr/007-vite-env-vars.md) — Env naming decision (ADR)
