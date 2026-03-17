---
title: Collezioni dinamiche
sidebar_label: Collezioni dinamiche
description: Sblocca la gestione dei contenuti personalizzata con le Collezioni Dinamiche in FireCMS, dove le collezioni possono adattarsi al profilo dell'utente connesso tramite callback asincrone.
---

FireCMS offre la possibilità di definire collezioni dinamicamente. Questo significa che le collezioni possono essere costruite in modo asincrono, in base all'utente connesso, ai dati di altre collezioni, o in base a qualsiasi altra condizione arbitraria.

Invece di definire le tue collezioni come un array, usa un `EntityCollectionsBuilder`, una funzione che restituisce una promise di un oggetto contenente le collezioni.

```tsx
import { EntityCollectionsBuilder } from "@firecms/core";

// ...

const collectionsBuilder: EntityCollectionsBuilder = async ({
                                                                user,
                                                                authController,
                                                                dataSource
                                                            }) =>
    ({
        collections: [
            buildCollection({
                path: "products",
                properties: {}, // ...
                name: "Products"
            })
        ]
    });
```

:::note
Se vuoi fare personalizzazioni solo a livello di proprietà, controlla la sezione [campi condizionali](../properties/conditional_fields). Ma nota che i campi condizionali non sono adatti per operazioni asincrone.
:::

### Recuperare dati da una collezione diversa

Potrebbe capitare che la configurazione di una collezione dipenda dai dati di un'altra. Ad esempio, potresti voler recuperare i valori enum di una proprietà da una collezione diversa.

In questo esempio recupereremo dati da una collezione chiamata `categories` e li useremo per popolare i valori enum di una proprietà chiamata `category`, nella collezione `products`.

```tsx
import { useCallback } from "react";
import { buildCollection, EntityCollectionsBuilder } from "@firecms/core";

const collectionsBuilder: EntityCollectionsBuilder = async ({
                                                                user,
                                                                authController,
                                                                dataSource
                                                            }) => {

    // supponiamo che tu abbia una collezione del database chiamata "categories"
    const categoriesData: Entity<any>[] = await dataSource.fetchCollection({
        path: "categories"
    });

    return {
        collections: [
            buildCollection({
                id: "products",
                path: "products",
                properties: {
                    // ...
                    category: {
                        dataType: "string",
                        name: "Category",
                        // possiamo usare la proprietà enumValues per definire i valori enum
                        // il valore memorizzato sarà l'id della categoria
                        // e l'etichetta UI sarà il nome della categoria
                        enumValues: categoriesData.map((category: any) => ({
                            id: category.id,
                            label: category.values.name
                        }))
                    }
                    // ...
                },
                name: "Products"
            })
        ]
    }
};

```

### Uso in combinazione con l'autenticazione

L'`AuthController` gestisce lo stato auth. Può anche essere usato per memorizzare qualsiasi oggetto arbitrario correlato all'utente.

Un caso d'uso tipico è memorizzare alcuni dati aggiuntivi relativi all'utente, ad esempio i ruoli o i permessi.

```tsx
import { useCallback } from "react";

const myAuthenticator: Authenticator<FirebaseUserWrapper> = useCallback(async ({
                                                                            user,
                                                                            authController
                                                                        }) => {

    if (user?.email?.includes("flanders")) {
        throw Error("Stupid Flanders!");
    }

    console.log("Allowing access to", user?.email);
    // Questo è un esempio di recupero di dati asincroni relativi all'utente
    // e memorizzazione nel campo extra del controller.
    const sampleUserRoles = await Promise.resolve(["admin"]);
    authController.setExtra(sampleUserRoles);

    return true;
}, []);
```

Poi puoi accedere ai dati extra nella callback `collectionsBuilder`.

```tsx
const collectionsBuilder: EntityCollectionsBuilder = useCallback(async ({
                                                                            user,
                                                                            authController,
                                                                            dataSource
                                                                        }) => {

    const userRoles = authController.extra;

    if (userRoles?.includes("admin")) {
        return {
            collections: [
                buildCollection({
                    path: "products",
                    properties: {}, // ...
                    name: "Products"
                })
            ]
        };
    } else {
        return {
            collections: []
        };
    }
}, []);
```

### Dove usare il `collectionsBuilder`

Nella **versione Cloud** di FireCMS, aggiungi semplicemente il `collectionsBuilder` alla prop `collections` della configurazione principale della tua app.

```tsx

const collectionsBuilder: EntityCollectionsBuilder = async ({
                                                                user,
                                                                authController,
                                                                dataSource
                                                            }) => {
    return {
        collections: [] // le tue collezioni qui
    };
};

export const appConfig: FireCMSAppConfig = {
    version: "1",
    collections: collectionsBuilder
};
```

Nella **versione PRO** di FireCMS, puoi usare il `collectionsBuilder` nell'hook `useBuildNavigationController`.

```tsx
const navigationController = useBuildNavigationController({
    collections: collectionsBuilder
});
```
