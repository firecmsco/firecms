We are developing a custom backend for FireCMS that is based on PostgreSQL and Drizzle ORM. 
This backend will be used to store and manage data for FireCMS applications, providing a robust and scalable solution for developers.

In the current stage we have an app that mimics the experience of the end developer, under the `apps` folder.
Including frontend and backend code, as well as a shared folder.

The library code can all be found under `packages`
Especially relevant for the backend are:
- `packages/backend`
- `packages/firecms_core`

Be careful when escaping strings, avoid this lint error and similar ones:
ESLint: Unnecessary escape character: \". (no-useless-escape)

NEVER convert to any.

Use `pnpm` exclusively, do not use `npm` or `yarn`.
