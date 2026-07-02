# Contributing to Blumenthal Systems CRM

Private solo project — these conventions keep history clean and align humans and AI agents (Cursor, Claude Code, Codex).

## Architecture decisions

Significant choices are recorded in [docs/adr/](docs/adr/README.md). Read Accepted ADRs before changing stack, auth, data model, or configurability approach.

**Specs vs. ADRs:**

| Layer  | Location    | Content                                 |
| ------ | ----------- | --------------------------------------- |
| ADRs   | `docs/adr/` | Binding **why** decisions               |
| Specs  | `docs/*.md` | Detailed **what** (fields, tables, DoD) |
| Agents | `AGENTS.md` | Entry point for all AI tools            |

## Git workflow

### Branches

| Branch          | Use                               |
| --------------- | --------------------------------- |
| `main`          | Stable — **do not push directly** |
| `feat/<scope>`  | Features or roadmap steps         |
| `fix/<scope>`   | Bug fixes                         |
| `chore/<scope>` | Tooling, dependencies             |
| `docs/<scope>`  | Documentation only                |

```bash
git checkout main
git pull
git checkout -b feat/phase-2-auth
```

### Commits

[Conventional Commits](https://www.conventionalcommits.org/) in **English**:

```
<type>(<scope>): <imperative subject>
```

Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`, `build`

- One topic per commit
- For code: `pnpm lint` and `pnpm build` before commit

### Pull requests

- PR to `main` required before merge
- Use [.github/pull_request_template.md](.github/pull_request_template.md)
- One logical change set per PR

## Cursor / AI agents

Rules: [`.cursor/rules/`](.cursor/rules/) (`.mdc` format)  
Canonical for all tools: [`AGENTS.md`](AGENTS.md)

Agents must:

- Not push to `main` directly
- Not combine unrelated changes in one commit
- Update ADRs when architecture changes
- Respect active phase in `docs/implementation-roadmap.md`
- Never commit secrets (Secretlint on pre-commit)

## Local development

See [docs/dev-setup.md](docs/dev-setup.md).

## Questions

Use GitHub issues for bugs or scope discussion.
