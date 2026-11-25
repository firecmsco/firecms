---
name: firecms-collections
description: Define FireCMS collections and properties in code with buildCollection and buildProperty, covering every data type, enums, storage uploads, markdown, references, validation, conditional properties, subcollections, permissions, callbacks, entity actions, view modes, filters and text search. Use this skill when you create or change a FireCMS collection or property, or map a Firestore collection into FireCMS.
---

# FireCMS collections

A **collection** maps a Firestore collection path to the CMS. FireCMS turns it into a navigation
entry, a table (or cards or kanban board), a form, filters and a reference picker. A collection is
a plain TypeScript object of type `EntityCollection`; its **properties** describe the fields of
each document.

Everything here is exported by `@firecms/core` (in a Cloud project, import the same names from
`@firecms/cloud`). Read `firecms-basics` first if you do not know which edition the project uses.
For custom React fields, previews, entity tabs and toolbar buttons, see `firecms-custom-views`.

Reference material in this skill:

- [references/properties.md](references/properties.md): every property type and every option.
- [references/collection-props.md](references/collection-props.md): every `EntityCollection` prop.

## A complete collection

```tsx
import { buildCollection, buildProperty, EntityReference } from "@firecms/core";

export type Product = {
    name: string;
    price: number;
    status: string;
    available: boolean;
    main_image: string;
    tags: string[];
    description: string;
    category: EntityReference;
    publisher: { name: string; external_id: string };
    created_at: Date;
};

export const productsCollection = buildCollection<Product>({
    id: "products",              // used in URLs (/c/products) and to match UI-edited configs
    path: "products",            // the Firestore collection path
    name: "Products",
    singularName: "Product",
    icon: "shopping_cart",       // Material icon key, see https://firecms.co/docs/icons
    description: "Products currently sold in the shop",
    textSearchEnabled: true,
    initialSort: ["created_at", "desc"],
    properties: {
        name: {
            dataType: "string",
            name: "Name",
            validation: { required: true }
        },
        price: buildProperty(({ values }) => ({
            dataType: "number",
            name: "Price",
            validation: { required: values.available, min: 0, max: 10000 },
            disabled: !values.available && {
                clearOnDisabled: true,
                disabledMessage: "Only available products have a price"
            }
        })),
        status: {
            dataType: "string",
            name: "Status",
            enumValues: [
                { id: "draft", label: "Draft", color: "grayLight" },
                { id: "published", label: "Published", color: "greenLight" }
            ],
            defaultValue: "draft"
        },
        available: { dataType: "boolean", name: "Available", columnWidth: 100 },
        main_image: {
            dataType: "string",
            name: "Image",
            storage: {
                storagePath: "images/products",
                acceptedFiles: ["image/*"],
                maxSize: 2 * 1024 * 1024,
                imageResize: { maxWidth: 1600, format: "webp", quality: 85 }
            }
        },
        tags: { dataType: "array", name: "Tags", of: { dataType: "string" } },
        description: { dataType: "string", name: "Description", markdown: true },
        category: { dataType: "reference", name: "Category", path: "categories" },
        publisher: {
            dataType: "map",
            name: "Publisher",
            properties: {
                name: { dataType: "string", name: "Name" },
                external_id: { dataType: "string", name: "External id" }
            }
        },
        created_at: { dataType: "date", name: "Created at", autoValue: "on_create", readOnly: true }
    }
});
```

Then mount it: add it to the `collections` passed to `useBuildNavigationController` in
`src/App.tsx` (self-hosted), or to `collections` in the `FireCMSAppConfig` (Cloud).

Rules:

- **`id`, `name`, `path` and `properties` are required.** Keep `id` stable: it is in URLs, it is
  what `reference` properties may point to, and Cloud and the collection editor match UI-edited
  configs to code by `id`.
- **`buildCollection` and `buildProperty` are identity functions.** They only help TypeScript.
  Pass your document type as the generic (`buildCollection<Product>`) so property keys are
  checked against it. Never `buildCollection<any>` in new code.
