---
title: Déploiement auto-hébergé
slug: fr/docs/self/deployment
sidebar_label: Déploiement
description: Déployez votre CMS FireCMS auto-hébergé sur Firebase Hosting ou tout autre hébergeur statique.
---

FireCMS fonctionne comme un **CMS headless** au-dessus de Firebase. Il se compile en une **application monopage** qui peut être déployée
sur n'importe quel hébergeur statique. Il ne nécessite aucun code côté serveur.

Nous recommandons de déployer sur Firebase Hosting, car il est dans le même écosystème, et FireCMS récupérera même
la configuration Firebase depuis l'environnement.


## Déploiement sur Firebase Hosting

Si vous souhaitez déployer votre CMS sur Firebase Hosting, vous devez l'activer d'abord
dans l'onglet Hosting de votre projet Firebase.

Vous devrez initialiser Firebase, soit avec un projet existant, soit avec un nouveau :

```
firebase init
```

:::note
Vous n'avez pas besoin d'activer d'autres services, en dehors de Firebase Hosting si vous
souhaitez le déployer là.
:::

Vous pouvez lier le site Firebase Hosting à l'application web que vous avez créée
afin d'obtenir votre configuration Firebase.

Pour que tout fonctionne correctement, vous devez configurer les redirections Firebase Hosting
pour fonctionner comme une SPA. Votre **firebase.json** devrait
ressembler à ceci (n'oubliez pas de remplacer `[YOUR_SITE_HERE]`).

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

Puis lancez simplement :

```bash
npm run build && firebase deploy --only hosting
```

ou

```bash
yarn run build && firebase deploy --only hosting
```

pour déployer.

## Déploiement sur d'autres plateformes

Si vous souhaitez déployer votre CMS sur d'autres plateformes, vous pouvez le compiler avec :

```
yarn run build
```

puis servir le dossier **dist** avec votre hébergeur statique préféré.
