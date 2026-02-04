# FireCMS v4 Breaking Changes & Migration Guide

This document covers breaking changes and migration patterns for FireCMS v4 (custom_backend branch). It serves as a reference for both developers and LLMs when migrating code from the `next` branch or earlier versions.

---

## Overview

FireCMS v4 introduces significant architectural changes to support multiple backends (PostgreSQL, MongoDB, Firestore, etc.). The key philosophy change is that **collections and properties are now pre-resolved** - there is no runtime resolution step.

---

## Import Changes

### Package Imports

| Old Import | New Import |
|------------|------------|
| `import { ... } from "../../types"` | `import { ... } from "@firecms/types"` |
| `import { ... } from "../types"` | `import { ... } from "@firecms/types"` |
| `import isEqual from "react-fast-compare"` | `import { deepEqual } from "fast-equals"` |

### Type Imports from `@firecms/types`

All core types should be imported from `@firecms/types`:
```typescript
import {
    Entity,
    EntityCollection,
    Property,
    FilterValues,
    SaveEntityProps,
    CollectionSize,
    ViewMode,
    EnumValueConfig
} from "@firecms/types";
```

### Utility Imports from `@firecms/common`

Common utilities should be imported from `@firecms/common`:
```typescript
import {
    getValueInPath,
    resolveEnumValues,
    getSubcollections
} from "@firecms/common";
```

### Local Utility Imports (firecms_core)

Some utilities remain in the local package:
```typescript
import { getPropertyInPath, IconForView } from "../../util";
import { getEntityTitlePropertyKey, getEntityImagePreviewPropertyKey } from "../../util/previews";
```

---

## Property Schema Changes

### Property Type Field

| Old (next branch) | New (v4) |
|-------------------|----------|
| `dataType: "string"` | `type: "string"` |
| `dataType: "number"` | `type: "number"` |
| `dataType: "boolean"` | `type: "boolean"` |
| `dataType: "map"` | `type: "map"` |
| `dataType: "array"` | `type: "array"` |
| `dataType: "reference"` | `type: "reference"` |

### Enum Values

| Old (next branch) | New (v4) |
|-------------------|----------|
| `enumValues: [...]` | `enum: [...]` |
| `stringProperty.enumValues` | `stringProperty.enum` |

### Checking Property Type

```typescript
// OLD (next branch)
if (property.dataType === "string") { ... }

// NEW (v4)
if ((property as any).type === "string") { ... }
// Or with proper typing:
if ("type" in property && property.type === "string") { ... }
```

---

## Collection Schema Changes

### Filter and Sort

| Old (next branch) | New (v4) |
|-------------------|----------|
| `initialFilter: {...}` | `filter: {...}` |
| `initialSort: ["field", "asc"]` | `sort: ["field", "asc"]` |
| `defaultFilter` | Not available - use `filter` |
| `defaultSort` | Not available - use `sort` |

---

## Removed Concepts

### Resolution Functions

In v4, collections and properties are **pre-resolved** at configuration time. The following functions/concepts no longer exist:

| Removed | Replacement |
|---------|-------------|
| `resolveCollection()` | Use `collection` directly |
| `resolveProperty()` | Use `property` directly |
| `resolveIdsFrom()` | Use `fullPath` directly |
| `ResolvedEntityCollection` | Use `EntityCollection` |
| `ResolvedProperty` | Use `Property` |
| `ResolvedStringProperty` | Use `Property` with type assertion |
| `PropertyOrBuilder` | Use `Property` |
| `PropertiesOrBuilders` | Use `Properties` |

### Navigation Controller Changes

| Removed Method | Replacement |
|----------------|-------------|
| `navigation.resolveIdsFrom(path)` | Use the path directly |
| `navigation.resolveAliasesFrom(path)` | Use the path directly |

### Example Migration

```typescript
// OLD (next branch)
const navigation = useNavigationController();
const resolvedPath = useMemo(() => navigation.resolveIdsFrom(fullPath), [fullPath]);
const resolvedCollection = resolveCollection({
    collection,
    path: resolvedPath,
    propertyConfigs: customizationController.propertyConfigs,
    authController
});
const property = resolvedCollection.properties[key] as ResolvedProperty;

// NEW (v4)
const resolvedPath = fullPath;  // No resolution needed
const property = collection.properties[key] as Property;
```

