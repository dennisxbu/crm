# supabase/migrations/

SQL migrations for schema, RLS policies, indexes, and grants.

## Rules

- Every schema change = new migration file
- No manual production schema in Supabase Dashboard
- Test locally: `pnpm db:reset`
- Include RLS + explicit GRANTs per table (ADR-004)
- See [docs/adr/004-workspaces-rls.md](../../docs/adr/004-workspaces-rls.md)

## Naming

```
YYYYMMDDHHMMSS_descriptive_name.sql
```

## Current migrations

| File                                                | Phase | Content                                                  |
| --------------------------------------------------- | ----- | -------------------------------------------------------- |
| `20260701120000_phase1_extensions_and_profiles.sql` | 1     | pgcrypto, profiles stub, RLS, grants                     |
| `20260702140000_phase2_auth_workspaces.sql`         | 2     | auth trigger, workspaces, workspace_members, RLS helpers |
| `20260703140000_phase3_companies.sql`               | 3     | companies table, indexes, RLS, grants                    |

Spec for future tables: [docs/data-model.md](../../docs/data-model.md)
