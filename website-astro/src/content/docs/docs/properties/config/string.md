---
slug: docs/properties/config/string
title: String
sidebar_label: String
description: Configuration for string properties in FireCMS, including storage, markdown, enums, and validation options.
---

The **string property** is the most versatile field type in FireCMS. Use it for everything from simple text inputs to file uploads, rich text editors, and dropdowns. When building an **admin panel** for your **Firebase** app, string properties let you create:

- **Text fields**: Names, titles, descriptions
- **Select dropdowns**: Status fields, categories, options
- **File uploads**: Images, documents (stored in **Firebase Storage**)
- **Markdown editors**: Rich content with formatting
- **Email/URL fields**: Validated input types

```tsx
import { buildProperty } from "@firecms/core";

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
* `includeBucketUrl` When set to `true`, FireCMS will store a fully-qualified
  storage URL instead of just the storage path.
  For Firebase Storage this is a `gs://...` URL, e.g.
  `gs://my-bucket/path/to/file.png`.
  Defaults to `false`.
* `storeUrl` When set to `true`, this flag indicates that the download
  URL of the file will be saved in Firestore instead of the Cloud
  storage path. Note that the generated URL may use a token that, if
  disabled, may make the URL unusable and lose the original reference to
  Cloud Storage, so it is not encouraged to use this flag. Defaults to
  `false`.
* `maxSize` Max file size in bytes.
* `processFile` Use this callback to process the file before uploading it.
  If you return `undefined`, the original file is uploaded.
* `postProcess` Postprocess the saved value (storage path, storage URL or download URL)
  after it has been resolved.
* `previewUrl` Provide a custom preview URL for a given file name.

#### Images: resize/compress before upload

FireCMS supports client-side image optimization before upload:

* `imageResize` (recommended) Advanced image resizing and cropping configuration.
  Only applied to images (`image/jpeg`, `image/png`, `image/webp`).
  - `maxWidth`, `maxHeight`
  - `mode`: `contain` or `cover`
  - `format`: `original`, `jpeg`, `png`, `webp`
  - `quality`: 0-100

* `imageCompression` (deprecated) Legacy image resizing/compression.

```tsx
import { buildProperty } from "@firecms/core";

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
        },
        includeBucketUrl: true,
        imageResize: {
            maxWidth: 1200,
            maxHeight: 1200,
            mode: "cover",
            format: "webp",
            quality: 85
        }
    }
});
```

### `url`

If the value of this property is a URL, you can set this flag
to `true` to add a link, or one of the supported media types to render a
preview.

```tsx
import { buildProperty } from "@firecms/core";

const amazonLinkProperty = buildProperty({
    dataType: "string",
    name: "Amazon link",
    url: true
});
```

You can also define the preview type for the url: `image`, `video` or `audio`:

```tsx
import { buildProperty } from "@firecms/core";

const imageProperty = buildProperty({
    name: "Image",
    dataType: "string",
    url: "image",
});
```

### `email`

If set to `true`, this field will be validated as an email address and
rendered with an email-specific input. This is useful for contact forms,
user profiles, or any field that should contain a valid email.

```tsx
import { buildProperty } from "@firecms/core";

const emailProperty = buildProperty({
    name: "Email",
    dataType: "string",
    email: true
});
```

### `userSelect`

This property is used to indicate that the string is a **user ID**, and
it will be rendered as a user picker. Note that the user ID needs to be the
one used in your authentication provider, e.g. Firebase Auth.
You can also use a property builder to specify the user path dynamically
based on other values of the entity.

```tsx
import { buildProperty } from "@firecms/core";

const assignedUserProperty = buildProperty({
    name: "Assigned User",
    dataType: "string",
    userSelect: true
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
import { buildProperty } from "@firecms/core";

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
import { buildProperty } from "@firecms/core";

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
import { buildProperty } from "@firecms/core";

const property = buildProperty({
    dataType: "string",
    name: "Text",
    markdown: true
});
```

### `previewAsTag`

Should this string be rendered as a tag instead of just text.

```tsx
import { buildProperty } from "@firecms/core";

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
