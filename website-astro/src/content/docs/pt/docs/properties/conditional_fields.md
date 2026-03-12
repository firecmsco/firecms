---
slug: pt/docs/properties/conditional_fields
title: Campi condizionali dalle proprietà
sidebar_label: Campi condizionali
description: In FireCMS, i campi condizionali consentono configurazioni di proprietà dinamiche all'interno degli schemi delle collezioni.
---

Quando si definiscono le proprietà di una collezione, puoi scegliere di usare un builder [`PropertyBuilder`](../api/type-aliases/PermissionsBuilder), invece di assegnare direttamente la configurazione della proprietà.

Questo è utile per cambiare le configurazioni delle proprietà come i valori disponibili al volo, in base ad altri valori.

:::tip
Puoi usare i property builder a qualsiasi livello del tuo albero di proprietà (inclusi i figli di mappe e array).

Puoi accedere ai valori completi dell'entità in fase di modifica nel builder tramite la prop `values`, ma anche al valore della proprietà che si sta costruendo con `propertyValue`.
:::

### Esempio 1

Esempio di campo che viene abilitato o disabilitato in base ad altri valori:

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

### Esempio 2

Un tipo `User` che ha un campo `source` che può essere di tipo `facebook` o `apple`, e i suoi campi cambiano di conseguenza:

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
