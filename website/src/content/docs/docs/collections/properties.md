---
title: Properties
sidebar_label: Properties
slug: docs/collections/properties
description: Property types define the data type, validation, and UI rendering for each field in a collection. Rebase supports string, number, boolean, date, array, map, reference, relation, and geopoint types.
---

## Overview

Properties define the columns in your database table and how they are rendered in the admin UI. Each property has a `type` that determines:

- The **database column type** (via Drizzle schema generation)
- The **form field** component
- The **table cell** renderer
- The **validation** rules

## Property Types

| Type | Description | PostgreSQL Column |
|------|-------------|-------------------|
| `string` | Text, select, markdown, file upload, URL, email | `varchar`, `text`, `jsonb` |
| `number` | Integer, decimal, currency | `integer`, `numeric`, `bigint`, `serial` |
| `boolean` | True/false toggle | `boolean` |
| `date` | Date, datetime, timestamp | `timestamp`, `date` |
| `array` | Ordered list of values | `jsonb` |
| `map` | Key-value object | `jsonb` |
| `geopoint` | Latitude/longitude pair | `jsonb` |
| `reference` | Embedded reference to another entity | `varchar` (stores ID) |
| `relation` | SQL foreign key relation | Uses the `relations` array |

## Common Properties

All property types share these options:

| Property | Type | Description |
|----------|------|-------------|
| `type` | `string` | **Required.** Data type (see above) |
| `name` | `string` | **Required.** Display label |
| `description` | `string` | Help text shown below the field |
| `columnWidth` | `number` | Column width in pixels (table view) |
| `readOnly` | `boolean` | Prevent editing |
| `disabled` | `boolean \| PropertyDisabledConfig` | Disable with optional tooltip |
| `hideFromCollection` | `boolean` | Hide from table view |
| `defaultValue` | `any` | Default value for new entities |
| `validation` | `object` | Validation rules |
| `Field` | `React.ComponentType` | Custom field component |
| `Preview` | `React.ComponentType` | Custom table cell component |
| `propertyConfig` | `string` | Registered property config key |
| `editable` | `boolean` | Enable inline editing in table (default: true) |

## String Properties

```typescript
name: {
    type: "string",
    name: "Name",
    validation: { required: true, min: 2, max: 200 }
}

description: {
    type: "string",
    name: "Description",
    multiline: true,       // Textarea
    markdown: true         // Markdown editor
}

category: {
    type: "string",
    name: "Category",
    enum: [
        { id: "electronics", label: "Electronics", color: "blueDark" },
        { id: "clothing", label: "Clothing", color: "pinkLight" },
    ]
}

email: {
    type: "string",
    name: "Email",
    email: true,           // Email validation
    validation: { required: true }
}

website: {
    type: "string",
    name: "Website",
    url: true              // URL validation
}

avatar: {
    type: "string",
    name: "Avatar",
    storage: {             // File upload
        storagePath: "avatars",
        acceptedFiles: ["image/*"],
        maxSize: 2 * 1024 * 1024
    }
}
```

### String Options

| Property | Type | Description |
|----------|------|-------------|
| `multiline` | `boolean` | Render as textarea |
| `markdown` | `boolean` | Render as markdown editor |
| `email` | `boolean` | Email format validation |
| `url` | `boolean` | URL format validation |
| `storage` | `StorageConfig` | Enable file upload |
| `enum` | `EnumValues` | Render as select dropdown |
| `multiSelect` | `boolean` | Allow multiple enum selections |
| `columnType` | `string` | Database column: `"varchar"`, `"text"` |
| `isId` | `string` | ID generation: `"uuid"`, `"cuid"`, `"increment"`, `"manual"` |
| `userSelect` | `boolean` | Render as a user picker |

## Number Properties

```typescript
price: {
    type: "number",
    name: "Price",
    validation: { required: true, min: 0 }
}

quantity: {
    type: "number",
    name: "Quantity",
    columnType: "integer"  // Store as integer
}
```

### Number Options

