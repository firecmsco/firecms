---
slug: de/docs/self/deployment
title: Self-Hosted Deployment
sidebar_label: Deployment
description: Deployment Ihrer FireCMS Self-Hosted Instanz auf Firebase Hosting oder anderen statischen Hosting-Plattformen.
---

FireCMS funktioniert als **Headless CMS** auf Firebase-Basis. Es wird als **Single Page Application** erstellt, die
bei jedem statischen Hosting-Anbieter deployed werden kann. Es ist kein Server-Code erforderlich.

Wir empfehlen das Deployment auf Firebase Hosting, da es im gleichen Ökosystem ist.

## Deployment auf Firebase Hosting

Wenn Sie Ihr CMS auf Firebase Hosting deployen möchten, müssen Sie es zuerst
im Hosting-Tab Ihres Firebase-Projekts aktivieren.

Sie müssen Firebase initialisieren, entweder mit einem bestehenden oder einem neuen Projekt:

```
firebase init
```

:::note
Sie müssen keinen der Dienste aktivieren, außer Firebase Hosting, wenn Sie dort deployen möchten.
:::

Damit alles wie erwartet funktioniert, müssen Sie Firebase Hosting-Redirects einrichten, damit es als SPA funktioniert.
Ihre **firebase.json** sollte ähnlich aussehen (ersetzen Sie `[YOUR_SITE_HERE]`):

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

Dann einfach ausführen:

```bash
npm run build && firebase deploy --only hosting
```

oder

```bash
yarn run build && firebase deploy --only hosting
```

## Deployment auf anderen Plattformen

Wenn Sie Ihr CMS auf anderen Plattformen deployen möchten, können Sie es mit folgendem Befehl erstellen:

```
yarn run build
```

und dann den **dist**-Orden bei Ihrem bevorzugten statischen Hosting-Anbieter hosten.
