---
slug: es/docs/collections/callbacks
title: Devoluciones de llamada de entidades (Entity callbacks)
sidebar_label: Devoluciones de llamada (Callbacks)
---

Al trabajar con una entidad, puedes adjuntar diferentes devoluciones de llamada (callbacks) antes y
después de que se guarde o se recupere:
`onFetch`, `onIdUpdate`, `onPreSave`, `onSaveSuccess` y `onSaveFailure`.

Estas devoluciones de llamada se definen a nivel de colección bajo la propiedad `callbacks`.

La devolución de llamada `onIdUpdate` se puede utilizar para actualizar el ID de la entidad antes
de guardarla. Esto es útil si necesitas generar el ID a partir de otros campos.

Esto es útil si necesitas agregar alguna lógica o editar algunos campos o la entidad
DURANTE el filtrado (IF) antes/después de guardar o eliminar entidades.

La mayoría de las devoluciones de llamada son asíncronas.

:::note
Puedes detener la ejecución de estas devoluciones de llamada lanzando un `Error`
que contiene una `string` y se mostrará un mensaje de error (snackbar).
:::

:::tip
Puedes utilizar el objeto `context` para acceder al contexto de FireCMS.
El objeto `context` contiene todos los controladores y servicios disponibles en la aplicación,
incluyendo `authController`, `dataSource`, `storageSource`, `sideDialogsController`, etc.
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
        // devuelve los valores actualizados
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
            throw Error("Los usuarios que no han iniciado sesión no pueden eliminar productos");
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
        entity.values.name = "Nombre forzado";
        return entity;
    },

    onIdUpdate({
                   collection,
                   context,
                   entityId,
                   path,
                   values
               }: EntityIdUpdateProps): string {
        // devuelve el ID deseado
        return toSnakeCase(values?.name)
    },
});

const productCollection = buildCollection<Product>({
    name: "Producto",
    path: "products",
    properties: {
        name: {
            name: "Nombre",
            validation: { required: true },
            dataType: "string"
        },
        uppercase_name: {
            name: "Nombre en mayúsculas",
            dataType: "string",
            disabled: true,
            description: "Este campo se actualiza con un callback preSave"
        }
    },
    callbacks: productCallbacks
});
```

#### EntityOnSaveProps

* `collection`: Colección resuelta de la entidad

* `path`: string Ruta completa donde se está guardando esta entidad (puede contener alias no resueltos)

* `resolvedPath`: string Ruta completa con alias resuelto

* `entityId`: string ID de la entidad

* `values`: EntityValues Valores que se están guardando

* `previousValues`: EntityValues Valores anteriores de la entidad

* `status`: EntityStatus Entidad nueva o existente

* `context`: FireCMSContext Contexto del estado de la aplicación

#### EntityOnDeleteProps

* `collection`:  Colección resuelta de la entidad

* `path`: string Ruta completa donde se está guardando esta entidad

* `entityId`: string ID de la entidad

* `entity`: Entity Entidad eliminada

* `context`: FireCMSContext Contexto del estado de la aplicación

#### EntityIdUpdateProps

* `collection`: EntityCollection Colección resuelta de la entidad

* `path`: string Ruta completa donde se está guardando esta entidad

* `entityId`: string ID de la entidad

* `values`: Valores de la entidad

* `context`: FireCMSContext Contexto del estado de la aplicación
