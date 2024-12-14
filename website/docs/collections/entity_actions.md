---
id: entity_actions
title: Entity actions
sidebar_label: Entity actions
---

Entities can be edited, deleted and duplicated by default.

The default actions are enabled or disabled based on the permissions
of the user in the collection.

If you need to add custom actions, you can do so by defining them in the
`entityActions` prop of the collection.

The actions will be shown in the menu of the collection view by default
and in the form view if `includeInForm` is set to true.

You can access all the controllers of FireCMS in the `context`. That is useful for accessing the data source,
modifying data, accessing storage, opening dialogs, etc.

In the `icon` prop, you can pass a React element to show an icon next to the action name.
We recommend using any of the [FireCMS icons](/docs/icons), which are available in the `@firecms/ui` package.

```tsx

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
```

#### EntityAction

* `name`: Name of the action
* `key`?: Key of the action. You only need to provide this if you want to
  override the default actions.
  The default actions are:
    - edit
    - delete
    - copy
* `icon`?: React.ReactElement Icon of the action
* `onClick`: (props: EntityActionClickProps) => Promise
  Function to be called when the action is clicked
* `collapsed`?: boolean Show this action collapsed in the menu of the collection view. Defaults to true. If false, the
  action will be shown in the menu
* `includeInForm`?: boolean Show this action in the form, defaults to true
* `disabled`?: boolean Disable this action, defaults to false

#### EntityActionClickProps

* `entity`: Entity being edited
* `context`: FireCMSContext, used for accessing all the controllers
* `fullPath`?: string
* `collection`?: EntityCollection
* `selectionController`?: SelectionController, used for accessing the selected entities or modifying the selection
* `highlightEntity`?: (entity: Entity) => void
* `unhighlightEntity`?: (entity: Entity) => void
* `onCollectionChange`?: () => void
* `sideEntityController`?: SideEntityController

## Example

Let's build an example where we add an action to archive a product.
When the action is clicked, we will call a Google Cloud Function to that will run some business logic,
in the backend.

In this example, we will use the `fetch` API to call the function.

```tsx
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
                        collection,
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



