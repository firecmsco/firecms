---
slug: docs/collections/entity_actions
title: Entity actions
sidebar_label: Entity actions
---

Entities can be edited, deleted and duplicated by default.

The default actions are enabled or disabled based on the permissions
of the user in the collection.

If you need to add custom actions, you can do so by defining them in the
`entityActions` prop of the collection.

You can also define entity actions globally, and they will be available in all collections.
This is useful for actions that are not specific to a single collection, like a "Share" action.
When defining a global entity action, you must provide a unique `key` property.

The actions will be shown in the menu of the collection view by default
and in the form view if `includeInForm` is set to true.

You can access all the controllers of FireCMS in the `context`. That is useful for accessing the data source,
modifying data, accessing storage, opening dialogs, etc.

In the `icon` prop, you can pass a React element to show an icon next to the action name.
We recommend using any of the [FireCMS icons](/docs/icons), which are available in the `@firecms/ui` package.

### Defining actions at the collection level

```tsx
import { buildCollection } from "@firecms/core";
import { ArchiveIcon } from "@firecms/ui";

export const productsCollection = buildCollection<Product>({
    id: "products",
    path: "products",
    name: "Products",
    singularName: "Product",
    icon: "shopping_cart",
    description: "List of the products currently sold in our shop",
    entityActions: [
        {
            icon: <ArchiveIcon/>,
            name: "Archive",
            onClick({
                        entity,
                        collection,
                        context,
                    }): Promise<void> {

                // note that you can access all the controllers in the context
                const dataSource = context.dataSource;

                // Add your code here
                return Promise.resolve(undefined);
            }
        }
    ],
    properties: {}
});
````

### Defining actions globally

You can define entity actions globally by passing them to the `FireCMS` component if you are self-hosting,
or in the `FireCMSAppConfig` if you are using FireCMS Cloud.

```tsx
import { ShareIcon } from "@firecms/ui";

// Self-hosted
<FireCMS
    entityActions={[{
        key: "share",
        name: "Share",
        icon: <ShareIcon/>,
        onClick: ({ entity, context }) => {
            // Your share logic here
        }
    }]}
    {...otherProps}
/>
```

```tsx
import { ShareIcon } from "@firecms/ui";

// FireCMS Cloud
const appConfig: FireCMSAppConfig = {
    entityActions: [{
        key: "share",
        name: "Share",
        icon: <ShareIcon/>,
        onClick: ({ entity, context }) => {
            // Your share logic here
        }
    }],
    // ...other config
};
```

#### EntityAction

* `name`: Name of the action
* `key`?: Key of the action. You only need to provide this if you want to
  override the default actions, or if you are defining the action globally.
  The default actions are:
  * `edit`
  * `delete`
  * `copy`
* `icon`?: React.ReactElement Icon of the action
* `onClick`: (props: EntityActionClickProps) =\> Promise
  Function to be called when the action is clicked
* `collapsed`?: boolean Show this action collapsed in the menu of the collection view. Defaults to true. If false, the
  action will be shown in the menu
* `includeInForm`?: boolean Show this action in the form, defaults to true
* `disabled`?: boolean Disable this action, defaults to false

#### EntityActionClickProps

* `entity`: Entity being edited
* `context`: FireCMSContext, used for accessing all the controllers
* `fullPath`?: string
* `fullIdPath`?: string
* `collection`?: EntityCollection
* `formContext`?: FormContext, present if the action is being called from a form.
* `selectionController`?: SelectionController, used for accessing the selected entities or modifying the selection
* `highlightEntity`?: (entity: Entity) => void
* `unhighlightEntity`?: (entity: Entity) => void
* `onCollectionChange`?: () => void
* `sideEntityController`?: SideEntityController
* `view`: "collection" | "form"
* `openEntityMode`: "side_panel" | "full_screen"
* `navigateBack`?: () => void

## Examples

Let's build an example where we add an action to archive a product.
When the action is clicked, we will call a Google Cloud Function that will run some business logic in the backend.

### Using the `fetch` API

You can use the standard `fetch` API to call any HTTP endpoint, including a Google Cloud Function. This is a general-purpose method that works with any backend.

```tsx
import { buildCollection, Product } from "@firecms/core";
import { ArchiveIcon } from "@firecms/ui";

export const productsCollection = buildCollection<Product>({
    id: "products",
    path: "products",
    // other properties
    entityActions: [
        {
            icon: <ArchiveIcon/>,
            name: "Archive",
            collapsed: false,
            onClick({
                        entity,
                        context,
                    }) {
                const snackbarController = context.snackbarController;
                return fetch("[YOUR_ENDPOINT]/archiveProduct", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        productId: entity.id
                    })
                }).then(() => {
                    snackbarController.open({
                        message: "Product archived",
                        type: "success"
                    });
                }).catch((error) => {
                    snackbarController.open({
                        message: "Error archiving product",
                        type: "error"
                    });
                });
            }
        }
    ],
});
```

### Using the Firebase Functions SDK

If you're using Firebase, the recommended approach is to use the Firebase Functions SDK. It simplifies calling functions and automatically handles authentication tokens.

First, ensure you have the `firebase` package installed and initialized in your project.

Then, you can define your action like this:

```tsx
import { getFunctions, httpsCallable } from "firebase/functions";
import { ArchiveIcon } from "@firecms/ui";
import { buildCollection, Product } from "@firecms/core";

// Initialize Firebase Functions
// Make sure you have initialized Firebase elsewhere in your app
const functions = getFunctions();
const archiveProductCallable = httpsCallable(functions, 'archiveProduct');

export const productsCollection = buildCollection<Product>({
    id: "products",
    path: "products",
    // other properties
    entityActions: [
        {
            icon: <ArchiveIcon/>,
            name: "Archive with Firebase",
            collapsed: false,
            async onClick({
                        entity,
                        context,
                    }) {
                const snackbarController = context.snackbarController;
                try {
                    await archiveProductCallable({ productId: entity.id });
                    snackbarController.open({
                        message: "Product archived successfully",
                        type: "success"
                    });
                } catch (error) {
                    console.error("Error archiving product:", error);
                    snackbarController.open({
                        message: "Error archiving product: " + error.message,
                        type: "error"
                    });
                }
            }
        }
    ],
});
```
