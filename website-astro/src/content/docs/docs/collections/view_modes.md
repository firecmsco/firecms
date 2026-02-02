---
slug: docs/collections/view_modes
title: Collection View Modes
sidebar_label: View Modes
description: Display your collections as Tables, Cards, or Kanban boards in FireCMS. Choose the view that matches your data.
---

FireCMS offers three different ways to visualize your collections. Each view mode is optimized for different types of data and workflows.

![Collection View Modes](/img/blog/kanban_settings.png)

## Available View Modes

| View Mode | Description | Best For |
|-----------|-------------|----------|
| **Table** | Spreadsheet-like grid with inline editing | Dense data, bulk operations, detailed records |
| **Cards** | Responsive grid displaying thumbnails and key fields | Visual content, product catalogs, media libraries |
| **Kanban** | Board with columns based on a status/category field | Workflows, task management, order pipelines |

## Setting the Default View

Use the `defaultViewMode` property in your collection configuration:

```typescript
const productsCollection = buildCollection({
    path: "products",
    name: "Products",
    defaultViewMode: "cards", // "table" | "cards" | "kanban"
    properties: {
        // ...
    }
});
```

Users can still switch between views using the view selector in the collection toolbar — the `defaultViewMode` just sets what they see first.

---

## Table View

The default view mode. Displays entities in a spreadsheet-like grid with support for:
- Inline editing
- Sorting and filtering
- Column resizing and reordering
- Bulk selection

**Best for:** User lists, transaction logs, analytics data, any collection where you need to see many fields at once.

---

## Cards View

Transforms your collection into a responsive grid of cards. Each card displays:
- Image thumbnails (automatically detected from image properties)
- Title and key metadata
- Quick actions

![Cards View Example](/img/blog/cards_view_plants.png)

### Enable Cards View

```typescript
const productsCollection = buildCollection({
    path: "products",
    name: "Products",
    defaultViewMode: "cards",
    properties: {
        name: buildProperty({ dataType: "string", name: "Name" }),
        image: buildProperty({ 
            dataType: "string", 
            storage: { mediaType: "image", storagePath: "products" } 
        }),
        price: buildProperty({ dataType: "number", name: "Price" })
    }
});
```

**Best for:** Product catalogs, blog posts, media libraries, team directories, portfolios — any collection with images.

---

## Kanban View

Displays entities as cards organized into columns based on an enum property. Drag and drop cards between columns to update their status.

![Kanban View in Action](/img/blog/kanban_view.png)

### Enable Kanban View

Set `defaultViewMode: "kanban"` and configure the `kanban` property with the enum field that defines your columns:

```typescript
const tasksCollection = buildCollection({
    path: "tasks",
    name: "Tasks",
    defaultViewMode: "kanban",
    kanban: {
        columnProperty: "status" // Must be a string property with enumValues
    },
    properties: {
        title: buildProperty({ dataType: "string", name: "Task" }),
        status: buildProperty({
            dataType: "string",
            name: "Status",
            enumValues: {
                todo: "To Do",
                in_progress: "In Progress",
                review: "Review",
                done: "Done"
            }
        })
    }
});
```

### Drag and Drop Reordering

To enable reordering cards within a column, add an `orderProperty`:

```typescript
const tasksCollection = buildCollection({
    path: "tasks",
    name: "Tasks",
    defaultViewMode: "kanban",
    kanban: { columnProperty: "status" },
    orderProperty: "order", // Must reference a number property
    properties: {
        title: buildProperty({ dataType: "string", name: "Task" }),
        status: buildProperty({
            dataType: "string",
            name: "Status",
            enumValues: { todo: "To Do", in_progress: "In Progress", done: "Done" }
        }),
        order: buildProperty({ dataType: "number", name: "Order" })
    }
});
```

The `orderProperty` uses fractional indexing to maintain order without rewriting every document on each reorder.

:::caution Firestore Index Required
When using Kanban view with Firestore, you'll need a composite index on your column property. Firestore will prompt you with the exact index link when you first load the view.
:::

**Best for:** Task management, order fulfillment, content pipelines, support tickets, hiring workflows — any collection with distinct stages.

---

## Configuration in FireCMS Cloud

If you're using FireCMS Cloud, you can configure view modes through the UI without writing code:

1. Open your collection settings
2. Go to the **Display** tab
3. Select your **Default collection view** (Table, Cards, or Kanban)
4. For Kanban, choose the **Kanban Column Property** and optionally an **Order Property**

![Kanban Settings in FireCMS Cloud](/img/blog/kanban_settings.png)
