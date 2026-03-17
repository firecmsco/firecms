---
title: Acciones de la barra de colecciones (Collection Bar Actions)
sidebar_label: Acciones de la barra de colecciones
---


![collection_actions](/img/collection_actions.png)

Puedes agregar tus componentes personalizados a la barra de colecciones.

Esto es útil para agregar acciones que son específicas de la colección con la que estás trabajando.

Por ejemplo, podrías agregar un botón para exportar los **datos seleccionados**, o un botón para activar una **acción específica en tu backend**.

También puedes recuperar los **filtros seleccionados** y modificarlos.

### Ejemplo de cómo recuperar entidades seleccionadas

Necesitas definir un componente que reciba `CollectionActionsProps` como accesorios (props).

```tsx
import React from "react";
import { CollectionActionsProps, useSnackbarController } from "@firecms/core";
import { Button } from "@firecms/ui";

export function SampleCollectionActions({ selectionController }: CollectionActionsProps) {

    const snackbarController = useSnackbarController();

    const onClick = (event: React.MouseEvent) => {
        const selectedEntities = selectionController?.selectedEntities;
        const count = selectedEntities ? selectedEntities.length : 0;
        snackbarController.open({
            type: "success",
            message: `¡Código definido por el usuario aquí! ${count} productos seleccionados`
        });
    };

    return (
        <Button onClick={onClick}
                color="primary"
                variant={"text"}>
            Mi acción personalizada
        </Button>
    );

}
```

luego solo agrégalo a la configuración de tu colección:

```tsx
import { buildCollection, EntitySchema } from "@firecms/core";
import { SampleCollectionActions } from "./SampleCollectionActions";

export const productCollection: EntitySchema = buildCollection({
    name: "Productos",
    Actions: SampleCollectionActions,
    // ...
});
```


### Ejemplo de modificación de filtros

Este es un ejemplo de cómo puedes modificar los filtros en la barra de colecciones:

```tsx
import React from "react";
import { CollectionActionsProps } from "@firecms/core";
import { CloseIcon, IconButton, Select, SelectItem } from "@firecms/ui";

export function CustomFiltersActions({
                                         tableController
                                     }: CollectionActionsProps) {

    const filterValues = tableController.filterValues;
    const categoryFilter = filterValues?.category;
    const categoryFilterValue = categoryFilter?.[1];

    const updateFilter = (value: string | null) => {
        const newFilter = {
            ...filterValues
        };
        if (value) {
            newFilter.category = ["==", value];
        } else {
            delete newFilter.category;
        }
        tableController.setFilterValues?.(newFilter);
    };

    return (
        <Select placeholder={"Filtro de categoría"}
                className={"w-44"}
                endAdornment={categoryFilterValue ?
                    <IconButton size={"small"} onClick={() => updateFilter(null)}>
                        <CloseIcon size={"smallest"}/>
                    </IconButton> : undefined}
                onValueChange={updateFilter}
                size={"small"}
                value={categoryFilterValue}>
            <SelectItem value="cameras">Cámaras</SelectItem>
            <SelectItem value="bath">Baño</SelectItem>
        </Select>
    );

}

```

luego solo agrégalo a la configuración de tu colección:

```tsx
import { buildCollection, EntitySchema } from "@firecms/core";
import { CustomFiltersActions } from "./SampleCollectionActions";

export const productCollection: EntitySchema = buildCollection({
    name: "Productos",
    Actions: CustomFiltersActions,
    // ...
});
```


## CollectionActionsProps

Las siguientes propiedades están disponibles en la interfaz `CollectionActionsProps`:

- **`path`**: Ruta completa de la colección de esta entidad. Esta es la ruta completa, como `users/1234/addresses`.

- **`relativePath`**: Ruta de la última colección, como `addresses`.

- **`parentCollectionIds`**: Matriz (array) de los segmentos de ruta principales, como `['users']`.

- **`collection`**: La configuración de la colección.

- **`selectionController`**: Utilice este controlador para obtener las entidades seleccionadas y para actualizar el estado de las entidades seleccionadas.

- **`tableController`**: Utilice este controlador para obtener el controlador de la tabla y para actualizar el estado del controlador de la tabla.

- **`context`**: Contexto del estado de la aplicación.

- **`collectionEntitiesCount`**: Recuento de las entidades en esta colección.
