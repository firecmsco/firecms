---
id: use_side_entity_controller
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

:::tip
If you want to override the entity schema of some entity or path, at the app
level, you can pass a `SchemaResolver` to your `FireCMS` instance to set
an override.
:::

The props provided by this context are:

* `close()` Close the last panel
* `sidePanels` List of side entity panels currently open
* `open (props: SideEntityPanelProps & Partial<SchemaSidePanelProps>)`
  Open a new entity sideDialog. By default, the schema and configuration of the
  view is fetched from the collections you have specified in the navigation. At
  least you need to pass the path of the entity you would like to
  edit. You can set an entityId if you would like to edit and existing one
  (or a new one with that id). If you wish, you can also override
  the `SchemaSidePanelProps` (such as schema or subcollections) and choose to
  override the `FireCMS` level `SchemaResolver`.

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
                path: "/products",
                schema: customProductSchema
            })}
            color="primary">
            Open entity with custom schema
        </Button>
    );
}
```


### Schema resolver

You may want to override the schema definition for particular entities in. In
that case you can define a schema resolver in the FireCMS level.

In order to do that, you can specify a `SchemaResolver` that is in charge of
resolving the `path` and `entityId` and returning a `SchemaConfig`, where you
can specify a custom `schema` (including callbacks and custom views),
`permissions` and `subcollections`

```tsx
import { buildSchema, SchemaResolver } from "@camberi/firecms";

const customSchemaResolver: SchemaResolver = ({
                                                  entityId,
                                                  path
                                              }: {
    entityId?: string;
    path: string;
}) => {

    if (entityId === "B0017TNJWY" && path === "products") {
        const customProductSchema = buildSchema({
            name: "Custom product",
            properties: {
                name: {
                    title: "Name",
                    description: "This entity is using a schema overridden by a schema resolver",
                    validation: { required: true },
                    dataType: "string"
                }
            }
        });

        return {
            schema: customProductSchema,
            // permissions: ...,
            // subcollections: ...,
        };
    }
};
```

Then you can pass `schemaResolver` to your `FirebaseCMSApp` or `FireCMS`
