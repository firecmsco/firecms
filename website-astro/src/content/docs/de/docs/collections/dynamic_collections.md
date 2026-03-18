---
title: Dynamische Kollektionen
slug: de/docs/collections/dynamic_collections
sidebar_label: Dynamische Kollektionen
description: Entsperren Sie personalisiertes Content-Management mit dynamischen Kollektionen in FireCMS, bei denen Kollektionen sich an das Profil des eingeloggten Benutzers anpassen können.
---

FireCMS bietet die Möglichkeit, Kollektionen dynamisch zu definieren. Das bedeutet,
dass Kollektionen asynchron aufgebaut werden können, basierend auf dem eingeloggten Benutzer,
basierend auf den Daten anderer Kollektionen oder basierend auf beliebigen anderen Bedingungen.

Anstatt Ihre Kollektionen als Array zu definieren, verwenden Sie einen `EntityCollectionsBuilder` —
eine Funktion, die ein Promise eines Objekts mit den Kollektionen zurückgibt.

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
Wenn Sie nur auf Eigenschaftsebene Anpassungen vornehmen möchten, lesen Sie den Abschnitt
[Bedingte Felder](../properties/conditional_fields). Beachten Sie, dass bedingte Felder jedoch nicht
für asynchrone Operationen geeignet sind.
:::

### Daten aus einer anderen Kollektion abrufen

Es kann vorkommen, dass eine Kollektionskonfiguration von den Daten einer anderen abhängt.
Zum Beispiel möchten Sie vielleicht die Enum-Werte einer Eigenschaft aus einer anderen Kollektion abrufen.

```tsx
import { useCallback } from "react";
import { buildCollection, EntityCollectionsBuilder } from "@firecms/core";

const collectionsBuilder: EntityCollectionsBuilder = async ({
                                                                user,
                                                                authController,
                                                                dataSource
                                                            }) => {

    // Angenommen, Sie haben eine Datenbankkollektion namens "categories"
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
                        // Wir können die enumValues-Eigenschaft verwenden, um die Enum-Werte zu definieren
                        // der gespeicherte Wert ist die ID der Kategorie
                        // und das UI-Label ist der Name der Kategorie
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

### In Verbindung mit Authentifizierung verwenden

Der `AuthController` verwaltet den Auth-Zustand und kann verwendet werden, um beliebige benutzerbezogene Daten zu speichern.

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
    const sampleUserRoles = await Promise.resolve(["admin"]);
    authController.setExtra(sampleUserRoles);

    return true;
}, []);
```

Dann können Sie auf die zusätzlichen Daten im `collectionsBuilder`-Callback zugreifen.

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

### Wo der `collectionsBuilder` verwendet wird

In der **Cloud-Version** von FireCMS fügen Sie den `collectionsBuilder` einfach zur `collections`-Prop Ihrer Hauptapp-Konfiguration hinzu.

```tsx
const collectionsBuilder: EntityCollectionsBuilder = async ({
                                                                user,
                                                                authController,
                                                                dataSource
                                                            }) => {
    return {
        collections: [] // Ihre Kollektionen hier
    };
};

export const appConfig: FireCMSAppConfig = {
    version: "1",
    collections: collectionsBuilder
};
```

In der **PRO-Version** von FireCMS können Sie den `collectionsBuilder` im `useBuildNavigationController`-Hook verwenden.

```tsx
const navigationController = useBuildNavigationController({
    collections: collectionsBuilder
});
```
