---
title: Entity-Aktionen
slug: de/docs/collections/entity_actions
sidebar_label: Entity-Aktionen
---

Entities können standardmäßig bearbeitet, gelöscht und dupliziert werden.

Die Standardaktionen werden basierend auf den Berechtigungen des Benutzers in der Kollektion aktiviert oder deaktiviert.

Wenn Sie benutzerdefinierte Aktionen hinzufügen müssen, können Sie dies tun, indem Sie sie in der `entityActions`-Prop der Kollektion definieren.

Sie können Entity-Aktionen auch global definieren, und sie werden in allen Kollektionen verfügbar sein.
Dies ist nützlich für Aktionen, die nicht spezifisch für eine einzelne Kollektion sind, wie eine „Teilen"-Aktion.
Beim Definieren einer globalen Entity-Aktion müssen Sie eine eindeutige `key`-Eigenschaft angeben.

Die Aktionen werden standardmäßig im Menü der Kollektionsansicht angezeigt
und in der Formularansicht, wenn `includeInForm` auf true gesetzt ist.

Sie können auf alle Controller von FireCMS im `context` zugreifen. Das ist nützlich für den Zugriff auf die Datenquelle, das Ändern von Daten, den Zugriff auf Speicher, das Öffnen von Dialogen usw.

In der `icon`-Prop können Sie ein React-Element übergeben, um ein Symbol neben dem Aktionsnamen anzuzeigen.
Wir empfehlen, eines der [FireCMS-Symbole](/docs/icons) zu verwenden, die im `@firecms/ui`-Paket verfügbar sind.

### Aktionen auf Kollektionsebene definieren

```tsx
import { buildCollection } from "@firecms/core";
import { ArchiveIcon } from "@firecms/ui";

export const productsCollection = buildCollection<Product>({
    id: "products",
    path: "products",
    name: "Products",
    singularName: "Product",
    icon: "shopping_cart",
    description: "List of the products currently sold in our shop",
    entityActions: [
        {
            icon: <ArchiveIcon/>,
            name: "Archive",
            onClick({
                        entity,
                        collection,
                        context,
                    }): Promise<void> {

                // Beachten Sie, dass Sie auf alle Controller im Kontext zugreifen können
                const dataSource = context.dataSource;

                // Fügen Sie hier Ihren Code ein
                return Promise.resolve(undefined);
            }
        }
    ],
    properties: {}
});
```

### Aktionen global definieren

Sie können Entity-Aktionen global definieren, indem Sie sie an die `FireCMS`-Komponente übergeben (bei Self-Hosting)
oder in der `FireCMSAppConfig` (bei FireCMS Cloud).

```tsx
import { ShareIcon } from "@firecms/ui";

// Self-Hosted
<FireCMS
    entityActions={[{
        key: "share",
        name: "Share",
        icon: <ShareIcon/>,
        onClick: ({ entity, context }) => {
            // Ihre Freigabelogik hier
        }
    }]}
    {...otherProps}
/>
```

```tsx
import { ShareIcon } from "@firecms/ui";

// FireCMS Cloud
const appConfig: FireCMSAppConfig = {
    entityActions: [{
        key: "share",
        name: "Share",
        icon: <ShareIcon/>,
        onClick: ({ entity, context }) => {
            // Ihre Freigabelogik hier
        }
    }],
    // ...weitere Konfiguration
};
```

#### EntityAction

* `name`: Name der Aktion
* `key`?: Schlüssel der Aktion. Sie müssen diesen nur angeben, wenn Sie die Standardaktionen überschreiben möchten oder wenn Sie die Aktion global definieren. Die Standardaktionen sind: `edit`, `delete`, `copy`
* `icon`?: React.ReactElement Symbol der Aktion
* `onClick`: (props: EntityActionClickProps) => Promise Funktion, die aufgerufen wird, wenn auf die Aktion geklickt wird
* `collapsed`?: boolean Diese Aktion im Menü der Kollektionsansicht eingeklappt anzeigen. Standardmäßig true
* `includeInForm`?: boolean Diese Aktion im Formular anzeigen, standardmäßig true
* `disabled`?: boolean Diese Aktion deaktivieren, standardmäßig false

## Beispiele

### Mit der `fetch`-API

Sie können die Standard-`fetch`-API verwenden, um jeden HTTP-Endpunkt aufzurufen.

```tsx
import { buildCollection, Product } from "@firecms/core";
import { ArchiveIcon } from "@firecms/ui";

export const productsCollection = buildCollection<Product>({
    id: "products",
    path: "products",
    entityActions: [
        {
            icon: <ArchiveIcon/>,
            name: "Archive",
            collapsed: false,
            onClick({
                        entity,
                        context,
                    }) {
                const snackbarController = context.snackbarController;
                return fetch("[YOUR_ENDPOINT]/archiveProduct", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        productId: entity.id
                    })
                }).then(() => {
                    snackbarController.open({
                        message: "Product archived",
                        type: "success"
                    });
                }).catch((error) => {
                    snackbarController.open({
                        message: "Error archiving product",
                        type: "error"
                    });
                });
            }
        }
    ],
});
```

### Mit dem Firebase Functions SDK

```tsx
import { getFunctions, httpsCallable } from "firebase/functions";
import { ArchiveIcon } from "@firecms/ui";
import { buildCollection, Product } from "@firecms/core";

const functions = getFunctions();
const archiveProductCallable = httpsCallable(functions, 'archiveProduct');

export const productsCollection = buildCollection<Product>({
    id: "products",
    path: "products",
    entityActions: [
        {
            icon: <ArchiveIcon/>,
            name: "Archive with Firebase",
            collapsed: false,
            async onClick({
                        entity,
                        context,
                    }) {
                const snackbarController = context.snackbarController;
                try {
                    await archiveProductCallable({ productId: entity.id });
                    snackbarController.open({
                        message: "Product archived successfully",
                        type: "success"
                    });
                } catch (error) {
                    snackbarController.open({
                        message: "Error archiving product: " + error.message,
                        type: "error"
                    });
                }
            }
        }
    ],
});
```
