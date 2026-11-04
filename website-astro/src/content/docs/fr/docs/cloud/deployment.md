---
title: "Déployer votre CMS Firebase et interface d'administration"
slug: fr/docs/cloud/deployment
sidebar_label: Déploiement
description: "Déployez votre code CMS React personnalisé et votre panneau d'administration sur FireCMS Cloud. Hébergement entièrement géré pour votre système de gestion de contenu Firestore."
---

## Déploiement sur FireCMS Cloud

FireCMS est unique parmi les CMS en ce qu'il permet de téléverser du code personnalisé vers
sa version Cloud. C'est une fonctionnalité très avancée qui vous permet d'adapter
le CMS à vos besoins.

Le code est bundlé et compilé en utilisant la **fédération de modules** et
**vite**. Cela signifie que vous pouvez utiliser n'importe quel package npm pour créer votre CMS.
Le bundle n'inclura aucune des dépendances déjà
incluses dans FireCMS, vous pouvez donc utiliser n'importe quelle version de n'importe quel package.

Déployez votre code sur [FireCMS Cloud](https://app.firecms.co) avec une seule commande,
et il sera servi depuis là :

```bash
npm run deploy
```

ou

```bash
yarn deploy
```

L'avantage de cette approche est que vous pouvez utiliser n'importe quel package npm,
et vous pouvez utiliser la dernière version de FireCMS sans avoir à mettre à jour manuellement
votre code.

### CLI FireCMS

Le CLI FireCMS est un outil qui vous permet de déployer votre CMS sur FireCMS Cloud
avec une seule commande. Dans votre projet, vous devriez avoir `firecms` comme dépendance de développement.
Ce package s'appelait auparavant `@firecms/cli`.

Les commandes disponibles sont :

```bash
firecms login
```

```bash
firecms logout
```

et

```bash
firecms deploy --project=your-project-id
```

## Importer Firebase dans votre code

FireCMS Cloud fournit React, les packages FireCMS et le SDK Firebase à votre code : votre build n'en
embarque donc aucune copie. Ce sont les packages listés sous `shared` dans votre `vite.config.ts`, et
seuls les imports qui en nomment un exactement reçoivent la copie de FireCMS.

Pour Firebase, cela signifie importer depuis les packages `@firebase/…`, et non depuis les points
d'entrée `firebase/…` :

```ts
// À éviter : le build pointe vers un fichier qu'il ne produit jamais
import { getFunctions, httpsCallable } from "firebase/functions";

// À faire
import { getApp } from "@firebase/app";
import { getFunctions, httpsCallable } from "@firebase/functions";
```

Il en va de même pour `@firebase/firestore`, `@firebase/auth`, `@firebase/storage`,
`@firebase/analytics`, `@firebase/remote-config` et `@firebase/app-check`. Ils sont installés avec
`firebase` ; si votre gestionnaire de paquets ne les installe pas au niveau supérieur (pnpm, par
exemple), ajoutez ceux que vous importez à votre `package.json`.

`getApp()` renvoie l'application Firebase de votre projet, celle qu'utilise FireCMS. FireCMS ne l'a
peut-être pas encore initialisée au chargement de votre code : appelez donc `getApp()`,
`getFunctions()`, `getFirestore()` et autres lorsque votre code s'exécute, dans un composant ou un
callback, et non au niveau supérieur d'un fichier.

## Dépannage

### "Error loading remote config"

FireCMS affiche ce message lorsqu'il ne parvient pas à charger ou à exécuter votre code déployé.
Ouvrez la console du navigateur pour en voir la cause :

- **Un 404 sur un fichier nommé `__federation_shared_…`**, souvent suivi d'un message sur un type MIME
  non autorisé (`application/json`) : votre code importe un package partagé par un autre chemin,
  généralement `firebase/…` au lieu de `@firebase/…`. Voir
  [Importer Firebase dans votre code](#importer-firebase-dans-votre-code). Les versions récentes de `firecms deploy` le
  détectent avant l'envoi et indiquent les imports à modifier.
- **Une exception de votre propre code** : quelque chose a échoué pendant le chargement de votre
  configuration, par exemple un appel à `getFirestore()` au niveau supérieur d'un fichier avant
  l'initialisation de Firebase. La pile d'appels indique où.

L'absence de fichiers `__federation_shared_…` dans `dist/assets` est normale et ne signale pas un
build défectueux : FireCMS fournit ces packages, le build ne les inclut donc pas.

### Un 404 sur `material-icons-….woff2`

Si la console affiche un 404 pour `/assets/material-icons-….woff2` sur `api.firecms.co`, les icônes de
votre code risquent de ne pas s'afficher. Votre `vite.config.ts` est antérieur à la correction des URL
de polices du modèle : copiez le bloc `experimental.renderBuiltUrl` du
[`vite.config.ts` du modèle FireCMS Cloud](https://github.com/firecmsco/firecms/blob/main/packages/cli/templates/template_cloud/vite.config.ts) dans le vôtre, puis refaites le build et le
déploiement.

## Déploiement

Les projets FireCMS Cloud ne peuvent être déployés que sur FireCMS Cloud.

Si vous avez besoin d'une version auto-hébergée de FireCMS, vous pouvez utiliser le plan PRO, ou utiliser la version community.
Comme les API sont identiques pour toutes les versions, vous pouvez facilement basculer entre elles.
