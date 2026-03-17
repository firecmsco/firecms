---
title: Zusätzliche Spalten/Felder
sidebar_label: Zusätzliche Spalten/Felder
---


Wenn Sie eine Spalte einbeziehen möchten, die nicht direkt auf eine Eigenschaft abgebildet wird,
können Sie das `additionalFields`-Feld verwenden und einen
`AdditionalFieldDelegate` bereitstellen, der eine ID, einen Titel und einen Builder enthält, der
die entsprechende Entity empfängt.

Im Builder können Sie beliebige React-Komponenten zurückgeben.

:::note
Wenn Ihr zusätzliches Feld vom Wert einer anderen Eigenschaft der Entity abhängt,
können Sie die `dependencies`-Prop als ein Array von Eigenschaftsschlüsseln definieren, damit
die Daten immer aktuell sind.
Dies löst ein Neu-Rendern aus, wenn sich der Wert einer der angegebenen Eigenschaften ändert.
:::

#### Beispiel

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

#### Erweitertes Beispiel

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
`AsyncPreviewComponent` ist eine Hilfskomponente von FireCMS, die
es Ihnen ermöglicht, das Ergebnis einer asynchronen Berechnung zu rendern (z.B. das Abrufen von Daten
aus einer Unterkollektion, wie in diesem Fall). In der Zwischenzeit wird eine Skeleton-Ladeanzeige angezeigt.
:::