- **Property keys are Firestore field names.** Order of keys in `properties` is the order of the
  columns and form fields, unless you set `propertiesOrder`.
- **Every referenced collection must be mounted** (top level or as a subcollection, it can have
  `hideFromNavigation: true`). Otherwise every reference cell shows an error.

## Property data types

| `dataType` | Stored in Firestore as | Typical widget | Key options |
|---|---|---|---|
| `string` | string | text field | `multiline`, `markdown`, `enumValues`, `storage`, `url`, `email`, `userSelect`, `previewAsTag`, `reference` |
| `number` | number | number field | `enumValues`, validation `min`/`max`/`integer`/`positive` |
| `boolean` | boolean | switch | |
| `date` | Timestamp | date or date-time picker | `mode: "date" \| "date_time"`, `autoValue`, `timezone` |
| `geopoint` | GeoPoint | lat/lng field | |
| `reference` | DocumentReference | reference picker | `path`, `previewProperties`, `forceFilter`, `includeId`, `includeEntityLink` |
| `array` | array | repeat / multi-select / multi-upload / blocks | `of`, `oneOf`, `sortable`, `canAddElements`, `expanded` |
| `map` | map | group of fields | `properties`, `keyValue`, `spreadChildren`, `pickOnlySomeKeys`, `expanded` |

Options shared by every property: `name`, `description`, `longDescription` (tooltip),
`columnWidth`, `hideFromCollection`, `readOnly`, `disabled`, `validation`, `defaultValue`,
`nullable`, `widthPercentage` (form width, e.g. `50` for two per row), `Field`, `Preview`,
`customProps`, `propertyConfig`, `conditions`, `editable`. Full list with types:
[references/properties.md](references/properties.md).

The widget is picked from the data type and options:

```tsx
// text field
title: { dataType: "string", name: "Title" },
// textarea that grows
summary: { dataType: "string", name: "Summary", multiline: true },
// markdown editor (with paste-to-markdown)
body: { dataType: "string", name: "Body", markdown: { transformPastedText: true } },
// select
country: { dataType: "string", name: "Country", enumValues: { es: "Spain", it: "Italy" } },
// multi select
locales: { dataType: "array", name: "Locales", of: { dataType: "string", enumValues: { en: "English", es: "Spanish" } } },
// link with preview
website: { dataType: "string", name: "Website", url: true },
// image URL rendered as an image
cover_url: { dataType: "string", name: "Cover", url: "image" },
// email
contact: { dataType: "string", name: "Contact", email: true },
// pick a user of the CMS (stores the user's uid)
owner: { dataType: "string", name: "Owner", userSelect: true },
// key-value map with arbitrary keys
metadata: { dataType: "map", name: "Metadata", keyValue: true },
```

## Enums

`enumValues` turns a `string` or `number` property into a select (an `array` of them into a
multi-select). Two shapes:

```tsx
import { EnumValues } from "@firecms/core";

// Object: key is the stored value, value is the label (or a config)
export const locales: EnumValues = {
    es: "Spanish",
    en: "English",
    fr: { id: "fr", label: "French", disabled: true }
};

// Array: keeps order, allows colors
export const currencies: EnumValues = [
    { id: "EUR", label: "Euros", color: "blueDark" },
    { id: "USD", label: "Dollars", color: "greenLight" }
];
```

`color` is a chip color key (`blueLighter`, `blueLight`, `blueDark`, `blueDarker`, and the same four
shades of `cyan`, `teal`, `green`, `yellow`, `orange`, `red`, `pink`, `purple`, `gray`) or a
`{ color, text }` scheme. A `string` property with `enumValues` also enables the **kanban** view
(see View modes).

## Storage uploads

A `string` property with `storage` is a file upload; an `array` whose `of` has `storage` is a
multi-file upload. The stored value is the storage path (not a URL) unless `storeUrl: true`.

