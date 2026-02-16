---
description: Deployment rules and restrictions for the FireCMS backend and all services
---

# ⛔ CRITICAL: NEVER DEPLOY TO PRODUCTION ⛔

**Under NO circumstances should any agent deploy to production.** This includes:

- `firebase deploy` (any variant)
- `gcloud functions deploy`
- `gcloud run deploy`
- Any command that pushes code, functions, or configuration to a live GCP project
- Any command targeting `firecms-backend`, `production`, or `prod` environments
- Any command using service account keys to modify live infrastructure

## What you CAN do

1. **Edit source code** — make changes to files locally
2. **Build** — run `npm run build` or `tsc` to verify compilation
3. **Run tests** — run `npm test` or equivalent
4. **Run local emulators** — `firebase emulators:start` is fine
5. **Check logs** — read-only log queries via `gcloud logging read` are fine
6. **List resources** — read-only commands like `gcloud functions list` are fine

## What you MUST NOT do

1. **NEVER run `firebase deploy`** — not even with `--only functions:specificFunction`
2. **NEVER run deploy scripts** — e.g. `npm run deploy:prod`, `npm run deploy:staging`, `npm run deploy:all`
3. **NEVER modify live infrastructure** — no creating, updating, or deleting cloud resources
4. **NEVER bypass predeploy hooks** — do not modify `firebase.json` to skip build steps for deployment purposes
5. **NEVER approve deployment prompts** — if a command asks "Would you like to proceed with deployment?", the answer is always NO

## If the user asks you to deploy

- **Provide the exact command** they should run themselves
- **Explain what the command will do** before they run it
- **Never run it on their behalf** — deployment is a human-only action

## Summary

The agent's role is to write code, debug, analyze logs, and prepare changes. **Deployment is always the user's responsibility.**
