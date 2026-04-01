---
slug: fr/docs/self/auth_self_hosted
title: Authentification et gestion des utilisateurs
sidebar_label: Authentification et gestion des utilisateurs
description: Instructions pour configurer l'authentification et la gestion des utilisateurs pour une instance FireCMS auto-hébergée.
---

## Recommandé : FireCMS Pro et Cloud

Avant d'implémenter une authentification personnalisée, nous recommandons fortement de considérer **FireCMS Pro** ou **FireCMS Cloud**, qui incluent :

- ✅ Système de gestion des utilisateurs intégré
- ✅ Permissions basées sur les rôles (Admin, Éditeur, Lecteur)
- ✅ Interface de gestion d'équipe
- ✅ Système d'invitation des utilisateurs
- ✅ Permissions granulaires au niveau de la collection et du champ
- ✅ Journaux d'audit et suivi de l'activité des utilisateurs
- ✅ Fonctionnalités de sécurité de niveau enterprise

Ces solutions fournissent un système complet d'authentification et d'autorisation prêt à l'emploi, vous faisant gagner un temps de développement considérable et garantissant les meilleures pratiques de sécurité.

[En savoir plus sur la gestion des utilisateurs dans FireCMS Pro →](/docs/pro/user_management)

[Essayer FireCMS Cloud →](https://app.firecms.co)


:::note

Quand vous initialisez un nouveau projet FireCMS à l'aide du CLI, vous pourriez trouver un authentificateur standard dans votre fichier `App.tsx`. C'est une interface FireCMS standard qui ressemble à ceci (pas besoin de détester Flanders !) :

```typescript
const myAuthenticator: Authenticator<FirebaseUserWrapper> = useCallback(async ({
                                                                                   user,
                                                                                   authController
                                                                               }) => {
    if (user?.email?.includes("flanders")) {
        // Vous pouvez lancer une erreur pour empêcher l'accès
        throw Error("Stupid Flanders!");
    }
    console.log("Allowing access to", user);
    return true;
}, []);
```

C'est juste un espace réservé pour montrer où implémenter votre propre logique d'authentification. Vous pouvez le remplacer par l'un des authentificateurs décrits ci-dessous.

:::


## Partie 1 : Gestion de base des utilisateurs

Cette section explique comment créer une collection `users` pour gérer les utilisateurs. C'est la base pour implémenter les permissions.

### Créer une collection "Utilisateurs"

Cette collection stockera vos utilisateurs.

```typescript
import { buildCollection, buildProperty } from "@firecms/core";

export type User = {
  name: string;
  email: string;
};

export const usersCollection = buildCollection<User>({
  name: "Users",
  singularName: "User",
  path: "users",
  properties: {
    name: buildProperty({
      name: "Name",
      validation: { required: true },
      dataType: "string"
    }),
    email: buildProperty({
      name: "Email",
      validation: { required: true, email: true },
      dataType: "string"
    })
  }
});
```

:::tip
N'oubliez pas de configurer les règles de sécurité Firestore pour le chemin `users` afin de contrôler qui peut lire et écrire dans la collection.
:::

## Partie 2 : Permissions basées sur les rôles

Ajoutons un `role` à nos utilisateurs et utilisons-le pour contrôler l'accès.

### Étape 1 : Mettre à jour la collection "Utilisateurs" avec des rôles

Ajoutez une propriété `role` à votre type et collection `User`.

```typescript
import { buildCollection, buildProperty } from "@firecms/core";

export enum UserRole {
  admin = "admin",
  editor = "editor",
  viewer = "viewer",
}

export type User = {
  name: string;
  email: string;
  role: UserRole;
}

export const usersCollection = buildCollection<User>({
  name: "Users",
  singularName: "User",
  path: "users",
  properties: {
    name: buildProperty({
      name: "Name",
      validation: { required: true },
      dataType: "string"
    }),
    email: buildProperty({
      name: "Email",
      validation: { required: true, email: true },
      dataType: "string"
    }),
    role: buildProperty({
      name: "Role",
      validation: { required: true },
      dataType: "string",
      enumValues: {
        admin: "Admin",
        editor: "Editor",
        viewer: "Viewer"
      }
    })
  }
});
```

### Étape 2 : Implémenter un authentificateur basé sur les rôles

Créez d'abord un nouveau fichier nommé `src/custom_authenticator.ts`. Ce fichier contiendra votre logique d'authentification.

**`src/custom_authenticator.ts`**
```typescript
import { Authenticator } from "@firecms/core";
import { FirebaseUserWrapper } from "@firecms/firebase";
import { User } from "./collections/users"; // Assurez-vous d'importer votre type User

export const roleBasedAuthenticator: Authenticator<FirebaseUserWrapper> = async ({
  user,
  authController,
  dataSourceDelegate
}) => {
  if (!user?.email) return false;

  try {
    const userEntities = await dataSourceDelegate.fetchCollection<User>({
      path: "users",
      filter: { email: ["==", user.email] }
    });

    if (userEntities && userEntities.length > 0) {
      const member = userEntities[0].values;
      authController.setExtra({
        role: member.role
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error("Authentication error:", error);
    return false;
  }
};
```

Maintenant, importez le `roleBasedAuthenticator` dans votre `App.tsx` et passez-le au composant `FirebaseCMSApp`.

**`src/App.tsx`**
```typescript
import { FirebaseCMSApp } from "@firecms/firebase";
import { roleBasedAuthenticator } from "./custom_authenticator";
import { usersCollection } from "./collections/users"; // Assurez-vous d'importer vos collections

// ... autres imports

function App() {
    // ... autre logique de composant

    return (
        <FirebaseCMSApp
            name={"My App"}
            authentication={roleBasedAuthenticator}
            collections={[usersCollection, /* ...autres collections */]}
            // ... autres props
        />
    );
}

export default App;
```

### Étape 3 : Appliquer les permissions aux collections

Utilisez le callback `permissions` dans vos collections pour contrôler l'accès en fonction du rôle de l'utilisateur.

```typescript
import { buildCollection } from "@firecms/core";
import { UserRole } from "./collections/users";

export const postsCollection = buildCollection({
  name: "Posts",
  path: "posts",
  permissions: ({ authController }) => {
    const userRole = authController.extra?.role;
    return {
      read: true, // Tous les rôles peuvent lire
      edit: userRole === UserRole.admin || userRole === UserRole.editor,
      create: userRole === UserRole.admin || userRole === UserRole.editor,
      delete: userRole === UserRole.admin
    };
  },
  // ... propriétés
});
```

## Partie 3 : Utiliser les Custom Claims Firebase pour les permissions

Une alternative au stockage des rôles dans Firestore est d'utiliser les custom claims de Firebase Authentication.

### Étape 1 : Définir les Custom Claims

Vous devez définir des custom claims pour un utilisateur depuis un environnement backend en utilisant le Firebase Admin SDK. Cela se fait généralement dans une Cloud Function.

```typescript
// Exemple de Cloud Function pour définir un claim de rôle
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const setUserRole = functions.https.onCall(async (data, context) => {
  if (!context.auth?.token.admin) {
    throw new functions.https.HttpsError("permission-denied", "Must be an admin to set roles.");
  }

  const { uid, role } = data;
  await admin.auth().setCustomUserClaims(uid, { role });

  return { message: `Success! User ${uid} has been given the role of ${role}.` };
});
```

### Étape 2 : Implémenter un authentificateur basé sur les Claims

Cet authentificateur lit les custom claims depuis le token d'ID de l'utilisateur.

```typescript
import { Authenticator } from "@firecms/core";
import { FirebaseUserWrapper } from "@firecms/firebase";

export const claimsAuthenticator: Authenticator<FirebaseUserWrapper> = async ({
  user,
  authController
}) => {
  if (!user) return false;

  try {
    const idTokenResult = await user.firebaseUser.getIdTokenResult(true); // Forcer le rafraîchissement
    const role = idTokenResult.claims.role || "viewer"; // Par défaut 'viewer' si aucun claim de rôle
    authController.setExtra({ role });
    return true;
  } catch (error) {
    console.error("Authentication error:", error);
    return false;
  }
};
```

### Étape 3 : Utiliser les Claims dans les collections

L'implémentation des `permissions` est la même que pour l'approche basée sur les rôles, car le rôle est extrait et placé dans `authController.extra`.

```typescript
import { buildCollection } from "@firecms/core";

export const articlesCollection = buildCollection({
  name: "Articles",
  path: "articles",
  permissions: ({ authController }) => {
    const userRole = authController.extra?.role;
    return {
      read: true,
      edit: userRole === "admin" || userRole === "editor",
      create: userRole === "admin" || userRole === "editor",
      delete: userRole === "admin"
    };
  },
  // ... propriétés
});
```

## Meilleures pratiques de sécurité

- **Règles de sécurité Firestore** : Appliquez toujours des règles de sécurité dans votre backend. Les permissions côté client sont à des fins d'interface utilisateur et peuvent être contournées.
- **Validation côté serveur** : Pour les opérations critiques, validez les permissions sur un serveur.
- **Principe du moindre privilège** : Accordez aux utilisateurs le niveau d'accès minimum dont ils ont besoin.