---

## Subcollections Access

### Getting Subcollections

```typescript
// OLD (next branch)
const subcollections = collection.subcollections;

// NEW (v4)
import { getSubcollections } from "@firecms/common";
const subcollections = getSubcollections(collection);
```

---

## Entity Reference Constructor

The `EntityReference` class now takes a single props object:

```typescript
// OLD (next branch)
new EntityReference(id, path)

// NEW (v4)
new EntityReference({ id, path })
// Or with datasource/database:
new EntityReference({ id, path, datasource: "firestore", databaseId: "mydb" })
```

---

## Entity ID Type

Entity IDs can now be `string | number`. When you need a string:

```typescript
// When storing in a Set<string> or using as object key
const idString = String(entity.id);

// Example in callbacks
entities.map(entity => ({
    id: String(entity.id),
    entity
}));
```

---

## Navigation & Path Changes

### idPath vs path

The `idPath` property has been removed. Use `path` instead:

```typescript
// OLD (next branch)
navigateToEntity({ entity, path, idPath, collection });
<Component fullPath={idPath} />

// NEW (v4)
navigateToEntity({ entity, path, collection });
<Component fullPath={path} />
```

---

## Hooks Changes

### useReferenceDialog → useEntitySelectionDialog

```typescript
// OLD
const { referenceDialog, open } = useReferenceDialog({...});

// NEW
const { entitySelectionDialog, open } = useEntitySelectionDialog({...});
```

---

## Kanban Board Configuration

Kanban view is now always available. To configure columns:

```typescript
const collection: EntityCollection = {
    slug: "products",
    name: "Products",
    dbPath: "products",
    properties: {
        status: {
            type: "string",
            name: "Status",
            enum: [
                { id: "draft", label: "Draft", color: "grayLight" },
                { id: "published", label: "Published", color: "greenLight" },
                { id: "archived", label: "Archived", color: "orangeLight" }
            ]
        }
    },
    // Optional: Pre-configure kanban column
    kanban: {
        columnProperty: "status"
    },
    // Optional: Enable ordering within columns
    orderProperty: "order"
};
```

---

## Quick Reference: Common Patterns

### Checking Property Has Enum

```typescript
// Check if a property has enum values
const stringProperty = property as any;
if (stringProperty.type === "string" && stringProperty.enum) {
    const enumValues = resolveEnumValues(stringProperty.enum);
    // ...
}
```

### Getting Storage Recent IDs

The storage functions may return different types; cast as needed:

```typescript
const recentIds = (getRecentIds?.(path) ?? []).map(String);
addRecentId?.(path, String(entity.id));
```

### Comparing Filter/Sort Changes

Don't compare against non-existent default values:

```typescript
// OLD (next branch) - checking if changed from defaults
if (!isEqual(filterValues, collection.defaultFilter)) { ... }

// NEW (v4) - just check if filter is set
if (filterValues && Object.keys(filterValues).length > 0) { ... }
```

---

## For LLMs: Key Migration Steps

When migrating code from `next` branch to `custom_backend` (v4):

1. **Replace imports**: `../../types` → `@firecms/types`
2. **Replace comparison lib**: `react-fast-compare` → `fast-equals`
3. **Remove resolution calls**: Delete `resolveCollection`, `resolveProperty`, `resolveIdsFrom` usage
4. **Use collection/property directly**: They're already resolved
5. **Fix property type checks**: `dataType` → `type`, `enumValues` → `enum`
6. **Remove `idPath`**: Use `path` instead
7. **Fix EntityReference constructor**: Use object syntax `{ id, path }`
8. **Cast entity.id to String**: When needed for string operations
9. **Get subcollections via helper**: `getSubcollections(collection)`
10. **Import utilities from correct packages**: Check `@firecms/common` vs local `../../util`

---

## Version Information

- **Branch**: `custom_backend`
- **Target**: FireCMS v4 with PostgreSQL/multi-backend support
- **Last Updated**: 2026-02-04