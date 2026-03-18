---
title: Bedingte Felder aus Eigenschaften
slug: de/docs/properties/conditional_fields
sidebar_label: Bedingte Felder
description: In FireCMS ermöglichen bedingte Felder dynamische Eigenschaftskonfigurationen innerhalb Ihrer Kollektionsschemata, die Schnittstellen bieten, die sich in Echtzeit an andere Eigenschaftswerte anpassen.
---

Beim Definieren der Eigenschaften einer Kollektion können Sie einen Builder
[`PropertyBuilder`](../api/type-aliases/PermissionsBuilder) verwenden, anstatt die
Eigenschaftskonfiguration direkt zuzuweisen.

Dies ist nützlich, um Eigenschaftskonfigurationen wie verfügbare Werte dynamisch zu ändern,
basierend auf anderen Werten.

:::tip
Sie können Property-Builder auf jeder Ebene Ihres Eigenschaftsbaums verwenden
(einschließlich Kinder von Maps und Arrays).

Sie können auf die vollständigen Werte der bearbeiteten Entity mit dem `values`-Prop zugreifen,
aber auch auf den Wert der gerade erstellten Eigenschaft mit `propertyValue`.
:::

### Beispiel 1

Beispiel eines Felds, das basierend auf anderen Werten aktiviert oder deaktiviert wird:

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
                requiredMessage: "Sie müssen einen Preis zwischen 0 und 1000 festlegen",
                min: 0,
                max: 1000
            },
            disabled: !values.available && {
                clearOnDisabled: true,
                disabledMessage: "Sie können den Preis nur bei verfügbaren Artikeln festlegen"
            },
            description: "Preis mit Bereichsvalidierung"
        })
    }
});
```

### Beispiel 2

Ein `User`-Typ, der ein `source`-Feld hat, das `facebook` oder `apple` sein kann,
und dessen Felder sich entsprechend ändern:

```tsx
import { buildCollection } from "@firecms/core";

type User = {
    email: string;
    display_name: string;
    source: {
        type: "facebook" | "apple";
        token?: string;
        uid?: string;
    }
}

const userCollection = buildCollection<User>({
    name: "User",
    properties: {
        email: {
            dataType: "string",
            name: "Email"
        },
        display_name: {
            dataType: "string",
            name: "Display name"
        },
        source: ({ values }) => {
            const sourceType = values?.source?.type;

            return {
                dataType: "map",
                name: "Source",
                properties: {
                    type: {
                        dataType: "string",
                        name: "Type",
                        enumValues: {
                            facebook: "Facebook",
                            apple: "Apple"
                        }
                    },
                    token: {
                        dataType: "string",
                        name: "Token",
                        disabled: sourceType !== "facebook" && {
                            clearOnDisabled: true
                        }
                    },
                    uid: {
                        dataType: "string",
                        name: "UID",
                        disabled: sourceType !== "apple" && {
                            clearOnDisabled: true
                        }
                    }
                }
            };
        }
    }
});
```
