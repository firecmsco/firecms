---
slug: de/docs/collections/callbacks
title: Entity-Callbacks
sidebar_label: Entity-Callbacks
---

Beim Arbeiten mit einer Entity können Sie verschiedene Callbacks vor und nach dem
Speichern oder Abrufen anhängen:
`onFetch`, `onIdUpdate`, `onPreSave`, `onSaveSuccess` und `onSaveFailure`.

Diese Callbacks werden auf der Kollektionsebene unter der Prop `callbacks` definiert.

Der `onIdUpdate`-Callback kann verwendet werden, um die ID der Entity vor dem
Speichern zu aktualisieren. Dies ist nützlich, wenn Sie die ID aus anderen Feldern generieren müssen.

Die meisten Callbacks sind asynchron.

:::note
Sie können die Ausführung dieser Callbacks stoppen, indem Sie einen `Error`
mit einem `string` auslösen — dann wird ein Fehler-Snackbar angezeigt.
:::

:::tip
Sie können das `context`-Objekt verwenden, um auf den FireCMS-Kontext zuzugreifen.
Das `context`-Objekt enthält alle Controller und Dienste, die in der App verfügbar sind,
einschließlich `authController`, `dataSource`, `storageSource`, `sideDialogsController`, etc.
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
        // Die aktualisierten Werte zurückgeben
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
            throw Error("Not logged in users cannot delete products");
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
        // Die gewünschte ID zurückgeben
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
            description: "Dieses Feld wird mit einem preSave-Callback aktualisiert"
        }
    },
    callbacks: productCallbacks
});
```

#### EntityOnSaveProps

* `collection`: Aufgelöste Kollektion der Entity

* `path`: String Vollständiger Pfad, unter dem diese Entity gespeichert wird (kann unaufgelöste Aliase enthalten)

* `resolvedPath`: String Vollständiger Pfad mit aufgelöstem Alias

* `entityId`: String ID der Entity

* `values`: EntityValues Zu speichernde Werte

* `previousValues`: EntityValues Vorherige Werte der Entity

* `status`: EntityStatus Neue oder vorhandene Entity

* `context`: FireCMSContext Kontext des App-Status

#### EntityOnDeleteProps

* `collection`: Aufgelöste Kollektion der Entity

* `path`: String Vollständiger Pfad, unter dem diese Entity gespeichert wird

* `entityId`: String ID der Entity

* `entity`: Entity Gelöschte Entity

* `context`: FireCMSContext Kontext des App-Status

#### EntityIdUpdateProps

* `collection`: EntityCollection Aufgelöste Kollektion der Entity

* `path`: String Vollständiger Pfad, unter dem diese Entity gespeichert wird

* `entityId`: String ID der Entity

* `values`: Entity-Werte

* `context`: FireCMSContext Kontext des App-Status
