---
id: deployment
title: Deployment to Firebase Hosting
sidebar_label: Deployment
---

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
        "public": "build",
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
```
yarn run build && firebase deploy --only hosting
```
to deploy.

