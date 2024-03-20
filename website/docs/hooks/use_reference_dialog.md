---
id: use_reference_dialog
title: useReferenceDialog
sidebar_label: useReferenceDialog
---

:::note Please note that in order to use this hook you **must** be in a
component (you can't use them directly from a callback function).
:::

## `useReferenceDialog`

This hook is used to open a side dialog that allows the selection of entities
under a given path. You can use it in custom views for selecting entities. You
need to specify the path of the target collection at least. If your collection
is not defined in your top collection configuration
(in your `FireCMS` component), you need to specify explicitly. This is the same
hook used internally when a reference property is defined.

The props provided by this hook are:

*     multiselect?: boolean;
  Allow multiple selection of values

*     collection?: EntityCollection;
  Entity collection config

*     path: string;
  Absolute path of the collection.
  May be not set if this hook is being used in a component and the path is
  dynamic. If not set, the dialog won't open.

*     selectedEntityIds?: string[];
  If you are opening the dialog for the first time, you can select some
  entity ids to be displayed first.

*     onSingleEntitySelected?(entity: Entity | null): void;
  If `multiselect` is set to `false`, you will get the selected entity
  in this callback.

*     onMultipleEntitiesSelected?(entities: Entity[]): void;
  If `multiselect` is set to `false`, you will get the selected entities
  in this callback.

*     onClose?(): void;
  If the dialog currently open, close it

*     forceFilter?: FilterValues;
  Allow selection of entities that pass the given filter only.

Example:

```tsx
import React from "react";
import { useAuthController } from "@firecms/cloud";

export function ExampleCMSView() {

    // hook to display custom snackbars
    const snackbarController = useSnackbarController();

    // hook to open a reference dialog
    const referenceDialog = useReferenceDialog({
        path: "products",
        onSingleEntitySelected(entity: Entity<Product> | null) {
            snackbarController.open({
                type: "success",
                message: "Selected " + entity?.values.name
            })
        }
    });

    return <Button
        onClick={referenceDialog.open}
        color="primary">
        Test reference dialog
    </Button>;
}
```

