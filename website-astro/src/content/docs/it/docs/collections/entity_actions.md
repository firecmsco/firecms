---
title: Azioni entità
sidebar_label: Azioni entità
---

Le entità possono essere modificate, eliminate e duplicate per impostazione predefinita.

Le azioni predefinite sono abilitate o disabilitate in base ai permessi dell'utente nella collezione.

Se hai bisogno di aggiungere azioni personalizzate, puoi farlo definendole nella prop `entityActions` della collezione.

Puoi anche definire azioni entità globalmente, e saranno disponibili in tutte le collezioni.
Questo è utile per azioni non specifiche di una singola collezione, come un'azione "Condividi".
Quando definisci un'azione entità globale, devi fornire una proprietà `key` univoca.

Le azioni verranno mostrate nel menu della vista collezione per impostazione predefinita e nella vista form se `includeInForm` è impostato su true.

Puoi accedere a tutti i controller di FireCMS nel `context`. Questo è utile per accedere al datasource, modificare dati, accedere allo storage, aprire dialoghi, ecc.

Nella prop `icon`, puoi passare un elemento React per mostrare un'icona accanto al nome dell'azione.
Ti consigliamo di usare qualsiasi delle [icone FireCMS](/docs/icons), disponibili nel pacchetto `@firecms/ui`.

### Definire azioni a livello di collezione

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

                // nota che puoi accedere a tutti i controller nel context
                const dataSource = context.dataSource;

                // Aggiungi il tuo codice qui
                return Promise.resolve(undefined);
            }
        }
    ],
    properties: {}
});
````

### Definire azioni globalmente

Puoi definire azioni entità globalmente passandole al componente `FireCMS` se fai self-hosting, o in `FireCMSAppConfig` se stai usando FireCMS Cloud.

```tsx
import { ShareIcon } from "@firecms/ui";

// Self-hosted
<FireCMS
    entityActions={[{
        key: "share",
        name: "Share",
        icon: <ShareIcon/>,
        onClick: ({ entity, context }) => {
            // La tua logica di condivisione qui
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
            // La tua logica di condivisione qui
        }
    }],
    // ...altra config
};
```

#### EntityAction

* `name`: Nome dell'azione
* `key`?: Chiave dell'azione. Devi fornirla solo se vuoi sovrascrivere le azioni predefinite, o se stai definendo l'azione globalmente.
  Le azioni predefinite sono:
  * `edit`
  * `delete`
  * `copy`
* `icon`?: React.ReactElement Icona dell'azione
* `onClick`: (props: EntityActionClickProps) => Promise
  Funzione da chiamare quando si clicca l'azione
* `collapsed`?: boolean Mostra questa azione compressa nel menu della vista collezione. Predefinito true.
* `includeInForm`?: boolean Mostra questa azione nel form, predefinito true
* `disabled`?: boolean Disabilita questa azione, predefinito false

#### EntityActionClickProps

* `entity`: Entità in fase di modifica
* `context`: FireCMSContext, usato per accedere a tutti i controller
* `fullPath`?: string
* `fullIdPath`?: string
* `collection`?: EntityCollection
* `formContext`?: FormContext, presente se l'azione viene chiamata da un form.
* `selectionController`?: SelectionController, usato per accedere alle entità selezionate o modificare la selezione
* `highlightEntity`?: (entity: Entity) => void
* `unhighlightEntity`?: (entity: Entity) => void
* `onCollectionChange`?: () => void
* `sideEntityController`?: SideEntityController
* `view`: "collection" | "form"
* `openEntityMode`: "side_panel" | "full_screen"
* `navigateBack`?: () => void

## Esempi

Costruiamo un esempio dove aggiungiamo un'azione per archiviare un prodotto.
Quando si clicca l'azione, chiameremo una Google Cloud Function che eseguirà della logica di business nel backend.

### Usando l'API `fetch`

Puoi usare l'API standard `fetch` per chiamare qualsiasi endpoint HTTP, inclusa una Google Cloud Function.

```tsx
import { buildCollection, Product } from "@firecms/core";
import { ArchiveIcon } from "@firecms/ui";

export const productsCollection = buildCollection<Product>({
    id: "products",
    path: "products",
    // altre proprietà
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
                        message: "Prodotto archiviato",
                        type: "success"
                    });
                }).catch((error) => {
                    snackbarController.open({
                        message: "Errore durante l'archiviazione del prodotto",
                        type: "error"
                    });
                });
            }
        }
    ],
});
```

### Usando l'SDK Firebase Functions

Se stai usando Firebase, l'approccio consigliato è usare l'SDK Firebase Functions. Semplifica la chiamata delle funzioni e gestisce automaticamente i token di autenticazione.

Prima, assicurati di avere il pacchetto `firebase` installato e inizializzato nel tuo progetto.

Poi, puoi definire la tua azione così:

```tsx
import { getFunctions, httpsCallable } from "firebase/functions";
import { ArchiveIcon } from "@firecms/ui";
import { buildCollection, Product } from "@firecms/core";

// Inizializza Firebase Functions
// Assicurati di aver inizializzato Firebase altrove nella tua app
const functions = getFunctions();
const archiveProductCallable = httpsCallable(functions, 'archiveProduct');

export const productsCollection = buildCollection<Product>({
    id: "products",
    path: "products",
    // altre proprietà
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
                        message: "Prodotto archiviato con successo",
                        type: "success"
                    });
                } catch (error) {
                    console.error("Errore durante l'archiviazione del prodotto:", error);
                    snackbarController.open({
                        message: "Errore durante l'archiviazione del prodotto: " + error.message,
                        type: "error"
                    });
                }
            }
        }
    ],
});
```
