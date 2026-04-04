---
name: rebase-basics
description: Core principles, workflow, and maintenance for using Rebase. Use this for all Rebase CLI tasks, project setup, MCP server usage, and general development. Make sure to ALWAYS use this skill whenever you are trying to use Rebase, even if not explicitly asked.
---

# Prerequisites

Please complete these setup steps before proceeding, and remember your progress to avoid repeating them in future interactions.

1. **Local Environment Setup:** Verify the environment is properly set up:
   - Run `node --version` to check Node.js is installed (v20+ required).
   - Run `pnpm --version` to check pnpm is installed. If not, install it: `npm install -g pnpm`.
   - Verify PostgreSQL is available: `psql --version` or confirm Docker is running with a Postgres container.
   - If any of these checks fail, use the `rebase-local-env-setup` skill to get the environment ready.

2. **Authentication:**
   Ensure you are logged in to Rebase Cloud for MCP server access. Run `rebase login`. This opens a browser for Google OAuth.
   - Tokens are stored at `~/.rebase/tokens.json` and shared between CLI and MCP server.
   - If the browser fails to open, check the CLI output for a manual URL.

3. **Active Project:**
   Most Rebase tasks require a project context.
   - For Rebase Cloud: Run `rebase login` and select your project via the MCP `list_projects` tool.
   - For self-hosted: Ensure your `app/.env` file contains a valid `DATABASE_URL`.

# Rebase Usage Principles

Please adhere to these principles when working with Rebase, as they ensure reliability and consistency:

1. **Use pnpm exclusively:** Rebase uses pnpm as its package manager. Never use `npm` or `yarn`. All commands should use `pnpm run`, `pnpm install`, `pnpm add`, etc.

2. **Never convert to `any`:** TypeScript strictness is critical. Never use `as any` type assertions. Use proper typing, `unknown`, or explicit type narrowing instead.

3. **Follow the Schema-as-Code approach:** Schemas are defined as standalone TypeScript files. The visual Studio generates TypeScript via AST manipulation — it does NOT run raw SQL. Always define collections in code first.

4. **Use the two-step migration workflow:**
   - `rebase schema generate` — converts collection definitions to Drizzle ORM schema
   - `rebase db push` (development) or `rebase db generate && rebase db migrate` (production)

5. **Use Rebase MCP Server tools when available:** For data operations, user management, and collection browsing, prefer the MCP tools (`list_documents`, `get_document`, `create_document`, etc.) over writing manual API calls.

6. **Respect the monorepo structure:** Rebase is organized as a modular monorepo with key packages:
   - `packages/backend` — Express server, PostgreSQL data source, API generation
   - `packages/core` — Core framework, types, hooks, and components
   - `packages/types` — Shared TypeScript type definitions
   - `packages/ui` — Standalone component library (Tailwind + Radix)
   - `packages/studio` — Admin panel, collection editor, visual schema editor
   - `packages/auth` — Authentication module
   - `app/` — Developer-facing example application (frontend + backend + shared)

7. **Never deploy to production:** Agents should never run `firebase deploy`, `gcloud deploy`, or any command that pushes code to live infrastructure. Provide the exact command and let the user run it themselves.

# Project Structure

```
rebase/
├── app/                      # Developer example app
│   ├── frontend/             # React frontend (Vite)
│   ├── backend/              # Express backend
│   └── shared/               # Shared collection definitions
│       └── collections/      # TypeScript collection files
├── packages/
│   ├── backend/              # @rebasepro/backend — server, APIs, auth, storage
│   ├── core/                 # @rebasepro/core — framework core
│   ├── types/                # @rebasepro/types — shared types
│   ├── ui/                   # @rebasepro/ui — component library
│   ├── studio/               # @rebasepro/studio — admin panel
│   ├── auth/                 # @rebasepro/auth — authentication
│   ├── cli/                  # @rebasepro/cli — CLI tool
│   ├── editor/               # @rebasepro/editor — rich text editor
│   ├── firebase/             # @rebasepro/firebase — Firebase data source
│   ├── postgresql/           # @rebasepro/postgresql — PostgreSQL data source
│   └── ...                   # Additional plugins (data_import, data_export, etc.)
├── pnpm-workspace.yaml
├── lerna.json
└── package.json
```

# CLI Commands

| Command | Description |
|---------|-------------|
| `rebase login` | Authenticate with Rebase Cloud |
| `rebase init` | Scaffold a new Rebase project |
| `rebase init --pro` | Scaffold a Rebase PRO project |
| `rebase deploy` | Deploy to Rebase Cloud |
| `rebase deploy --env dev` | Deploy to dev environment |

# MCP Server Tools

The Rebase MCP server provides these tools for AI agents:

| Category | Tools |
|----------|-------|
| **Auth** | `rebase_login`, `rebase_logout`, `rebase_get_current_user` |
| **Projects** | `list_projects`, `get_root_collections` |
| **Users** | `list_users`, `add_user`, `update_user_roles`, `remove_user` |
| **Documents** | `list_documents`, `get_document`, `create_document`, `update_document`, `delete_document`, `count_documents` |
| **AI & Export** | `generate_collection`, `modify_collection`, `export_collection` |

# References

- **Collection Definitions:** See [references/collection-definitions.md](references/collection-definitions.md) for how to define collections in TypeScript.
- **CLI Guide:** See [references/cli-guide.md](references/cli-guide.md) for detailed CLI usage.
- **MCP Server Setup:** See [references/mcp-setup.md](references/mcp-setup.md) for configuring the MCP server.

# Common Issues

- **`DATABASE_URL is not set`:** Ensure `app/.env` exists with `DATABASE_URL=postgresql://user:password@localhost:5432/rebase`
- **pnpm not found:** Install with `npm install -g pnpm`
- **Node.js version mismatch:** Rebase requires Node.js v20+. Use `nvm install 20 && nvm use 20`
