We are developing a custom backend for Rebase that is based on PostgreSQL and Drizzle ORM. 
This backend will be used to store and manage data for Rebase applications, providing a robust and scalable solution for developers.

## UI Coherency & Design Rules
- **The UI must be coherent always.** Every time you create a new view or component, you must ensure it matches the design system perfectly. We do not want messy or inconsistent UIs.
- **There is a UI Kit** available via `@rebasepro/ui`. You MUST use components from this UI kit (e.g., `Card`, `Typography`, `Button`, etc.) rather than building raw HTML elements or using ad-hoc classes.
- **Always use a reference UI view** when building new features. Look at existing views (such as `NavigationCard`, `RolesView`, or other studio views) to understand the established design patterns, spacing, and typography before creating something new. Future agents must take this into account every single time.

In the current stage we have an app that mimics the experience of the end developer, under the `apps` folder.
Including frontend and backend code, as well as a shared folder.

The library code can all be found under `packages`
Especially relevant for the backend are:
- `packages/backend`
- `packages/core`

Be careful when escaping strings, avoid this lint error and similar ones:
ESLint: Unnecessary escape character: \". (no-useless-escape)

NEVER convert to any.

Use `pnpm` exclusively, do not use `npm` or `yarn`.
