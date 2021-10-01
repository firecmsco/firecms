---
id: custom_top_level_views
title: Custom top level views
sidebar_label: Custom top level views
---

If you need to develop a custom view that does not map directly to a Firestore
collection you can implement it as a React component.

You need to define the name, route and the component, and add it to the main
navigation, as the example below.

By default, it will show in the main navigation view.

For custom views you can define the following props:
* `path` string | string[]

  CMS Path (or paths) you can reach this view from.
  If you include multiple paths, only the first one will be included in the
  main menu

* `name`: string

  Name of this view

* `description`?: string

  Optional description of this view. You can use Markdown

* `hideFromNavigation`?: boolean

  Should this view be hidden from the main navigation panel.
  It will still be accessible if you reach the specified path

* `view`: React.ReactNode

  Component to be rendered. This can be any React component, and can use any
  of the provided hooks

* `group`?: string

  Optional field used to group top level navigation entries under a
  navigation view.


### Example:
A quick example for a custom view:

```tsx
import {
    buildSchema,
    CMSView,
    NavigationBuilder,
    NavigationBuilderProps,
    buildCollection,
    FirebaseCMSApp
} from "@camberi/firecms"

export default function App() {

    const productSchema = buildSchema({
        name: "Product",
        properties: {
            name: {
                title: "Name",
                validation: { required: true },
                dataType: "string"
            }
        }
    });

    const customViews: CMSView[] = [{
        path: ["additional", "additional/:id"],
        name: "Additional view",
        description: "This is an example of an additional view that is defined by the user",
        // This can be any React component
        view: <ExampleCMSView/>
    }];

    const navigation: NavigationBuilder = ({ user }: NavigationBuilderProps) => ({
        collections: [
            buildCollection({
                path: "products",
                schema: productSchema,
                name: "Products"
            })
        ],
        views: customViews
    });

    return <FirebaseCMSApp
        name={"My Online Shop"}
        navigation={navigation}
        firebaseConfig={firebaseConfig}
    />;
}
```

Your custom view is implemented as any regular React component that uses
some hooks provided by the CMS:

```tsx
import React from "react";
import { Box, Button } from "@mui/material";

import {
    buildSchema,
    useAuthController,
    useSideEntityController,
    useSnackbarController
} from "@camberi/firecms";

/**
 * Sample CMS view not bound to a collection, customizable by the developer
 * @constructor
 */
export function ExampleCMSView() {

    // hook to display custom snackbars
    const snackbarController = useSnackbarController();

    // hook to open the side dialog that shows the entity forms
    const sideEntityController = useSideEntityController();

    // hook to do operations related to authentication
    const authController = useAuthContext();

    const customProductSchema = buildSchema({
        name: "Custom product",
        properties: {
            name: {
                title: "Name",
                validation: { required: true },
                dataType: "string"
            },
            very_custom_field: {
                title: "Very custom field",
                dataType: "string"
            }
        }
    });

    return (
        <Box
            display="flex"
            width={"100%"}
            height={"100%"}>

            <Box m="auto"
                 display="flex"
                 flexDirection={"column"}
                 alignItems={"center"}
                 justifyItems={"center"}>

                <div>This is an example of an additional view</div>

                {authController.user ?
                    <div>Logged in
                        as {authController.user.displayName}</div>
                    :
                    <div>You are not logged in</div>}

                <Button
                    onClick={() => snackbarController.open({
                        type: "success",
                        message: "This is pretty cool"
                    })}
                    color="primary">
                    Test snackbar
                </Button>

                <Button
                    onClick={() => sideEntityController.open({
                        entityId: "B003WT1622",
                        path: "/products-test",
                        schema: customProductSchema
                    })}
                    color="primary">
                    Open entity with custom schema
                </Button>

            </Box>
        </Box>
    );
}
```

