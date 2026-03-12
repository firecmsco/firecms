---
slug: pt/docs/collections/permissions
title: Permessi
sidebar_label: Permessi
---

Puoi definire i permessi `read`, `edit`, `create` e `delete` a livello di collezione, anche in base all'utente connesso.

Questi definiscono le azioni che l'utente connesso può eseguire su un'entità.

### Permessi semplici

Nel caso più semplice, puoi assegnare direttamente i permessi:

```tsx
import { buildCollection } from "@firecms/core";

buildCollection({
    path: "products",
    collection: productCollection,
    name: "Products",
    permissions: {
        edit: true,
        create: true,
        delete: false
    }
});
```

### Permessi avanzati

Puoi personalizzare i permessi in base all'utente connesso o qualsiasi altro criterio adatto al tuo caso d'uso.

Puoi usare un `PermissionBuilder`, come nell'esempio seguente, per personalizzare le azioni in base all'utente connesso.

Nell'esempio seguente controlliamo se abbiamo precedentemente salvato il ruolo "admin" nel campo extras nell'`AuthController`.

```tsx
import { buildCollection } from "@firecms/core";

buildCollection({
    path: "products",
    collection: productCollection,
    name: "Products",
    permissions: ({
                      entity,
                      path,
                      user,
                      authController,
                      context
                  }) => {
        const isAdmin = authController.extra?.roles.includes("admin");
        return ({
            edit: isAdmin,
            create: isAdmin,
            delete: isAdmin
        });
    }
});
```

Nota che puoi impostare il parametro `extra` nell'`AuthController` a qualsiasi dato che abbia senso per te. I posti suggeriti dove potresti voler impostare quel parametro sono `Authenticator` poiché viene inizializzato prima del resto dell'app.

Esempio rapido di come il campo `extra.roles` nell'esempio precedente viene inizializzato:

```tsx
import { Authenticator } from "@firecms/core";
import { FirebaseUserWrapper } from "@firecms/firebase";

const myAuthenticator: Authenticator<FirebaseUserWrapper> = async ({
                                                                       user,
                                                                       authController,
                                                                       dataSource
                                                                   }) => {
    // Questo è un esempio di recupero di dati asincroni relativi all'utente
    // e memorizzazione nel campo extra del controller
    const sampleUserData = await Promise.resolve({
        roles: ["admin"]
    });
    authController.setExtra(sampleUserData);

    console.log("Allowing access to", user);
    return true; // Consenti
};
```
