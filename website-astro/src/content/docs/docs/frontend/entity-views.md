---
title: Entity Views
sidebar_label: Entity Views
slug: docs/frontend/entity-views
description: Add custom tabs and views to entity detail pages for previews, analytics, related data, or custom UI.
---

## Overview

Entity views let you add custom **tabs** to the entity detail page alongside the default form. Use them for:

- Live **previews** (website preview, rendered content)
- **Related data** views (order items, child entities)
- **Analytics** or charts
- **Custom editors** (rich text, map editors)

## Adding Entity Views

```typescript
const articlesCollection: EntityCollection = {
    slug: "articles",
    name: "Articles",
    entityViews: [
        {
            key: "preview",
            name: "Preview",
            Builder: ArticlePreview
        },
        {
            key: "related",
            name: "Related Articles",
            Builder: RelatedArticlesView
        }
    ],
    properties: { /* ... */ }
};
```

## Building an Entity View

```tsx
import { EntityCustomViewParams } from "@rebasepro/types";

function ArticlePreview({
    entity,
    modifiedValues,
    formContext
}: EntityCustomViewParams) {
    // modifiedValues has the unsaved, live form values
    const title = modifiedValues?.title ?? entity?.values?.title;
    const content = modifiedValues?.content ?? entity?.values?.content;

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold">{title}</h1>
            <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
    );
}
```

### EntityCustomViewParams

| Prop | Type | Description |
|------|------|-------------|
| `entity` | `Entity` | The saved entity (null for new entities) |
| `modifiedValues` | `EntityValues` | Current unsaved form values (live as user types) |
| `formContext` | `FormContext` | Full form context |
| `collection` | `EntityCollection` | Collection definition |

![Entity view with secondary form](/img/entity_view_secondary_form.png)

## Controlling Position

Views appear as tabs. You can configure their position:

```typescript
entityViews: [
    {
        key: "preview",
        name: "Preview",
        Builder: ArticlePreview,
        position: "start"  // Appears before the default form tab
    }
]
```

## Next Steps

- **[Custom Fields](/docs/frontend/custom-fields)** — Build custom form fields
- **[Entity Actions](/docs/frontend/entity-actions)** — Custom action buttons
