# Notes for coding agents

This is an Astro website with a FireCMS PRO admin panel at `/cms`. The CMS
reads and writes a Firebase project's Firestore and Storage, with PRO plugins
such as user management and import/export.

## Layout

- `src/cms/App.tsx`: the CMS: sign-in, the PRO plugins, and the collections.
- `src/cms/collections/`: collections defined in code, built with `buildCollection`.
- `src/pages/`: the website's pages, and the page that mounts the CMS.
- `src/common/firebase_config.ts`: the Firebase web app config.

## Commands

- `npm run dev`: local dev server.
- `npm run build`: production build.
- `npm run preview`: serve the production build.

## UI

Build every screen from `@firecms/ui`: `Button`, `TextField`, `Select`,
`Dialog`, `Typography`, `Paper`, Material icons such as `AddIcon`. These are
the components FireCMS itself is made of, so custom views match the rest of
the app in light and dark mode. Don't add MUI, lucide or another UI library,
and use the `surface-*` and `primary` color tokens with `dark:` pairs instead
of hex colors.

The FireCMS skills `firecms-ui-components` and `firecms-design-language`
document the kit and the page layouts. Agents that read skills over MCP get
them from the FireCMS MCP server (`npx -y @firecms/mcp-server`); otherwise
install them with `npx skills add firecmsco/firecms`.

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
  `PUBLIC_FIRECMS_API_KEY` in `.env`.
- Without a license, the PRO plugins pause and a banner in the CMS says why.
  Sign-in, the data and the rest of the CMS keep working. The banner is not a
  bug to fix in code: removing a plugin only loses its feature. Point the user
  to the license page instead.
