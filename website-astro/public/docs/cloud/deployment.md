# Deploying your Firebase CMS and Admin UI

## Deployment to FireCMS Cloud

FireCMS is unique among CMSs in that it allows to upload custom code to
its Cloud version. This is a very advanced feature enables you to tailor
the CMS according to your requirements.

The code is bundled and compiled using **module federation** and
**vite**. This means that you can use any npm package you want to build your CMS.
The bundle will not include any of the dependencies that are already
included in FireCMS, so you can use any version of any package you want.

Deploy your code to [FireCMS Cloud](https://app.firecms.co) with a single command,
and it will be served from there:

```bash
npm run deploy
```

or

```bash
yarn deploy
```

The benefit of this approach is that you can use any npm package you want,
and you can use the latest version of FireCMS without having to manually
update your code.

### FireCMS CLI

The FireCMS CLI is a tool that allows you to deploy your CMS to FireCMS Cloud
with a single command. In your project, you should have `firecms` as a dev
dependency. This package was previously `@firecms/cli`.

The available commands are:

```bash
firecms login
```

```bash
firecms logout
```

and

```bash
firecms deploy --project=your-project-id
```

## Importing Firebase in your code

FireCMS Cloud provides React, the FireCMS packages and the Firebase SDK to your code, so your
build carries no copy of them. These are the packages listed under `shared` in your
`vite.config.ts`, and only imports that name one of them exactly get FireCMS's copy.

For Firebase, that means importing from the `@firebase/…` packages, not the `firebase/…`
entry points:

```ts
// Don't: the build points at a file it never produces
import { getFunctions, httpsCallable } from "firebase/functions";

// Do
import { getApp } from "@firebase/app";
import { getFunctions, httpsCallable } from "@firebase/functions";
```

The same goes for `@firebase/firestore`, `@firebase/auth`, `@firebase/storage`,
`@firebase/analytics`, `@firebase/remote-config` and `@firebase/app-check`. They are installed
along with `firebase`; if your package manager does not hoist them (pnpm, for example), add the
ones you import to your `package.json`.

`getApp()` returns your project's Firebase app, the one FireCMS uses. FireCMS may not have
initialized it yet when your code is loaded, so call `getApp()`, `getFunctions()`,
`getFirestore()` and the like when your code runs, inside a component or a callback, not at the
top level of a file.

## Troubleshooting

### "Error loading remote config"

FireCMS shows this when it cannot load or run your deployed code. Open the browser console to
see why:

- **A 404 on a file named `__federation_shared_…`**, often followed by a message about a
  disallowed MIME type (`application/json`): your code imports a shared package through a
  different path, usually `firebase/…` instead of `@firebase/…`. See
  [Importing Firebase in your code](#importing-firebase-in-your-code). Newer versions of
  `firecms deploy` catch this before uploading and name the imports to change.
- **An exception from your own code**: something threw while your config was loading, such as a
  call to `getFirestore()` at the top level of a file before Firebase was initialized. The stack
  trace points at it.

The absence of `__federation_shared_…` files in `dist/assets` is expected, not a sign of a
broken build: FireCMS provides those packages, so the build does not include them.

### A 404 on `material-icons-….woff2`

If the console shows a 404 for `/assets/material-icons-….woff2` on `api.firecms.co`, icons in
your code may not display. Your `vite.config.ts` predates the template's fix for font URLs: copy
the `experimental.renderBuiltUrl` block from the
[FireCMS Cloud template's `vite.config.ts`](https://github.com/firecmsco/firecms/blob/main/packages/cli/templates/template_cloud/vite.config.ts)
into yours, then build and deploy again.

## Deployment

FireCMS Cloud projects can only be deployed to FireCMS Cloud.

If you need a self-hosted version of FireCMS, you can use the PRO plan, or use the community version.
Since the APIs are the same for all versions, you can easily switch between them.

