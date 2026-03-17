---
title: Colonne/campi aggiuntivi
sidebar_label: Colonne/campi aggiuntivi
---


Se vuoi includere una colonna che non mappa direttamente a una proprietà, puoi usare il campo `additionalFields`, fornendo un `AdditionalFieldDelegate`, che include un id, un titolo e un builder che riceve l'entità corrispondente.

Nel builder puoi restituire qualsiasi componente React.

:::note
Se il tuo campo aggiuntivo dipende dal valore di un'altra proprietà dell'entità, puoi definire la prop `dependencies` come array di chiavi di proprietà in modo che i dati vengano sempre aggiornati.
Questo triggererà un re-render ogni volta che c'è un cambiamento in uno qualsiasi dei valori di proprietà specificati.
:::

#### Esempio

```tsx
import {
    buildCollection,
    buildCollection,
    AdditionalFieldDelegate
} from "@firecms/core";

type User = { name: string }

export const fullNameAdditionalField: AdditionalFieldDelegate<User> = {
    key: "full_name",
    name: "Full Name",
    Builder: ({ entity }) => {
        let values = entity.values;
        return typeof values.name === "string" ? values.name.toUpperCase() : "No name provided";
    },
    dependencies: ["name"]
};

const usersCollection = buildCollection<User>({
    path: "users",
    name: "User",
    properties: {
        name: { dataType: "string", name: "Name" }
    },
    additionalFields: [
        fullNameAdditionalField
    ]
});
```

#### Esempio avanzato

```tsx
import {
    buildCollection,
    AdditionalFieldDelegate,
    AsyncPreviewComponent
} from "@firecms/core";

export const productAdditionalField: AdditionalFieldDelegate<Product> = {
    key: "spanish_title",
    name: "Spanish title",
    Builder: ({ entity, context }) =>
        <AsyncPreviewComponent builder={
            context.dataSource.fetchEntity({
                path: entity.path,
                entityId: entity.id,
                collection: localeSchema
            }).then((entity) => entity.values.name)
        }/>
};
```

:::tip
`AsyncPreviewComponent` è un componente di utilità fornito da FireCMS che
ti permette di renderizzare il risultato di un calcolo asincrono (come il recupero di dati
da una sotto-collezione, come in questo caso). Nel frattempo mostrerà un indicatore di caricamento skeleton.
:::
