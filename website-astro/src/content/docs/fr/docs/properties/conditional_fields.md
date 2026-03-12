---
slug: fr/docs/properties/conditional_fields
title: Champs conditionnels depuis les propriétés
sidebar_label: Champs conditionnels
description: Dans FireCMS, les champs conditionnels permettent des configurations de propriétés dynamiques au sein de vos schémas de collection, offrant des interfaces réactives qui s'adaptent à d'autres valeurs de propriétés en temps réel. La fonction `PropertyBuilder` vous permet de construire des propriétés dont les attributs sont déterminés par les valeurs d'autres champs dans l'entité.
---

Lors de la définition des propriétés d'une collection, vous pouvez choisir d'utiliser un constructeur
[`PropertyBuilder`](../api/type-aliases/PermissionsBuilder), au lieu d'assigner la
configuration de propriété directement.

Ceci est utile pour changer les configurations de propriétés comme les valeurs disponibles à la
volée, en fonction d'autres valeurs.

:::tip
Vous pouvez utiliser des constructeurs de propriétés à n'importe quel niveau de votre arborescence de propriétés
(y compris les enfants de maps et de tableaux).

Vous pouvez accéder aux valeurs complètes de l'entité en cours de modification dans le constructeur
avec la prop `values`, mais aussi la valeur de la propriété en cours de construction avec `propertyValue`.
:::

### Exemple 1

Exemple d'un champ qui est activé ou désactivé en fonction d'autres valeurs :

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

### Exemple 2

Un type `User` qui a un champ `source` qui peut être de type `facebook`
ou `apple`, et ses champs changent en conséquence

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
