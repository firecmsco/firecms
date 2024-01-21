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
* `icon`?: React.ReactElement Icon of the action
* `onClick`: (props: EntityActionClickProps) => Promise 
Function to be called when the action is clicked
* `collapsed`?: boolean Show this action collapsed in the menu of the collection view. Defaults to true. If false, the action will be shown in the menu
* `includeInForm`?: boolean Show this action in the form, defaults to true
* `disabled`?: boolean Disable this action, defaults to false


#### EntityActionClickProps

* `entity`: Entity being edited
* `context`: FireCMSContext
* `fullPath`?: string
* `collection`?: EntityCollection
* `selectionController`?: SelectionController
* `highlightEntity`?: (entity: Entity) => void
* `unhighlightEntity`?: (entity: Entity) => void
* `onCollectionChange`?: () => void
* `sideEntityController`?: SideEntityController

