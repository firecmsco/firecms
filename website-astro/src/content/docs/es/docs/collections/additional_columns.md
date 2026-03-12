---
slug: es/docs/collections/additional_columns
title: Columnas/campos adicionales (Additional columns/fields)
sidebar_label: Columnas adicionales
---


Si deseas incluir una columna que no se asigne directamente a una propiedad,
puedes usar el campo `additionalFields`, proporcionando un
`AdditionalFieldDelegate`, que incluye un ID, un título y un generador (builder) que
recibe la entidad correspondiente.

En el generador puedes devolver cualquier componente React.

:::note
Si tu campo adicional depende del valor de otra propiedad de la entidad
puedes definir la propiedad `dependencies` como una matriz de claves de propiedades para que
los datos siempre estén actualizados.
Esto provocará una repetición de la renderización cada vez que haya un cambio en alguno de los
valores de propiedad especificados.
:::

#### Ejemplo

```tsx
import {
    buildCollection,
    buildCollection,
    AdditionalFieldDelegate
} from "@firecms/core";

type User = { name: string }

export const fullNameAdditionalField: AdditionalFieldDelegate<User> = {
    key: "full_name",
    name: "Nombre completo",
    Builder: ({ entity }) => {
        let values = entity.values;
        return typeof values.name === "string" ? values.name.toUpperCase() : "Nombre no proporcionado";
    },
    dependencies: ["name"]
};

const usersCollection = buildCollection<User>({
    path: "users",
    name: "Usuario",
    properties: {
        name: { dataType: "string", name: "Nombre" }
    },
    additionalFields: [
        fullNameAdditionalField
    ]
});
```

#### Ejemplo avanzado

```tsx
import {
    buildCollection,
    AdditionalFieldDelegate,
    AsyncPreviewComponent
} from "@firecms/core";

export const productAdditionalField: AdditionalFieldDelegate<Product> = {
    key: "spanish_title",
    name: "Título en español",
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
`AsyncPreviewComponent` es un componente de utilidad proporcionado por FireCMS que
te permite renderizar el resultado de un cálculo asíncrono (como obtener datos
de una subcolección, como en este caso). Mientras tanto, mostrará un indicador de carga
esquelético (skeleton).
:::
