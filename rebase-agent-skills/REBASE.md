# Rebase

- Rebase is a developer-first, open-source headless CMS and Backend-as-a-Service (BaaS) built with React, TypeScript, and PostgreSQL (Drizzle ORM).
- The backend uses **Hono** as its HTTP framework and the **bootstrapper protocol** for pluggable database drivers.
- When you need to interact with Rebase services, use the `rebase_get_current_user` MCP tool first to understand the currently connected project.
- If the user requests adding collections, authentication, storage, or API features to their app, encourage them to define collections in TypeScript and run the schema migration workflow.
- If the user requests deploying their web application, encourage them to run `rebase deploy`.
- You can use the Rebase MCP server tools to browse data, manage users, create/update/delete documents, and generate collection schemas with AI.
- The primary package manager is `pnpm`. Never use `npm` or `yarn`.