```tsx
gallery: {
    dataType: "array",
    name: "Gallery",
    of: {
        dataType: "string",
        storage: {
            storagePath: "products/{entityId}",   // placeholders: {file} {file.name} {file.ext} {rand} {entityId} {propertyKey} {path}
            fileName: "{rand}_{file}",
            acceptedFiles: ["image/*"],
            maxSize: 5 * 1024 * 1024,
            metadata: { cacheControl: "max-age=1000000" },
            imageResize: { maxWidth: 2000, maxHeight: 2000, mode: "contain", format: "webp", quality: 80 }
        }
    }
}
```

`storagePath` and `fileName` also accept a function `(context: UploadedFileContext) => string`.
Other options: `includeBucketUrl`, `storeUrl`, `processFile`, `postProcess`, `previewUrl`.
`imageCompression` is deprecated: use `imageResize`. Storage security rules must allow the
signed-in users to write to the path.

## References

```tsx
import { EntityReference } from "@firecms/core";

author: {
    dataType: "reference",
    name: "Author",
    path: "authors",                       // collection path or id; must be mounted
    previewProperties: ["name", "avatar"],  // first 3 are shown
    forceFilter: { active: ["==", true] }   // only these can be picked
},
related: {
    dataType: "array",
    name: "Related products",
    of: { dataType: "reference", path: "products" }
},
// The ID as a plain string instead of a DocumentReference:
author_id: {
    dataType: "string",
    name: "Author (id)",
    reference: { dataType: "reference", path: "authors" }
}
```

In code, a reference value is an `EntityReference` (`new EntityReference(id, path)`); it is
written to Firestore as a `DocumentReference`.

## Arrays and maps

```tsx
// Repeatable group of fields
ingredients: {
    dataType: "array",
    name: "Ingredients",
    of: {
        dataType: "map",
        properties: {
            name: { dataType: "string", name: "Name", validation: { required: true } },
            grams: { dataType: "number", name: "Grams" }
        }
    },
    sortable: true,
    canAddElements: true
},
// Blocks: an array of typed items { type, value }, e.g. a page builder
content: {
    dataType: "array",
    name: "Content",
    oneOf: {
        typeField: "type",       // default "type"
        valueField: "value",     // default "value"
        properties: {
            text: { dataType: "string", name: "Text", markdown: true },
            image: { dataType: "string", name: "Image", storage: { storagePath: "blocks", acceptedFiles: ["image/*"] } },
            products: { dataType: "array", name: "Products", of: { dataType: "reference", path: "products" } }
        }
    }
},
// Map shown as separate table columns
address: {
    dataType: "map",
    name: "Address",
    spreadChildren: true,
    properties: {
        street: { dataType: "string", name: "Street" },
        city: { dataType: "string", name: "City" }
    }
}
```

`of` can also be an array of properties, for a fixed-length tuple. An array cannot contain another
array directly: wrap it in a map.

## Validation

```tsx
validation: {
    required: true,
    requiredMessage: "A slug is required",
    unique: true,            // only one entity in the collection with this value
    uniqueInArray: true,     // only once in the parent array
    // string
    min: 3, max: 80, length: 10,
    matches: /^[a-z0-9-]+$/, matchesMessage: "Lowercase letters, digits and dashes",
    trim: true, lowercase: true, uppercase: false,
    // number
    // min, max, lessThan, moreThan, positive, negative, integer
    // date: min, max (Date)
    // array: min, max (number of items)
}
```

A `map` without `required: true` accepts an empty object even when its children are required.

## Conditional (dynamic) properties

A property can be a function of the entity's current values. Use it to disable, hide, change
enum options or validation based on other fields:

```tsx
import { buildProperty } from "@firecms/core";

discount_code: buildProperty(({ values, previousValues, propertyValue, path, entityId, authController }) => {
    if (!values.on_sale) return null;      // returning null removes the field
    return {
        dataType: "string",
        name: "Discount code",
        validation: { required: true }
    };
}),
// Disable instead of removing, and clear the value when disabled:
price: ({ values }) => ({
    dataType: "number",
    name: "Price",
    disabled: !values.available && { clearOnDisabled: true, disabledMessage: "Set available first" }
}),
```

`disabled` takes `true` or `{ clearOnDisabled?, disabledMessage?, hidden? }` (`hidden: true` hides
the field in the form when disabled). Builders must be synchronous; for async data (enum values
from another collection) use a collections builder (see Dynamic collections).

