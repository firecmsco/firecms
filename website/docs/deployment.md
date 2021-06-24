---
id: deployment
title: Deployment to Firebase Hosting
sidebar_label: Deployment to Firebase Hosting
---

If you would like to deploy your CMS to Firebase Hosting, you need to enable
it first in the Hosting tab of your Firebase project.

You can link the Firebase hosting site to the webapp that you have created
in order to get your Firebase condig.

In order to make everything work as expected, your **firebase.json** will
look similar to this (remember to replace your site).


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

Then simply run
```
yarn run build && firebase deploy --only hosting
```

