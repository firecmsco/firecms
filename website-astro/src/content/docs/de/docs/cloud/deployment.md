---
title: "Ihr Firebase CMS und Admin-UI deployen"
slug: de/docs/cloud/deployment
sidebar_label: Deployment
description: "Deployen Sie Ihren benutzerdefinierten React-CMS und Admin-Panel-Code zu FireCMS Cloud. Vollständig verwaltetes Hosting für Ihr Firestore Content-Management-System."
---

## Deployment zu FireCMS Cloud

FireCMS ist einzigartig unter den CMS-Systemen, da es das Hochladen von benutzerdefiniertem Code
in seine Cloud-Version ermöglicht. Diese sehr fortgeschrittene Funktion ermöglicht es Ihnen, das
CMS nach Ihren Anforderungen anzupassen.

Der Code wird mit **Module Federation** und **Vite** gebündelt und kompiliert. Das bedeutet, dass Sie
jedes npm-Paket verwenden können, das Sie für den Aufbau Ihres CMS benötigen.

Deployen Sie Ihren Code zu [FireCMS Cloud](https://app.firecms.co) mit einem einzigen Befehl:

```bash
npm run deploy
```

oder

```bash
yarn deploy
```

## Deployment außerhalb von FireCMS Cloud

Wenn Sie ein **FireCMS PRO**-Abonnement haben, können Sie Ihr CMS außerhalb von FireCMS Cloud deployen.

Sie können Ihr Projekt auf Firebase Hosting oder jedem anderen statischen Hosting-Anbieter deployen.

```bash
npm run build && firebase deploy --only hosting
```