`conditions` is the JSON-Logic alternative to builders that can be stored in Firestore and edited
in the collection editor (`disabled`, `hidden`, `readOnly`, `required`, `allowedEnumValues`,
`referenceFilter`, ...). Prefer builders in code.

## Columns, order and display

- `propertiesOrder: ["name", "price", "subcollection:locales", "my_additional_field"]` sets the
  order of columns and form fields, and **hides anything not listed** from the table. It takes
  property keys, `additionalFields` keys, `subcollection:<id>` and `collectionGroupParent`.
- `hideFromCollection: true` on a property hides its column but keeps it in the form.
- `readOnly: true` renders the value as a preview in the form.
- `titleProperty` picks the field used as the entity's title (defaults to the first string);
  `previewProperties` the fields shown when the entity is referenced; `imageProperty` the thumbnail
  in cards and kanban views.
- `defaultSize: "xs" | "s" | "m" | "l" | "xl"` sets the row height.
- `additionalFields` adds computed columns: see `firecms-custom-views`.

## Subcollections and collection groups

```tsx
const localesCollection = buildCollection<Locale>({
    id: "product_locales",
    path: "locales",                 // relative to the parent document
    name: "Locales",
    customId: { es: "Spanish", en: "English" },   // the document id is picked from these
    properties: { title: { dataType: "string", name: "Title" } }
});

export const productsCollection = buildCollection<Product>({
    id: "products",
    path: "products",
    name: "Products",
    subcollections: [localesCollection],   // tab in the entity view: products/{id}/locales
    properties: { /* ... */ }
});

// All `locales` subcollections across products at once:
export const localesGroup = buildCollection<Locale>({
    ...localesCollection,
    id: "locales_group",
    name: "All locales",
    collectionGroup: true
});
```

A collection group query may need its own Firestore rule, e.g.
`match /{path=**}/locales/{document=**} { allow read: if ...; }`.

`customId`: `true` (the user types the id), `"optional"` (may type it, else generated), or an
`EnumValues` (picks from a fixed set). Default: Firestore generates it. `formAutoSave` cannot be
combined with `customId`.

## Permissions

Permissions decide what the UI offers. They are **not** security: write Firestore rules as well.

```tsx
permissions: { read: true, create: true, edit: true, delete: false }

// Or a builder, re-evaluated per user and per entity
// (this one assumes the documents have an `owner` field holding a uid):
permissions: ({ user, authController, entity, path, pathSegments, collection }) => {
    const isAdmin = authController.extra?.roles?.includes("admin");
    return {
        read: true,
        create: isAdmin,
        edit: isAdmin || entity?.values.owner === user?.uid,
        delete: isAdmin
    };
}
```

Every flag defaults to `true`. `read: false` hides the collection from navigation. `entity` is
`null` when deciding collection-level actions such as create. Values in `authController.extra`
are whatever your `authenticator` stored with `authController.setExtra(...)`. With the PRO user
management plugin, roles and per-collection permissions are managed from the CMS instead (see
`firecms-basics`, "Features FireCMS already ships").

## Callbacks

Hooks around reads and writes, run in the browser by the CMS (not by Firestore triggers):

```tsx
import { buildEntityCallbacks, toSnakeCase } from "@firecms/core";

const productCallbacks = buildEntityCallbacks<Product>({
    onPreSave: ({ values, previousValues, entityId, status, path, collection, context }) => {
        // Return the values to save. Throwing stops the save and shows the message.
        return { ...values, name_lower: values.name?.toLowerCase() };
    },
    onSaveSuccess: ({ entityId, values, context }) => {
        context.snackbarController.open({ type: "success", message: `Saved ${entityId}` });
    },
    onSaveFailure: ({ values }) => { console.error("Save failed", values); },
    onPreDelete: ({ entity, context }) => {
        if (!context.authController.user?.email?.endsWith("@example.com"))
            throw Error("You cannot delete products");
    },
    onDelete: ({ entityId }) => { console.log("Deleted", entityId); },
    onFetch: ({ entity }) => entity,                  // transform after reading
    onIdUpdate: ({ values }) => toSnakeCase(values.name ?? "")  // derive the id (with customId)
});

export const productsCollection = buildCollection<Product>({
    id: "products", path: "products", name: "Products",
    callbacks: productCallbacks,
    properties: { /* ... */ }
});
```

