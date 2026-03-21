---
slug: docs/cloud/deployment
title: "Deploying your Rebase CMS and Admin UI"
sidebar_label: Deployment
description: "Deploy your custom React CMS and admin panel code to Rebase Cloud. Fully managed hosting for your PostgreSQL content management system."
---

## Deployment to Rebase Cloud

Rebase is unique among CMSs in that it allows to upload custom code to
its Cloud version. This is a very advanced feature enables you to tailor
the CMS according to your requirements.

The code is bundled and compiled using **module federation** and
**vite**. This means that you can use any npm package you want to build your CMS.
The bundle will not include any of the dependencies that are already
included in Rebase, so you can use any version of any package you want.

Deploy your code to [Rebase Cloud](https://app.rebase.pro) with a single command,
and it will be served from there:

```bash
npm run deploy
```

or

```bash
yarn deploy
```

The benefit of this approach is that you can use any npm package you want,
and you can use the latest version of Rebase without having to manually
update your code.

### Rebase CLI

The Rebase CLI is a tool that allows you to deploy your CMS to Rebase Cloud
with a single command. In your project, you should have `rebase` as a dev
dependency. This package was previously `@rebasepro/cli`.

The available commands are:

```bash
rebase login
```

```bash
rebase logout
```

and

```bash
rebase deploy --project=your-project-id
```

## Deployment

Rebase Cloud projects can only be deployed to Rebase Cloud.

If you need a self-hosted version of Rebase, you can use the PRO plan, or use the community version.
Since the APIs are the same for all versions, you can easily switch between them.
