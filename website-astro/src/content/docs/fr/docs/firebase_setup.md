---
slug: fr/docs/firebase_setup
title: Configuration de Firebase
sidebar_label: Configuration de Firebase
description: Guide étape par étape pour configurer Firebase pour FireCMS, incluant Firestore, Authentication, Storage et les règles de sécurité.
---

FireCMS se connecte directement à votre projet **Firebase** pour fournir un puissant **panneau d'administration** pour votre **base de données Firestore**. Avant de pouvoir utiliser FireCMS comme **CMS headless** ou **back-office** pour votre application, vous devez configurer votre projet Firebase.

Ce guide couvre les étapes essentielles de configuration :
1. **Firestore** - Votre base de données principale
2. **Authentication** - Contrôlez qui peut accéder au panneau d'administration
3. **Storage** - Pour téléverser des fichiers et gérer des médias
4. **Règles de sécurité** - Protégez vos données

### Firestore

Vous devez activer **Firestore** dans votre projet. Vous pouvez initialiser les règles de sécurité en mode test pour permettre les lectures et les écritures, mais nous vous recommandons d'écrire des règles adaptées à votre domaine.

Notez que les règles doivent être définies pour chaque collection et doivent être définies d'une manière appropriée à votre domaine.

Consultez la [documentation Firestore](https://firebase.google.com/docs/firestore/security/get-started) pour plus d'informations.

:::important
Dans un projet Firestore par défaut, vos règles Firestore ne vous permettront probablement pas de lire ou d'écrire dans la base de données. Continuez à lire pour apprendre comment configurer vos règles.
:::

Par exemple, une règle simple qui permet à tout utilisateur authentifié de lire et d'écrire dans n'importe quelle collection serait :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Mais idéalement, vous voudrez la rendre plus restrictive. Pour que la démonstration de produits fonctionne, vos règles devraient ressembler à ceci :

```
rules_version = '2';
service cloud.firestore {

    // tout est privé par défaut
    match /{document=**} {
      allow read: if false;
      allow write: if false;
    }
    
    // permettre à tous de lire la collection products mais seulement aux utilisateurs authentifiés d'écrire
    match /databases/{database}/documents {
        match /products/{id=**} {
          allow read: if true;
          allow write: if request.auth != null;
        }
    }
    
    // permettre aux utilisateurs de modifier seulement leur propre document utilisateur
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
}
```

### Application Web

Dans la configuration du projet, vous devez créer une **application Web** dans votre projet, à partir de laquelle vous pouvez obtenir votre configuration Firebase sous forme d'objet Javascript. C'est l'objet que vous devez passer au CMS.

![firebase_setup](/img/firebase_setup_app.png)

:::tip[Firebase Hosting]
Notez que vous pouvez également lier votre nouvelle application web à **Firebase Hosting**, ce qui vous permettra de la déployer avec très peu d'effort. Vous pouvez créer le site Firebase Hosting à une étape ultérieure et le lier à votre application web.
:::

### Authentication

Vous voudrez probablement activer l'authentification pour passer l'écran de connexion initial.

:::important
Vite utilise l'URL par défaut `http://127.0.0.1:5173` pour le serveur de développement. Firebase Auth nécessitera l'ajout de cette URL aux domaines autorisés dans la console Firebase. Alternativement, vous pouvez utiliser l'URL `http://localhost:5173`.
:::

![firebase_setup](/img/firebase_setup_auth.png)

### Storage

Si vous souhaitez utiliser les différents champs de stockage fournis par le CMS, vous devez activer **Firebase Storage**. Le bucket par défaut sera utilisé pour enregistrer vos fichiers stockés.

:::note
Si vous rencontrez des problèmes avec CORS, vous pouvez activer CORS dans la configuration de votre bucket comme spécifié dans : https://firebase.google.com/docs/storage/web/download-files#cors_configuration

Créez un fichier avec le contenu :
```
[
  {
    "origin": ["*"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
```

et téléversez-le avec : `gsutil cors set cors.json gs://<votre-bucket-cloud-storage>`.
:::