`status` is `"new" | "existing" | "copy"`. `context` is the full `FireCMSContext` (`dataSource`,
`storageSource`, `authController`, `snackbarController`, `sideEntityController`, ...). Logic that
must run whatever client writes the data belongs in a Cloud Function, not here.

## Entity actions

Extra actions in each row's menu and in the entity form:

```tsx
import { ArchiveIcon } from "@firecms/ui";

entityActions: [{
    key: "archive",
    name: "Archive",
    icon: <ArchiveIcon/>,
    collapsed: false,          // show as a button, not only inside the "..." menu
    includeInForm: true,
    isEnabled: ({ entity }) => entity?.values.status !== "archived",
    onClick: async ({ entity, context, formContext, view, selectionController }) => {
        if (!entity) return;
        if (view === "form" && formContext) {
            formContext.setFieldValue("status", "archived");   // edit the open form
            return;
        }
        await context.dataSource.saveEntity({
            path: entity.path,
            entityId: entity.id,
            values: { ...entity.values, status: "archived" },
            status: "existing"
        });
        context.snackbarController.open({ type: "success", message: "Archived" });
    }
}]
```

The built-in actions have keys `edit`, `delete` and `copy`; an action with the same key replaces
one. Actions shared by several collections are registered once (self-hosted:
`<FireCMS entityActions={[...]}>`; Cloud: `entityActions` in the app config), each with a `key`,
and referenced from a collection by key: `entityActions: ["share"]`.

`context.dataSource.saveEntity` writes directly and skips the collection's callbacks. To run them,
use `saveEntityWithCallbacks` (see `firecms-custom-views`).

For buttons in the collection toolbar (bulk actions on selected rows, custom filters), use the
collection's `Actions` prop: see `firecms-custom-views`.

## View modes, filters and sorting

```tsx
defaultViewMode: "table",                      // "table" | "cards" | "kanban"
enabledViews: ["table", "cards", "kanban"],
kanban: { columnProperty: "status" },          // a string property with enumValues
orderProperty: "order",                        // number property, updated on drag (kanban)
imageProperty: "main_image",                   // thumbnail for cards and kanban

initialFilter: { status: ["==", "published"] },   // user can change it
forceFilter: { owner: ["==", "uid123"] },          // fixed, other filters disabled
allowedFilters: ["status", "category"],            // [] hides filters
initialSort: ["created_at", "desc"],
pagination: 50,                                    // true (50), false (load all) or a page size
inlineEditing: false,                              // always edit in the form
openEntityMode: "side_panel",                      // or "full_screen"
```

Filter operators: `<`, `<=`, `==`, `!=`, `>=`, `>`, `array-contains`, `in`, `not-in`,
`array-contains-any`. Firestore can only filter and sort by several fields when a composite index
exists: declare those combinations with `firestoreIndexesBuilder` on `useFirestoreDelegate`
(self-hosted) or in the Cloud app config:

```tsx
import { FirestoreIndexesBuilder } from "@firecms/firebase";

const firestoreIndexesBuilder: FirestoreIndexesBuilder = ({ path }) => {
    if (path === "products")
        return [{ category: "asc", available: "desc" }, { category: "asc", price: "asc" }];
    return undefined;
};
```

## Text search

Firestore has no full-text search. `textSearchEnabled: true` adds a search bar to the collection,
but it only works when a search backend is configured:

- **Local search** (small collections, filters what has been loaded): self-hosted, pass
  `localTextSearchEnabled: true` to `useFirestoreDelegate`; Cloud, enable it in project settings.
- **Typesense** via the FireCMS extension: `buildFireCMSSearchController({ region, extensionInstanceId })`
  from `@firecms/firebase`, passed as `textSearchControllerBuilder` to `useFirestoreDelegate`.
