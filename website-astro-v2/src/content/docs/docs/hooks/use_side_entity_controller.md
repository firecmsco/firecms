---
slug: docs/use_side_entity_controller
title: useSideEntityController
sidebar_label: useSideEntityController
---

:::note
Please note that in order to use these hooks you **must** be in
a component (you can't use them directly from a callback function).
Anyhow, callbacks usually include a `FireCMSContext`, which includes all
the controllers.
:::

You can use this controller to open the side entity view used to edit entities.
This is the same controller the CMS uses when you click on an entity in a collection
view.

Using this controller you can open a form in a side dialog, also if the path and
entity schema are not included in the main navigation defined in `FireCMS`.

The props provided by this hook are:

* `close()` Close the last panel
* `sidePanels` List of side entity panels currently open
* `open (props: SideEntityPanelProps)`
  Open a new entity sideDialog. By default, the schema and configuration of the
  view is fetched from the collections you have specified in the navigation. At
  least you need to pass the path of the entity you would like to
  edit. You can set an entityId if you would like to edit and existing one
  (or a new one with that id).

Example:

```tsx
import React from "react";
import { useSideEntityController } from "@firecms/core";
import { Button } from "@firecms/ui";

export function ExampleCMSView() {

    const sideEntityController = useSideEntityController();

    // You don't need to provide a schema if the collection path is mapped in
    // the main navigation
    const customProductCollection = buildCollection({
        name: "Product",
        properties: {
            name: {
                name: "Name",
                validation: { required: true },
                dataType: "string"
            },
        }
    });

    return (
        <Button
            onClick={() => sideEntityController.open({
                entityId: "B003WT1622",
                path: "/products",
                collection: customProductCollection // optional
            })}
            color="primary">
            Open entity with custom schema
        </Button>
    );
}
```

