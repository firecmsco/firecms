---
title: Entity Actions
sidebar_label: Entity Actions
slug: docs/frontend/entity-actions
description: Add custom action buttons to entities for archiving, publishing, exporting, cloning, and more.
---

## Overview

Entity actions are custom buttons that appear on individual entities. Use them for operations like publishing, archiving, cloning, or triggering external workflows.

## Defining Entity Actions

```typescript
const articlesCollection: EntityCollection = {
    slug: "articles",
    entityActions: [
        {
            name: "Publish",
            icon: "publish",
            onClick: async ({ entity, context }) => {
                await context.dataSource.saveEntity({
                    path: entity.path,
                    entityId: entity.id,
                    values: { status: "published", published_at: new Date() },
                    collection: articlesCollection
                });
                context.snackbarController.open({
                    message: "Article published!"
                });
            }
        },
        {
            name: "Clone",
            icon: "content_copy",
            onClick: async ({ entity, context }) => {
                const { id, ...values } = entity.values;
                await context.dataSource.saveEntity({
                    path: entity.path,
                    values: { ...values, name: values.name + " (Copy)" },
                    collection: articlesCollection
                });
            }
        }
    ],
    properties: { /* ... */ }
};
```

## Collection Actions

For toolbar-level actions that work on the collection or selected entities:

```tsx
function PublishSelectedAction({ selectionController, context }: CollectionActionsProps) {
    const handlePublish = async () => {
        const selected = selectionController.selectedEntities;
        for (const entity of selected) {
            await context.dataSource.saveEntity({
                path: entity.path,
                entityId: entity.id,
                values: { status: "published" },
                collection: context.collection
            });
        }
    };

    return (
        <button onClick={handlePublish}>
            Publish {selectionController.selectedEntities.length} selected
        </button>
    );
}

// Register
const collection: EntityCollection = {
    Actions: PublishSelectedAction,
    // ...
};
```

![Collection actions](/img/collection_actions.png)

## Next Steps

- **[Additional Columns](/docs/frontend/additional-columns)** — Computed table columns
- **[Custom Fields](/docs/frontend/custom-fields)** — Custom form fields
