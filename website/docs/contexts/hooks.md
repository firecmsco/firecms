---
id: hooks
title: Provided hooks
sidebar_label: Provided hooks
---

FireCMS provides different hooks that allow you to interact with the internal
state of the app. Please note that in order to use this hook you **must** be in
a component (you can't use them directly from a callback function).


## `useAuthContext`
For state and operations regarding authentication.

The props provided by this context are:

* `loggedUser` The Firebase user currently logged in or null
* `authProviderError` Error dispatched by the auth provider
* `authLoading` Is the login process ongoing
* `loginSkipped` Is the login skipped
* `notAllowedError` The current user was not allowed access
* `skipLogin()` Skip login
* `signOut()` Sign out

Example:

```tsx
import React from "react";
import { useAuthContext } from "@camberi/firecms";

export function ExampleCMSView() {

    const authController = useAuthContext();

    return (
        authController.loggedUser ?
            <div>Logged in as {authController.loggedUser.displayName}</div>
            :
            <div>You are not logged in</div>
    );
}
```


## `useSideEntityController`
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

## `useSnackbarController`
For displaying snackbars

The props provided by this context are:

* `isOpen` Is there currently an open snackbar
* `close()` Close the currently open snackbar
* `open ({ type: "success" | "info" | "warning" | "error"; title?: string; message: string; })`
  Display a new snackbar. You need to specify the type and message. You can
  optionally specify a title

Example:

```tsx

import React from "react";
import { useSnackbarController } from "@camberi/firecms";

export function ExampleCMSView() {

    const snackbarController = useSnackbarController();

    return (
        <Button
            onClick={() => snackbarController.open({
                type: "success",
                title: "Hey!",
                message: "Test snackbar"
            })}>
            Click me
        </Button>
    );
}
```
