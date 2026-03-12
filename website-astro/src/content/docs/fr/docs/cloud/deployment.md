---
slug: fr/docs/cloud/deployment
title: "Déployer votre CMS Firebase et interface d'administration"
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

## Déploiement

Les projets FireCMS Cloud ne peuvent être déployés que sur FireCMS Cloud.

Si vous avez besoin d'une version auto-hébergée de FireCMS, vous pouvez utiliser le plan PRO, ou utiliser la version community.
Comme les API sont identiques pour toutes les versions, vous pouvez facilement basculer entre elles.
