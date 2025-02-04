---
id: deployment
title: Deployment
sidebar_label: Deployment
description: Deploy your custom features effortlessly with FireCMS Cloud, as it stands out for its capability to host custom user code. FireCMS ensures a seamless integration of your unique needs by leveraging module federation and vite for compiling, allowing the use of any npm package. Simply run `yarn deploy` to serve your CMS directly from FireCMS Cloud without fretting over dependency clashes or CMS version updates. Additionally, FireCMS offers a CLI tool for straightforward cloud deployment management. Deploy outside of FireCMS Cloud with a PRO plan using Firebase Hosting; just configure SPA redirects in your Firebase project and deploy with `yarn run build && firebase deploy --only hosting` to bring your tailored CMS experience to the web.
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
