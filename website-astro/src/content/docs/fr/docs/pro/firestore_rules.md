---
title: Règles Firestore
slug: fr/docs/pro/firestore_rules
sidebar_label: Règles Firestore
description: Configurez les règles de sécurité Firestore pour FireCMS PRO afin de protéger la gestion des utilisateurs et les données de configuration des collections.
---

:::note
Ces règles s'appliquent spécifiquement à la configuration des plugins FireCMS PRO. Si vous utilisez la version community, vous êtes encouragé à écrire vos propres règles pour sécuriser vos données.
:::

FireCMS PRO sauvegarde certaines données de configuration dans Firestore pour gérer les rôles et permissions des utilisateurs, ainsi que la configuration des collections. Pour fonctionner correctement, vous devez configurer les règles Firestore pour permettre au plugin de lire et d'écrire sur les chemins spécifiés.

Voici les chemins par défaut utilisés par FireCMS (vous pouvez modifier ces chemins dans la configuration du plugin spécifique) :

- `__FIRECMS/config/users`
- `__FIRECMS/config/roles`
- `__FIRECMS/config/collections`

### Règles de configuration initiale

Selon la configuration de votre projet, l'utilisateur connecté pourrait ne pas avoir la permission d'écrire dans la base de données Firestore, dans le chemin de configuration FireCMS. Dans ce cas, nous suggérons d'autoriser temporairement l'accès au chemin `__FIRECMS` et aux sous-collections.

```
match /__FIRECMS/{document=**} {
  allow read: if true;
  allow write: if true;
}
```

### Règles finales suggérées

Après avoir créé le premier utilisateur et les rôles, vous pouvez à nouveau restreindre l'accès au chemin `__FIRECMS`. Nous vous encourageons à configurer des règles spécifiques pour votre projet, basées sur vos exigences de sécurité.

Voici les règles que nous suggérons :

```
match /{document=**} {
  allow read: if isFireCMSUser();
  allow write: if isFireCMSUser();
}

function isFireCMSUser(){
  return exists(/databases/$(database)/documents/__FIRECMS/config/users/$(request.auth.token.email));
}
```

Ces règles permettront aux utilisateurs ayant un rôle CMS de lire et écrire toutes les données dans votre base de données Firestore. Les rôles seront appliqués dans le frontend par FireCMS, mais si c'est une exigence pour votre projet, vous pouvez également les appliquer dans les règles Firestore, en définissant vos propres règles personnalisées.
