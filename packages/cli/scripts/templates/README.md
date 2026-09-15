# Template checks

`firecms init` scaffolds five templates (`community`, `pro`, `next-pro`, `cloud`,
`astro`). The jest suite in `packages/cli/test` checks that they scaffold; these scripts
check that what they scaffold installs, builds and works, the way a new user meets it.

| Script | What it proves | Runs |
|---|---|---|
| `check.mjs` (`pnpm run test:templates`) | Every template, scaffolded from the CLI as it would be published, installs with **pnpm 11** against the **local** packages, builds, has FireCMS's styles, type-checks, uses no `@deprecated` API, and passes its license key to `<FireCMS>`. | CI on every change to `packages/**`; `publish.yml` before anything is published |
| `signed-in.mjs` (`pnpm run test:templates:signed-in`) | Each PRO template, built against the Firebase **emulators**, signs in in headless Chromium: the license check carries the key, the PRO plugins are mounted, Firestore data shows, drag-and-drop works where the collection editor is mounted, and an `.xlsx` imports. | CI on every change to `packages/**` |
| `smoke-published.mjs --version <v>` (`pnpm run test:templates:published`) | A **published** version: the CLI from npm scaffolds every template through the real `firecms init`, which installs with **npm 12** pinned to `<v>`, builds, type-checks and passes its license key. | `publish-canary.yml`, after each canary publish |

Each step exists because something shipped broken:

- **install (pnpm 11 / npm 12)**: current package managers refuse URL-resolved packages by
  default, and `@firecms/data_import` depended on SheetJS by URL, so no project could
  install. pnpm also does not hoist: `template_next_pro` imported `@firebase/*` it never
  declared, and `template_cloud`'s build could not resolve the modules it shares with
  the Cloud host.
- **styles**: `template_astro`'s Tailwind `@source` pointed at a folder that did not
  exist, so the CMS rendered half-unstyled.
- **deprecated**: templates passed plugins to the deprecated `plugins` prop of
  `<FireCMS>`, where navigation-level features (the collection editor's drag-and-drop,
  `modifyCollection`, plugin views) never applied.
- **license-key**: `template_next_pro` and `template_astro` documented a license key but
  never passed it to `<FireCMS>`.
- **signed-in**: the above, seen from a browser, plus the lazy spreadsheet reader, which can
  only fail at the moment a user picks a file.

## Running locally

Build the packages first (`pnpm run build` at the repo root). The scripts need network
access for the templates' dependencies; `signed-in.mjs` also needs Java 21 (on macOS the
newest installed 21+ is used even when `JAVA_HOME` points at an older JDK).

```bash
pnpm --filter @firecms/cli run test:templates --only pro,next-pro --jobs 2
pnpm --filter @firecms/cli run test:templates:signed-in --only astro --headed
pnpm --filter @firecms/cli run test:templates:published --version 3.4.1-canary.abc1234
```

Everything happens in a throwaway directory under the OS temp dir, never in the
monorepo, and nothing touches its lockfile. A passing run deletes it; a failing one
keeps only logs and screenshots, and prints where. Pass `--keep` to keep the installed
projects too (several GB across a few runs, so clean them up).

`--cli-dir <dir>` checks the templates of another CLI package (a directory named `cli`
with its `dist`, `templates` and `node_modules`), which is how to prove a check fails on
the bug it is for.

The scripts never log in: the CLI runs with an empty `HOME`, answers "no" to its login
prompt and has a stub `open` first on `PATH`, and the license check is answered in the
browser rather than sent.
