---
title: Custom Fields
sidebar_label: Custom Fields
slug: docs/frontend/custom-fields
description: Build custom form fields for entity editing with full access to the form context, entity values, and Rebase hooks.
---

<video className="intro_video" loop autoPlay muted>
    <source src="/img/custom_fields_dark.mp4" type="video/mp4"/>
</video>

## Overview

Rebase generates form fields automatically based on property types. For custom behavior, you can build your own fields.

## Creating a Custom Field

A custom field is a React component that receives `FieldProps`:

```tsx
import { FieldProps } from "@rebasepro/core";

function ColorPickerField({ value, setValue, error, showError }: FieldProps<string>) {
    return (
        <div>
            <input
                type="color"
                value={value ?? "#000000"}
                onChange={(e) => setValue(e.target.value)}
            />
            {showError && error && <span className="text-red-500">{error}</span>}
        </div>
    );
}
```

### FieldProps

| Prop | Type | Description |
|------|------|-------------|
| `value` | `T` | Current field value |
| `setValue` | `(value: T) => void` | Update the field value |
| `error` | `string` | Validation error message |
| `showError` | `boolean` | Whether to display the error |
| `isSubmitting` | `boolean` | Form is being saved |
| `property` | `Property` | The property configuration |
| `context` | `FormContext` | Full form context with all entity values |
| `disabled` | `boolean` | Field is readonly |
| `tableMode` | `boolean` | Rendering inside the spreadsheet (compact mode) |

## Registering a Custom Field

### Per-Property

Register on a single property:

```typescript
properties: {
    brand_color: {
        type: "string",
        name: "Brand Color",
        Field: ColorPickerField
    }
}
```

### Global Property Config

Register a reusable field type:

```typescript
const colorPropertyConfig: PropertyConfig = {
    key: "color_picker",
    name: "Color Picker",
    Field: ColorPickerField,
    property: {
        type: "string"
    }
};

// Register globally
<Rebase propertyConfigs={[colorPropertyConfig]} ... />
```

Then use it in any collection:

```typescript
properties: {
    color: {
        type: "string",
        name: "Color",
        propertyConfig: "color_picker"
    }
}
```

## Accessing Form Context

Custom fields can access the full entity values:

```tsx
function PriceWithTaxField({ value, setValue, context }: FieldProps<number>) {
    const taxRate = context.values.tax_rate ?? 0.1;
    const priceWithTax = value ? value * (1 + taxRate) : 0;

    return (
        <div>
            <input
                type="number"
                value={value ?? 0}
                onChange={(e) => setValue(Number(e.target.value))}
            />
            <p>With tax: ${priceWithTax.toFixed(2)}</p>
        </div>
    );
}
```

## Table Mode

When rendering inside the spreadsheet view, fields should be compact. Check `tableMode`:

```tsx
function MyField({ value, setValue, tableMode }: FieldProps<string>) {
    if (tableMode) {
        return <span onClick={() => { /* open editor */ }}>{value}</span>;
    }

    return (
        <div>
            <label>Full Editor</label>
            <textarea value={value ?? ""} onChange={(e) => setValue(e.target.value)} />
        </div>
    );
}
```

## Custom Previews

For custom rendering in the table (non-editing mode), use the `Preview` component:

```tsx
function ColorPreview({ value }: { value: string }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
                width: 24, height: 24,
                borderRadius: 4,
                backgroundColor: value
            }} />
            <span>{value}</span>
        </div>
    );
}

// Register it
properties: {
    color: {
        type: "string",
        name: "Color",
        Field: ColorPickerField,
        Preview: ColorPreview
    }
}
```

## Next Steps

- **[Entity Views](/docs/frontend/entity-views)** — Custom tabs in the entity editor
- **[Entity Actions](/docs/frontend/entity-actions)** — Custom action buttons
- **[Additional Columns](/docs/frontend/additional-columns)** — Computed table columns
