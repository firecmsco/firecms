---
slug: it/docs/collections/callbacks
title: Callback delle entità
sidebar_label: Callback delle entità
---

Quando si lavora con un'entità, puoi allegare diversi callback prima e dopo che viene salvata o recuperata:
`onFetch`, `onIdUpdate`, `onPreSave`, `onSaveSuccess` e `onSaveFailure`.

Questi callback sono definiti a livello di collezione sotto la prop `callbacks`.

Il callback `onIdUpdate` può essere usato per aggiornare l'ID dell'entità prima di salvarla. Questo è utile se hai bisogno di generare l'ID da altri campi.

Questo è utile se hai bisogno di aggiungere logica o modificare alcuni campi dell'entità prima/dopo il salvataggio o l'eliminazione delle entità.

La maggior parte dei callback è asincrona.

:::note
Puoi fermare l'esecuzione di questi callback lanciando un `Error` contenente una `string` e verrà visualizzato uno snackbar di errore.
:::

:::tip
Puoi usare l'oggetto `context` per accedere al contesto FireCMS.
L'oggetto `context` contiene tutti i controller e i servizi disponibili nell'app,
inclusi `authController`, `dataSource`, `storageSource`, `sideDialogsController`, ecc.
:::

```tsx
import {
    buildCollection,
    buildEntityCallbacks,
    EntityOnDeleteProps,
    EntityOnSaveProps,
    EntityOnFetchProps,
    EntityIdUpdateProps,
    toSnakeCase
} from "@firecms/core";

type Product = {
    name: string;
    uppercase_name: string;
}

const productCallbacks = buildEntityCallbacks({
    onPreSave: ({
                    collection,
                    path,
                    entityId,
                    values,
                    previousValues,
                    status
                }) => {
        // restituisce i valori aggiornati
        values.uppercase_name = values.name?.toUpperCase();
        return values;
    },

    onSaveSuccess: (props: EntityOnSaveProps<Product>) => {
        console.log("onSaveSuccess", props);
    },

    onSaveFailure: (props: EntityOnSaveProps<Product>) => {
        console.log("onSaveFailure", props);
    },

    onPreDelete: ({
                      collection,
                      path,
                      entityId,
                      entity,
                      context
                  }: EntityOnDeleteProps<Product>
    ) => {
        if (!context.authController.user)
            throw Error("Gli utenti non connessi non possono eliminare i prodotti");
    },

    onDelete: (props: EntityOnDeleteProps<Product>) => {
        console.log("onDelete", props);
    },

    onFetch({
                collection,
                context,
                entity,
                path,
            }: EntityOnFetchProps) {
        entity.values.name = "Forced name";
        return entity;
    },

    onIdUpdate({
                   collection,
                   context,
                   entityId,
                   path,
                   values
               }: EntityIdUpdateProps): string {
        // restituisce l'ID desiderato
        return toSnakeCase(values?.name)
    },
});

const productCollection = buildCollection<Product>({
    name: "Product",
    path: "products",
    properties: {
        name: {
            name: "Name",
            validation: { required: true },
            dataType: "string"
        },
        uppercase_name: {
            name: "Uppercase Name",
            dataType: "string",
            disabled: true,
            description: "This field gets updated with a preSave callback"
        }
    },
    callbacks: productCallbacks
});
```

#### EntityOnSaveProps

* `collection`: Collezione risolta dell'entità

* `path`: string Percorso completo dove questa entità viene salvata (può contenere alias non risolti)

* `resolvedPath`: string Percorso completo con alias risolto

* `entityId`: string ID dell'entità

* `values`: EntityValues Valori che vengono salvati

* `previousValues`: EntityValues Valori precedenti dell'entità

* `status`: EntityStatus Entità nuova o esistente

* `context`: FireCMSContext Contesto dello stato dell'app

#### EntityOnDeleteProps

* `collection`: Collezione risolta dell'entità

* `path`: string Percorso completo dove questa entità viene salvata

* `entityId`: string ID dell'entità

* `entity`: Entity Entità eliminata

* `context`: FireCMSContext Contesto dello stato dell'app

#### EntityIdUpdateProps

* `collection`: EntityCollection Collezione risolta dell'entità

* `path`: string Percorso completo dove questa entità viene salvata

* `entityId`: string ID dell'entità

* `values`: Valori entità

* `context`: FireCMSContext Contesto dello stato dell'app
