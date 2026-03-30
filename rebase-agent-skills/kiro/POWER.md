---
name: "rebase"
displayName: "Build with Rebase"
description: "Build headless CMS backends with Rebase — PostgreSQL, auto-generated REST & GraphQL APIs, authentication with RLS, realtime WebSockets, visual schema editor, and full admin panel"
keywords: ["rebase", "cms", "headless-cms", "postgresql", "drizzle", "admin-panel", "baas", "rest-api", "graphql", "realtime", "authentication", "rls", "storage"]
mcpServers: ["rebase"]
---

# Onboarding

## Validate Rebase CLI Installation

Before using the Rebase MCP server, ensure Node.js and the required tools are installed:

- **Node.js**: Required to run Rebase (v20+)
  - Check installation: `node --version`
  - Install if needed: Download from [nodejs.org](https://nodejs.org/) (LTS version recommended)

- **pnpm**: Rebase uses pnpm as its package manager
  - Check installation: `pnpm --version`
  - Install if needed: `npm install -g pnpm`

- **Rebase CLI**: For managing Rebase projects
  - Check installation: `npx rebase --version`
  - Install globally: `npm install -g rebase`

- **Authentication**: Sign in to Rebase Cloud
  - Run: `rebase login` (opens browser for Google OAuth)
  - Tokens are stored at `~/.rebase/tokens.json`

- **PostgreSQL**: Required for the Rebase backend
  - Check: `psql --version`
  - Or use Docker: `docker run --name rebase-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16`

- **Verify MCP Connection**: Ensure the MCP server is connected
  - Use the `rebase_get_current_user` tool to check connection status
  - If connection fails, rebuild the MCP server:
    1. Run `cd packages/mcp_server && npm install && npm run build`
    2. Restart your AI tool's MCP server connection

## Usage and Features

Once configured, the MCP server provides Rebase capabilities to your AI assistant:

- Browse and query data in your Rebase Cloud projects
- Create, update, and delete documents
- Manage users and roles
- Generate collection schemas with AI
- Export collection data

## Rebase Services Overview

### Core Services Available via MCP
- **Collections & Data**: CRUD operations on Firestore/PostgreSQL collections
- **Authentication**: User management, roles, and permissions
- **Schema Generation**: AI-powered collection schema generation
- **Data Export**: Export collection data as JSON

### Additional Capabilities (via Backend)
- **Auto-Generated REST API**: Full CRUD endpoints for every collection
- **Auto-Generated GraphQL API**: Query and mutate data with GraphQL
- **Realtime Engine**: WebSocket-based instant table updates
- **Storage**: S3 and local file storage
- **RLS Policies**: Row-Level Security with auth context injection
- **Drizzle ORM**: Type-safe database operations and migrations

## Additional Resources
- Rebase Documentation: https://rebase.pro/docs
- Live Demo: https://demo.rebase.pro
- Discord Community: https://discord.gg/fxy7xsQm3m
- GitHub: https://github.com/rebaseco/rebase

## License and support

This power integrates with the Rebase MCP Server (MIT).
- [Documentation](https://rebase.pro/docs)
- [Support](mailto:hello@rebase.pro)
