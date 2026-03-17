---
title: Campos condicionais a partir de propriedades
sidebar_label: Campos condicionais
description: No FireCMS, os campos condicionais permitem configurações dinâmicas de propriedades dentro dos esquemas de coleção.
---

Ao definir as propriedades de uma coleção, você pode optar por usar um builder [`PropertyBuilder`](../api/type-aliases/PermissionsBuilder), em vez de atribuir diretamente a configuração da propriedade.

Isso é útil para alterar configurações de propriedades, como os valores disponíveis dinamicamente, com base em outros valores.

:::tip
Você pode usar property builders em qualquer nível da sua árvore de propriedades (incluindo filhos de mapas e arrays).

Pode acessar os valores completos da entidade em edição no builder através da prop `values`, e também o valor da propriedade sendo construída com `propertyValue`.
:::

### Exemplo 1

Exemplo de campo que é habilitado ou desabilitado com base em outros valores:

```tsx
import {
    buildCollection,
    EntityCollection,
    EntityReference
} from "@firecms/core";

type Product = {
    name: string;
    main_image: string;
    available: boolean;
    price: number;
    related_products: EntityReference[];
    publisher: {
        name: string;
        external_id: string;
    }
}

export const productCollection: EntityCollection = buildCollection<Partial<Product>>({
    name: "Product",
    properties: {
        available: {
            dataType: "boolean",
            name: "Available"
        },
        price: ({ values }) => ({
            dataType: "number",
            name: "Price",
            validation: {
                requiredMessage: "You must set a price between 0 and 1000",
                min: 0,
                max: 1000
            },
            disabled: !values.available && {
                clearOnDisabled: true,
                disabledMessage: "You can only set the price on available items"
            },
            description: "Price with range validation"
        })
    }
});
```

### Exemplo 2

Um tipo `User` que tem um campo `source` que pode ser do tipo `facebook` ou `apple`, e seus campos mudam de acordo:

```tsx
import {
    buildCollection,
    EntityCollection,
    buildProperty,
    buildProperties
} from "@firecms/core";

type User = {
    source: {
        type: "facebook",
        facebookId: string
    } | {
        type: "apple",
        appleId: number
    }
}

export const userSchema: EntityCollection = buildCollection<User>({
    name: "User",
    properties: {
        source: ({ values }) => {
            const properties = buildProperties<any>({
                type: {
                    dataType: "string",
                    enumValues: {
                        "facebook": "FacebookId",
                        "apple": "Apple"
                    }
                }
            });

            if (values.source) {
                if ((values.source as any).type === "facebook") {
                    properties["facebookId"] = buildProperty({
                        dataType: "string"
                    });
                } else if ((values.source as any).type === "apple") {
                    properties["appleId"] = buildProperty({
                        dataType: "number"
                    });
                }
            }

            return ({
                dataType: "map",
                name: "Source",
                properties: properties
            });
        }
    }
});
```
