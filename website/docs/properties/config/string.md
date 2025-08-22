---
id: string
title: String
sidebar_label: String
---

The string property can be used with many form fields, from
simple text fields, to select fields, markdown or file uploads (the
storage key, or the url gets saved).

```tsx
import { buildProperty } from "./builders";

const nameProperty = buildProperty({
    name: "Name",
    description: "Basic string property with validation",
    validation: { required: true },
    dataType: "string"
});
```

### `storage`

You can specify a `StorageMeta` configuration. It is used to
indicate that this string refers to a path in Google Cloud Storage.

* `mediaType` Media type of this reference, used for displaying the
  preview.
* `storagePath` Absolute path in your bucket. You can specify it
  directly or use a callback
* `acceptedFiles` File [MIME type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types) that can be uploaded to this
  reference. Note that you can also use the asterisk notation, so `image/*`
  accepts any image file, and so on.
* `metadata` Specific metadata set in your uploaded file.
* `fileName` You can use this prop to customize the uploaded filename.
  You can use a function as a callback or a string where you
  specify some placeholders that get replaced with the corresponding values.
  - `{file}` - Full file name
  - `{file.name}` - Name of the file without extension
  - `{file.ext}` - Extension of the file
  - `{rand}` - Random value used to avoid name collisions
  - `{entityId}` - ID of the entity
  - `{propertyKey}` - ID of this property
  - `{path}` - Path of this entity
* `storagePath` Absolute path in your bucket.
  You can use a function as a callback or a string where you
  specify some placeholders that get replaced with the corresponding values.
  - `{file}` - Full file name
  - `{file.name}` - Name of the file without extension
  - `{file.ext}` - Extension of the file
  - `{rand}` - Random value used to avoid name collisions
  - `{entityId}` - ID of the entity
  - `{propertyKey}` - ID of this property
  - `{path}` - Path of this entity
* `storeUrl` When set to `true`, this flag indicates that the download
  URL of the file will be saved in Firestore instead of the Cloud
  storage path. Note that the generated URL may use a token that, if
  disabled, may make the URL unusable and lose the original reference to
  Cloud Storage, so it is not encouraged to use this flag. Defaults to
  false.
* `imageCompression` Use client side image compression and resizing
  Will only be applied to these MIME types: `image/jpeg`, `image/png`
  and `image/webp`

```tsx
import { buildProperty } from "./builders";

const imageProperty = buildProperty({
    dataType: "string",
    storage: {
        mediaType: "image",
        storagePath: (context) => {
            return "images";
        },
        acceptedFiles: ["image/*"],
        fileName: (context) => {
            return context.file.name;
        }
    }
});
```

### `url`

If the value of this property is a URL, you can set this flag
to `true` to add a link, or one of the supported media types to render a
preview.

```tsx
import { buildProperty } from "./builders";

const amazonLinkProperty = buildProperty({
    dataType: "string",
    name: "Amazon link",
    url: true
});
```

You can also define the preview type for the url: `image`, `video` or `audio`:

```tsx
import { buildProperty } from "./builders";

const imageProperty = buildProperty({
    name: "Image",
    dataType: "string",
    url: "image",
});
```

### `enumValues`

You can use the enum values providing a map of possible exclusive values the
property can take, mapped to the label that it is displayed in the dropdown. You
can use a simple object with the format
`value` => `label`, or with the format `value`
=> [`EnumValueConfig`](../../api/type-aliases/EnumValueConfig) if you need extra
customization, (like disabling specific options or assigning colors). If you
need to ensure the order of the elements, you can pass a `Map` instead of a
plain object.

```tsx
import { buildProperty } from "./builders";

const amazonLinkProperty = buildProperty({
    dataType: "string",
    name: "Amazon link",
    enum: {
        "es": "Spanish",
        "de": "German",
        "en": "English",
        "it": "Italian",
        "fr": {
            id: "fr",
            label: "French",
            disabled: true
        }
    }
});
```

### `multiline`

Is this string property long enough, so it should be displayed
in a multiple line field. Defaults to false. If set to `true`, the number
of lines adapts to the content.

```tsx
import { buildProperty } from "./builders";

const property = buildProperty({
    name: "Description",
    dataType: "string",
    multiline: true
});
```

### `clearable`

Add an icon to clear the value and set it to `null`. Defaults to `false`

### `markdown`

Should this string property be displayed as a markdown field.
If `true`, the field is rendered as a text editors that supports markdown
highlight syntax. It also includes a preview of the result.

```tsx
import { buildProperty } from "./builders";

const property = buildProperty({
    dataType: "string",
    name: "Text",
    markdown: true
});
```

### `previewAsTag`

Should this string be rendered as a tag instead of just text.

```tsx
import { buildProperty } from "./builders";

const property = buildProperty({
    name: "Tags",
    description: "Example of generic array",
    dataType: "array",
    of: {
        dataType: "string",
        previewAsTag: true
    }
});
```

### `validation`

* `required` Should this field be compulsory.
* `requiredMessage` Message to be displayed as a validation error.
* `unique` The value of this field must be unique in this collection.
* `uniqueInArray` If you set it to `true`, the user will only be allowed to
  have the value of that property once in the parent
  `ArrayProperty`. It works on direct children properties or on first level
  children of a `MapProperty` (if set as the `.of` property of
  the `ArrayProperty`).
* `length` Set a required length for the string value.
* `min` Set a minimum length limit for the string value.
* `max` Set a maximum length limit for the string value.
* `matches` Provide an arbitrary regex to match the value against.
* `email` Validates the value as an email address via a regex.
* `url` Validates the value as a valid URL via a regex.
* `trim` Transforms string values by removing leading and trailing
  whitespace.
* `lowercase` Transforms the string value to lowercase.
* `uppercase` Transforms the string value to uppercase.

---

Based on your configuration the form field widgets that are created are:

- [`TextFieldBinding`](../../api/functions/TextFieldBinding) generic text field
- [`SelectFieldBinding`](../../api/functions/SelectFieldBinding) if `enumValues`
  are set in the string config, this field renders a select
  where each option is a colored chip.
- [`StorageUploadFieldBinding`](../../api/functions/StorageUploadFieldBinding)
  the property has a
  storage configuration.
- [`MarkdownEditorFieldBinding.`](../../api/functions/MarkdownEditorFieldBinding) the
  property has a
  markdown configuration.

Links:

- [API](../../api/interfaces/StringProperty)