- **Algolia** or anything else: `buildExternalSearchController({ isPathSupported, search })`, where
  `search({ path, searchString })` resolves to the matching document ids;
  `performAlgoliaTextSearch(client, indexName, query)` does that for Algolia.

```tsx
import { buildExternalSearchController, performAlgoliaTextSearch, useFirestoreDelegate } from "@firecms/firebase";

const searchController = buildExternalSearchController({
    isPathSupported: (path) => path === "products",
    search: async ({ path, searchString }) =>
        path === "products" ? performAlgoliaTextSearch(algoliaClient, "products", searchString) : undefined
});

const firestoreDelegate = useFirestoreDelegate({ firebaseApp, textSearchControllerBuilder: searchController });
```

Paths not supported by an external controller fall back to local search when it is enabled.
Setup details: https://firecms.co/docs/collections/text_search.md.

## Dynamic collections

`collections` (and `views`) can be an async builder instead of an array. It receives
`{ user, authController, dataSource }` and returns the array:

```tsx
import { buildCollection, EntityCollectionsBuilder } from "@firecms/core";

const collectionsBuilder: EntityCollectionsBuilder = async ({ user, authController, dataSource }) => {
    const categories = await dataSource.fetchCollection({ path: "categories" });
    return [
        buildCollection({
            id: "products",
            path: "products",
            name: "Products",
            properties: {
                category: {
                    dataType: "string",
                    name: "Category",
                    enumValues: categories.map((c) => ({ id: c.id, label: String(c.values.name) }))
                }
            }
        })
    ];
};

// useBuildNavigationController({ collections: collectionsBuilder, ... })
```

Wrap a builder that depends on component state in `useCallback`, so navigation is not rebuilt
on every render.

## Reusable property configs

Define a property once and reuse it by key with `propertyConfig`. Registered configs also appear
in the collection editor's field picker.

```tsx
import { PropertyConfig } from "@firecms/core";

export const translatedString: PropertyConfig = {
    key: "translated_string",
    name: "Translated string",
    property: {
        dataType: "map",
        properties: {
            en: { dataType: "string", name: "English" },
            es: { dataType: "string", name: "Spanish" }
        }
    }
};

// Self-hosted: a record keyed by config key
// <FireCMS propertyConfigs={{ [translatedString.key]: translatedString }} ...>
// Cloud: an array in the app config
// propertyConfigs: [translatedString]

// In a collection:
title: { dataType: "map", name: "Title", propertyConfig: "translated_string" }
```

## Other useful collection props

`group` (deprecated: use `navigationGroupMappings` in `useBuildNavigationController`),
`hideFromNavigation`, `selectionEnabled`, `exportable` (with the export plugin), `includeJsonView`,
`history` (with the entity history plugin), `localChangesBackup`, `sideDialogWidth`,
`defaultSelectedView`, `hideIdFromForm`, `hideIdFromCollection`, `alwaysApplyDefaultValues`,
`databaseId` (a non-default Firestore database), `editable` (collection editor). All of them,
with types: [references/collection-props.md](references/collection-props.md).

## Common mistakes

- Missing `id`: it is required by the type and by Cloud merging.
- `buildCollection<any>` or `as any` to silence an error: fix the type or the property instead.
- Using props from old docs that are not in the type: there is no `indexes` prop on a collection
  (use `firestoreIndexesBuilder`), no `mediaType` in `storage`, no `alias` (use `id`), and
  `validation` has no `email` / `url` (use the property's `email: true` / `url: true`). Check
  `properties.d.ts` / `collections.d.ts` in `node_modules/@firecms/core/dist/types/`.
- `propertiesOrder` that omits a property: the property disappears from the table.
- A reference to a collection that is not mounted.
- A storage property without Storage rules that allow the upload.
- Expecting `permissions` or the `authenticator` to protect data: only Firestore rules do.
- Writing a custom field for something an option already does (`multiline`, `markdown`,
  `enumValues`, `url: "image"`, `userSelect`, `keyValue`). Check the table above first.
