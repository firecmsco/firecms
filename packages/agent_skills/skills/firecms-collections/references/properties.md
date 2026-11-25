# Property reference

Every option below is taken from `packages/firecms_core/src/types/properties.ts`
(`node_modules/@firecms/core/dist/types/properties.d.ts` in a project). A property is one of
`StringProperty`, `NumberProperty`, `BooleanProperty`, `DateProperty`, `GeopointProperty`,
`ReferenceProperty`, `ArrayProperty`, `MapProperty`, or a `PropertyBuilder` returning one.

## Options on every property (`BaseProperty`)

| Option | Type | Notes |
|---|---|---|
| `dataType` | `"string" \| "number" \| "boolean" \| "date" \| "geopoint" \| "reference" \| "array" \| "map"` | Required. |
| `name` | `string` | Label in the form and column header. |
| `description` | `string` | Shown under the field. |
| `longDescription` | `string` | Shown in a tooltip. |
| `columnWidth` | `number` | Column width in pixels. |
| `hideFromCollection` | `boolean` | Hide the column, keep the form field. |
| `readOnly` | `boolean` | Render as a preview in the form. |
| `disabled` | `boolean \| { clearOnDisabled?, disabledMessage?, hidden? }` | Disabled field; `hidden` hides it in the form. |
| `validation` | `PropertyValidationSchema` (per type, below) | |
| `defaultValue` | value or `null` | Applied to new entities (every save with the collection's `alwaysApplyDefaultValues`). |
| `nullable` | `boolean` | Lets the user explicitly set `null`. `clearable` is the deprecated name. |
| `widthPercentage` | `number` 0-100 | Width in the form; `50` puts two fields per row. |
| `Field` | `React.ComponentType<FieldProps<T, CustomProps>>` | Custom form field (see `firecms-custom-views`). |
| `Preview` | `React.ComponentType<PropertyPreviewProps<T, CustomProps>>` | Custom preview in tables and read-only views. |
| `customProps` | any | Passed to `Field` and `Preview`. |
| `propertyConfig` | `string` | Key of a registered `PropertyConfig` (built-in or yours) to inherit from. |
| `conditions` | `PropertyConditions` | JSON-Logic rules (`disabled`, `hidden`, `readOnly`, `required`, `min`, `max`, `defaultValue`, `enumConditions`, `allowedEnumValues`, `excludedEnumValues`, `referencePath`, `referenceFilter`, `canAddElements`, `sortable`, `acceptedFiles`, `maxFileSize`). |
| `editable` | `boolean` | Can the collection editor change this property. Default `true`. |

Validation on every type (`PropertyValidationSchema`): `required`, `requiredMessage`, `unique`
(one entity in the collection with this value), `uniqueInArray` (once per parent array).

## string

| Option | Type | Notes |
|---|---|---|
| `multiline` | `boolean` | Textarea that grows with the content. |
| `markdown` | `boolean \| { html?: boolean; transformPastedText?: boolean }` | Markdown editor. `transformPastedText` converts pasted rich text to markdown. |
| `enumValues` | `EnumValues` | Select. |
| `storage` | `StorageConfig` | File upload; the value is the storage path. |
| `url` | `boolean \| "image" \| "video" \| "audio" \| "file"` | Link, or a media preview of the URL. |
| `email` | `boolean` | Email field. |
| `userSelect` | `boolean` | Picks a CMS user; stores the auth uid. |
| `previewAsTag` | `boolean` | Show as a chip in previews. |
| `reference` | `ReferenceProperty` | Stores another entity's id as a string; `reference.path` is the target collection. |
| `validation` | `{ length?, min?, max?, matches?: string \| RegExp, matchesMessage?, trim?, lowercase?, uppercase? }` + common | `min`/`max` are lengths. |

## number

| Option | Type | Notes |
|---|---|---|
| `enumValues` | `EnumValues` | Select of numeric values. |
| `validation` | `{ min?, max?, lessThan?, moreThan?, positive?, negative?, integer? }` + common | |

## boolean

Only the common options. Rendered as a switch.

## date

| Option | Type | Notes |
|---|---|---|
| `mode` | `"date" \| "date_time"` | Default `"date_time"`. |
| `autoValue` | `"on_create" \| "on_update"` | Set automatically on creation, or on every save. |
| `timezone` | `string` (IANA, e.g. `"Europe/Madrid"`) | Display and input in that zone; stored in UTC. |
| `clearable` | `boolean` | Icon to clear the value. |
| `validation` | `{ min?: Date, max?: Date }` + common | |

The value is a JS `Date` in the CMS, a Firestore `Timestamp` in the database.

## geopoint

Only the common options. The value is a `GeoPoint` (`new GeoPoint(latitude, longitude)` from
`@firecms/core`), stored as a Firestore GeoPoint.

## reference

| Option | Type | Notes |
|---|---|---|
| `path` | `string` | Target collection path or id. Must be a mounted collection. Can be left undefined in a builder until known. |
| `forceFilter` | `FilterValues<string>` | Only entities passing the filter can be selected, e.g. `{ active: ["==", true] }`. |
| `previewProperties` | `string[]` | Fields shown in the reference preview (first 3). |
| `includeId` | `boolean` | Show the id in the preview. Default `true`. |
| `includeEntityLink` | `boolean` | Link to open the referenced entity. Default `true`. |

The value is an `EntityReference` (`new EntityReference(id, path)` from `@firecms/core`),
stored as a Firestore `DocumentReference`.

## array

| Option | Type | Notes |
|---|---|---|
| `of` | `PropertyOrBuilder \| Property[]` | The item property. An array of properties makes a fixed tuple. Cannot be another `array`. |
| `oneOf` | `{ properties: Properties; propertiesOrder?: string[]; typeField?: string; valueField?: string }` | Items shaped `{ type, value }`, the type picking the property. For block/page-builder content. |
| `sortable` | `boolean` | Reorder items. Default `true`. |
| `canAddElements` | `boolean` | Default `true`. |
| `expanded` | `boolean` | Initially expanded. Default `true`. |
| `minimalistView` | `boolean` | Render children without the expandable panel. |
| `validation` | `{ min?, max? }` + common | Item count. |

What the array renders as depends on `of`: strings with `enumValues` become a multi-select,
strings with `storage` a multi-file upload, references a multi-reference picker, maps a repeat
group. `of` or `oneOf` is required unless you provide a custom `Field`.

## map

| Option | Type | Notes |
|---|---|---|
| `properties` | `PropertiesOrBuilders` | Child properties. |
| `propertiesOrder` | `string[]` | Order of children. |
| `previewProperties` | `string[]` | Children shown in the preview. |
| `keyValue` | `boolean` | Free key-value table; no `properties` needed. |
| `spreadChildren` | `boolean` | Each child gets its own table column. |
| `pickOnlySomeKeys` | `boolean` | The user adds only the keys they need. |
| `expanded` | `boolean` | Initially expanded. Default `true`. |
| `minimalistView` | `boolean` | Children without the panel and the title. |
| `validation` | common | Without `required: true` an empty map is valid even if children are required. |

## EnumValues

```ts
type EnumValues = EnumValueConfig[] | Record<string | number, string | EnumValueConfig>;
type EnumValueConfig = {
    id: string | number;       // stored value
    label: string;             // shown label
    disabled?: boolean;
    color?: ChipColorKey | ChipColorScheme;   // e.g. "blueLight", or { color: "#cfdfff", text: "#102046" }
};
```

Use the array form when order matters. Chip color keys: `{blue,cyan,teal,green,yellow,orange,red,
pink,purple,gray}{Lighter,Light,Dark,Darker}`, e.g. `greenLight`, `redDarker`.

## StorageConfig

| Option | Type | Notes |
|---|---|---|
| `storagePath` | `string \| (context: UploadedFileContext) => string` | Required. Folder in the bucket. |
| `fileName` | `string \| (context) => string \| Promise<string>` | File name. |
| `acceptedFiles` | `string[]` | MIME types, `"image/*"` style wildcards allowed. |
| `maxSize` | `number` | Bytes. |
| `metadata` | `Record<string, unknown>` | Firebase `UploadMetadata`, e.g. `{ cacheControl: "max-age=1000000" }`. |
| `imageResize` | `{ maxWidth?, maxHeight?, mode?: "contain" \| "cover", format?: "original" \| "jpeg" \| "png" \| "webp", quality?: number }` | Client-side resize before upload (jpeg, png, webp). |
| `imageCompression` | same as `imageResize` | Deprecated. |
| `includeBucketUrl` | `boolean` | Store `gs://bucket/path` instead of `path`. |
| `storeUrl` | `boolean` | Store the download URL instead of the path (discouraged: the token can be revoked). |
| `processFile` | `(file: File) => Promise<File> \| undefined` | Transform before upload. |
| `postProcess` | `(pathOrUrl: string) => Promise<string>` | Transform the saved value. |
| `previewUrl` | `(fileName: string) => string` | Custom preview URL. |

String placeholders in `storagePath` and `fileName`: `{file}`, `{file.name}`, `{file.ext}`,
`{rand}`, `{entityId}`, `{propertyKey}`, `{path}`. `UploadedFileContext` has `file`, `propertyKey`,
`property`, `entityId`, `path`, `values`, `storage`.

## PropertyBuilder

```ts
type PropertyBuilder<T, M> = (props: {
    values: Partial<M>;            // current form values
    previousValues?: Partial<M>;   // values before this edit
    propertyValue?: any;           // this property's value
    propertyKey?: string;          // dot path, e.g. "address.street" or "items.0.price"
    index?: number;                // for array items
    path: string;                  // collection path
    entityId?: string;             // undefined for new entities
    authController: AuthController;
}) => Property<T> | null;          // null removes the field
```

Builders can be used at any level (inside `map.properties`, as an array's `of`). They must be
synchronous.

## Built-in property config keys

`propertyConfig` can name one of the built-in widgets: `text_field`, `multiline`, `markdown`,
`url`, `email`, `user_select`, `select`, `multi_select`, `number_input`, `number_select`,
`multi_number_select`, `file_upload`, `multi_file_upload`, `group`, `key_value`, `reference`,
`reference_as_string`, `multi_references`, `switch`, `date_time`, `repeat`, `custom_array`,
`block`. Setting the options directly (`multiline: true`, `enumValues`, ...) is usually clearer in
code.
