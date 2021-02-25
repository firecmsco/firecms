---
id: side_entity_controller
title: Side Entity Controller
sidebar_label: Side Entity Controller
---

`useSideEntityController`
You can use this controller to open the side entity view used to edit entities.

The props provided by this context are:

* `close()` Close the last panel
* `sidePanels` List of side entity panels currently open
* `open (props: SideEntityPanelProps & Partial<SchemaSidePanelProps>)`
  Open a new entity sideDialog. By default, the schema and configuration of the
  view is fetched from the collections you have specified in the navigation. At
  least you need to pass the collectionPath of the entity you would like to
  edit. You can set an entityId if you would like to edit and existing one
  (or a new one with that id). If you wish, you can also override
  the `SchemaSidePanelProps` (such as schema or subcollections) and choose to
  override the CMSApp level `SchemaResolver`.

Example:

```tsx
import React from "react";
import { useSideEntityController } from "@camberi/firecms";

export function ExampleCMSView() {

    const sideEntityController = useSideEntityController();

    // You don't need to provide a schema if the collection path is mapped in
    // the main navigation or you have set a `schemaResolver`
    const customProductSchema = buildSchema({
        name: "Product",
        properties: {
            name: {
                title: "Name",
                validation: { required: true },
                dataType: "string"
            },
        }
    });

    return (
        <Button
            onClick={() => sideEntityController.open({
                entityId: "B003WT1622",
                collectionPath: "/products",
                schema: customProductSchema
            })}
            color="primary">
            Open entity with custom schema
        </Button>
    );
}
```
