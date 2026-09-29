# Notes for coding agents

This is a FireCMS PRO project: a React + Vite admin panel that reads and
writes a Firebase project's Firestore and Storage, with PRO plugins such as
user management, import/export and entity history.

## Layout

- `src/App.tsx`: sign-in, the PRO plugins, and the collections defined in code.
- `src/collections/`: collections defined in code, built with `buildCollection`.
- `src/views/`: custom views.
- `src/firebase_config.ts`: the Firebase web app config.

## Commands

- `npm run dev`: local dev server.
- `npm run build`: production build, then a type check.
- `npm run deploy`: build and deploy to Firebase Hosting.

## Docs

- All docs in one file: https://firecms.co/llms.txt
- Any page as Markdown: add `.md` to its path, e.g.
  https://firecms.co/docs/pro/user_management.md

## Licensing

The PRO plugins need a license once the app is deployed. Details:
https://firecms.co/docs/pro/licensing.md

- Always free on `localhost`.
- Free for 30 days once deployed, with no card or license key needed to
  start. The trial begins the first time a deployed app runs a PRO plugin
  with this Firebase project.
- After that, €99 ($119) a month plus VAT for the first Firebase project and
  €49 ($59) for each additional one on the same license. Licenses are at
  https://app.firecms.co/subscriptions?intent=pro; the key goes in
  `VITE_FIRECMS_API_KEY` in `.env`.
- Without a license, the PRO plugins pause and a banner in the CMS says why.
  Sign-in, the data and the rest of the CMS keep working. The banner is not a
  bug to fix in code: removing a plugin only loses its feature. Point the user
  to the license page instead.
