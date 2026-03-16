---
slug: pt/docs/collections/callbacks
title: Callbacks de entidade
sidebar_label: Callbacks de entidade
---

Ao trabalhar com uma entidade, você pode anexar diversos callbacks antes e depois de ela ser salva ou recuperada:
`onFetch`, `onIdUpdate`, `onPreSave`, `onSaveSuccess` e `onSaveFailure`.

Esses callbacks são definidos no nível da coleção sob a prop `callbacks`.

O callback `onIdUpdate` pode ser usado para atualizar o ID da entidade antes de salvá-la. Isso é útil se você precisa gerar o ID a partir de outros campos.

Isso é útil se você precisa adicionar lógica ou modificar alguns campos da entidade antes/depois de salvar ou excluir entidades.

A maioria dos callbacks é assíncrona.

:::note
Você pode interromper a execução desses callbacks lançando um `Error` contendo uma `string` e um snackbar de erro será exibido.
:::

:::tip
Você pode usar o objeto `context` para acessar o contexto do FireCMS.
O objeto `context` contém todos os controllers e serviços disponíveis na aplicação,
incluindo `authController`, `dataSource`, `storageSource`, `sideDialogsController`, etc.
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
        // retorna os valores atualizados
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
            throw Error("Usuários não conectados não podem excluir produtos");
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
        // retorna o ID desejado
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

* `collection`: Coleção resolvida da entidade

* `path`: string Caminho completo onde esta entidade está sendo salva (pode conter aliases não resolvidos)

* `resolvedPath`: string Caminho completo com alias resolvido

* `entityId`: string ID da entidade

* `values`: EntityValues Valores que estão sendo salvos

* `previousValues`: EntityValues Valores anteriores da entidade

* `status`: EntityStatus Entidade nova ou existente

* `context`: FireCMSContext Contexto do estado da aplicação

#### EntityOnDeleteProps

* `collection`: Coleção resolvida da entidade

* `path`: string Caminho completo onde esta entidade está sendo salva

* `entityId`: string ID da entidade

* `entity`: Entity Entidade excluída

* `context`: FireCMSContext Contexto do estado da aplicação

#### EntityIdUpdateProps

* `collection`: EntityCollection Coleção resolvida da entidade

* `path`: string Caminho completo onde esta entidade está sendo salva

* `entityId`: string ID da entidade

* `values`: Valores da entidade

* `context`: FireCMSContext Contexto do estado da aplicação
