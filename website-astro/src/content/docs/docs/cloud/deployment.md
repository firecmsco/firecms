---
slug: docs/cloud/deployment
title: Deploying your Firebase CMS & Admin UI
sidebar_label: Deployment
description: Deploy your custom **React CMS** and admin panel code to FireCMS Cloud. Fully managed hosting for your Firestore content management system.
---

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

## Deployment

FireCMS Cloud projects can only be deployed to FireCMS Cloud. 

If you need a self-hosted version of FireCMS, you can use the PRO plan, or use the community version.
Since the APIs are the same for all versions, you can easily switch between them.
