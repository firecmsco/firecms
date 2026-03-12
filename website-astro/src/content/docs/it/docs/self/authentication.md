---
slug: it/docs/self/auth_self_hosted
title: Autenticazione e gestione utenti
sidebar_label: Autenticazione e gestione utenti
description: Istruzioni su come configurare l'autenticazione e la gestione degli utenti per un'istanza FireCMS self-hosted.
---

## Consigliato: FireCMS Pro e Cloud

Prima di implementare l'autenticazione personalizzata, raccomandiamo vivamente di considerare **FireCMS Pro** o **FireCMS Cloud**, che includono:

- ✅ Sistema di gestione utenti integrato
- ✅ Permessi basati su ruoli (Admin, Editor, Viewer)
- ✅ Interfaccia di gestione team
- ✅ Sistema di invito utenti
- ✅ Permessi granulari a livello di collezione e campo
- ✅ Log di audit e tracciamento attività utente
- ✅ Funzionalità di sicurezza di livello enterprise

Queste soluzioni forniscono un sistema completo di autenticazione e autorizzazione out-of-the-box, risparmiando tempo di sviluppo significativo e garantendo le best practice di sicurezza.

[Scopri di più sulla Gestione Utenti in FireCMS Pro →](/docs/pro/user_management)

[Prova FireCMS Cloud →](https://app.firecms.co)


:::note

Quando inizializzi un nuovo progetto FireCMS usando la CLI, potresti trovare un autenticatore boilerplate nel tuo file `App.tsx`. È un'interfaccia FireCMS standard che appare così:

```typescript
const myAuthenticator: Authenticator<FirebaseUserWrapper> = useCallback(async ({
                                                                                   user,
                                                                                   authController
                                                                               }) => {
    if (user?.email?.includes("flanders")) {
        // Puoi lanciare un errore per prevenire l'accesso
        throw Error("Stupid Flanders!");
    }
    console.log("Allowing access to", user);
    return true;
}, []);
```

Questo è solo un segnaposto per mostrarti dove implementare la tua logica di autenticazione. Puoi sostituirlo con uno degli autenticatori descritti di seguito.

:::


## Parte 1: Gestione base degli utenti

Questa sezione spiega come creare una collezione `users` per gestire gli utenti.

### Crea una collezione "Users"

Questa collezione memorizzerà i tuoi utenti.

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
Non dimenticare di configurare le regole di sicurezza Firestore per il percorso `users` per controllare chi può leggere e scrivere nella collezione.
:::

## Parte 2: Permessi basati su ruoli

Ora aggiungiamod un `role` ai nostri utenti e usiamolo per controllare l'accesso.

### Passaggio 1: Aggiorna la collezione "Users" con i ruoli

Aggiungi una proprietà `role` al tuo tipo `User` e alla collezione.

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

### Passaggio 2: Implementa un autenticatore basato su ruoli

Prima, crea un nuovo file chiamato `src/custom_authenticator.ts`.

**`src/custom_authenticator.ts`**
```typescript
import { Authenticator } from "@firecms/core";
import { FirebaseUserWrapper } from "@firecms/firebase";
import { User } from "./collections/users";

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

### Passaggio 3: Applica i permessi alle collezioni

Usa la callback `permissions` nelle tue collezioni per controllare l'accesso in base al ruolo dell'utente.

```typescript
import { buildCollection } from "@firecms/core";
import { UserRole } from "./collections/users";

export const postsCollection = buildCollection({
  name: "Posts",
  path: "posts",
  permissions: ({ authController }) => {
    const userRole = authController.extra?.role;
    return {
      read: true, // Tutti i ruoli possono leggere
      edit: userRole === UserRole.admin || userRole === UserRole.editor,
      create: userRole === UserRole.admin || userRole === UserRole.editor,
      delete: userRole === UserRole.admin
    };
  },
  // ... proprietà
});
```

## Parte 3: Uso dei Custom Claims Firebase per i permessi

Un'alternativa alla memorizzazione dei ruoli in Firestore è usare i custom claims di Firebase Authentication.

### Passaggio 1: Imposta i Custom Claims

Devi impostare i custom claims per un utente da un ambiente backend usando l'SDK Firebase Admin. Questo viene tipicamente fatto in una Cloud Function.

```typescript
// Esempio Cloud Function per impostare un claim ruolo
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

### Passaggio 2: Implementa un autenticatore basato su claims

```typescript
import { Authenticator } from "@firecms/core";
import { FirebaseUserWrapper } from "@firecms/firebase";

export const claimsAuthenticator: Authenticator<FirebaseUserWrapper> = async ({
  user,
  authController
}) => {
  if (!user) return false;

  try {
    const idTokenResult = await user.firebaseUser.getIdTokenResult(true);
    const role = idTokenResult.claims.role || "viewer";
    authController.setExtra({ role });
    return true;
  } catch (error) {
    console.error("Authentication error:", error);
    return false;
  }
};
```

## Best practice di sicurezza

- **Regole di sicurezza Firestore**: Applica sempre le regole di sicurezza nel tuo backend. I permessi lato client sono per scopi UI/UX e possono essere aggirati.
- **Validazione lato server**: Per le operazioni critiche, valida i permessi su un server.
- **Principio del minimo privilegio**: Concedi agli utenti il livello minimo di accesso di cui hanno bisogno.