| Property | Type | Description |
|----------|------|-------------|
| `enum` | `EnumValues` | Render as select with numeric values |
| `columnType` | `string` | `"integer"`, `"bigint"`, `"numeric"`, `"serial"`, `"smallint"` |
| `isId` | `string` | ID generation strategy |

## Boolean Properties

```typescript
active: {
    type: "boolean",
    name: "Active",
    defaultValue: true
}
```

![Switch field](/img/fields/Switch.png)

## Date Properties

```typescript
created_at: {
    type: "date",
    name: "Created At",
    autoValue: "on_create",   // Set automatically on creation
    readOnly: true
}

updated_at: {
    type: "date",
    name: "Updated At",
    autoValue: "on_update"    // Set automatically on every save
}

event_date: {
    type: "date",
    name: "Event Date",
    mode: "date"              // Date only (no time)
}
```

![Date field](/img/fields/Date.png)

### Date Options

| Property | Type | Description |
|----------|------|-------------|
| `mode` | `"date" \| "date_time"` | Date only or date + time (default: `"date_time"`) |
| `autoValue` | `"on_create" \| "on_update"` | Auto-set timestamps |
| `columnType` | `string` | `"timestamp"`, `"date"` |

## Array Properties

```typescript
tags: {
    type: "array",
    name: "Tags",
    of: { type: "string" }    // Array of strings
}

images: {
    type: "array",
    name: "Images",
    of: {
        type: "string",
        storage: { storagePath: "images", acceptedFiles: ["image/*"] }
    }
}

// Block editor (multiple types)
content: {
    type: "array",
    name: "Content Blocks",
    oneOf: {
        properties: {
            text: {
                type: "map",
                properties: {
                    body: { type: "string", name: "Body", markdown: true }
                }
            },
            image: {
                type: "map",
                properties: {
                    src: { type: "string", name: "Image", storage: { ... } },
                    caption: { type: "string", name: "Caption" }
                }
            }
        }
    }
}
```

![Block field](/img/fields/Block.png)

## Map Properties

```typescript
address: {
    type: "map",
    name: "Address",
    properties: {
        street: { type: "string", name: "Street" },
        city: { type: "string", name: "City" },
        zip: { type: "string", name: "ZIP Code" },
        country: { type: "string", name: "Country" }
    }
}

metadata: {
    type: "map",
    name: "Metadata",
    keyValue: true    // Free-form key-value editor
}
```

![Group field](/img/fields/Group.png)

## Enum Values

Used with string or number properties to render selects:

```typescript
// Simple array
enum: ["draft", "published", "archived"]

// With labels
enum: [
    { id: "draft", label: "Draft" },
    { id: "published", label: "Published" },
    { id: "archived", label: "Archived" }
]

// With colors (for Kanban columns and chips)
enum: [
    { id: "draft", label: "Draft", color: "grayDark" },
    { id: "published", label: "Published", color: "greenDark" },
    { id: "archived", label: "Archived", color: "orangeDark" }
]
```

![Select field](/img/fields/Select.png)

## Validation

```typescript
validation: {
    required: true,             // Field is required
    unique: true,               // Must be unique in the table
    requiredMessage: "Custom error message",

    // String-specific
    min: 2,                     // Minimum length
    max: 200,                   // Maximum length
    matches: /^[a-z]+$/,       // Regex pattern
    email: true,                // Email format
    url: true,                  // URL format

    // Number-specific
    min: 0,                     // Minimum value
    max: 1000,                  // Maximum value
    integer: true,              // Must be integer

    // Array-specific
    min: 1,                     // Minimum items
    max: 10,                    // Maximum items
}
```

## Conditional Fields

Dynamically change property config based on entity values:

```typescript
price: {
    type: "number",
    name: "Price",
    dynamicProps: ({ values }) => ({
        disabled: values.is_free === true,
        validation: values.is_free ? {} : { required: true, min: 0 }
    })
}
```

## Next Steps

- **[Relations](/docs/collections/relations)** — Foreign keys and joins
- **[Security Rules](/docs/collections/security-rules)** — Row Level Security
- **[Custom Fields](/docs/frontend/custom-fields)** — Build custom field components
