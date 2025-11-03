---
slug: docs/self/deployment
title: Self-Hosted Deployment
sidebar_label: Deployment
description: Deploy your custom features effortlessly with FireCMS PRO, as it stands out for its capability to host custom user code. FireCMS ensures a seamless integration of your unique needs by leveraging module federation and vite for compiling, allowing the use of any npm package. Simply run `npm run deploy` or `yarn deploy` to serve your CMS directly from FireCMS Cloud without fretting over dependency clashes or CMS version updates. Additionally, FireCMS offers a CLI tool for straightforward cloud deployment management. Deploy outside of FireCMS Cloud with a PRO plan using Firebase Hosting; just configure SPA redirects in your Firebase project and deploy with `npm run build && firebase deploy --only hosting` or `yarn run build && firebase deploy --only hosting` to bring your tailored CMS experience to the web.
---

FireCMS works as a **headless CMS** on top of Firebase. It builds as a **single page application** that can be deployed 
to any static hosting provider. It does not require any server-side code. 

We recommend deploying to Firebase Hosting, as it is in the same ecosystem, and FireCMS will even
pick up the Firebase config from the environment.


## Deployment to Firebase Hosting

If you would like to deploy your CMS to Firebase Hosting, you need to enable
it first in the Hosting tab of your Firebase project.

You will need to init Firebase, either with an existing project or a new one:

```
firebase init
```

:::note
You don't need to enable any of the services, besides Firebase Hosting if you
would like to deploy it there.
:::

You can link the Firebase hosting site to the webapp that you have created
in order to get your Firebase config.

In order to make everything work as expected, you need to setup Firebase Hosting
redirects to work as a SPA. Your **firebase.json** should
look similar to this (remember to replace `[YOUR_SITE_HERE]`).

```json5
{
  "hosting": {
    "site": "[YOUR_SITE_HERE]",
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}

```

Then simply run:

```bash
npm run build && firebase deploy --only hosting
```

or

```bash
yarn run build && firebase deploy --only hosting
```

to deploy.

```bash
npm run build


or

```bash
## Deploying to other platforms

If you would like to deploy your CMS to other platforms, you can build it
with:

```
yarn run build
```

and then serve the **dist** folder with your favorite static hosting provider.

