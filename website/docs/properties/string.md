---
id: string
title: String
sidebar_label: String
---

## `config`

* `storageMeta` You can specify a `StorageMeta` configuration. It is used to
  indicate that this string refers to a path in Google Cloud Storage.
    * `mediaType` Media type of this reference, used for displaying the
      preview.
    * `storagePath` Absolute path in your bucket. You can specify it
      directly or use a callback
    * `acceptedFiles` File MIME types that can be uploaded to this
      reference.
    * `metadata` Specific metadata set in your uploaded file.
    * `fileName` You can specify a fileName callback if you need to
      customize the name of the file
    * `storeUrl` When set to `true`, this flag indicates that the download
      URL of the file will be saved in Firestore instead of the Cloud
      storage path. Note that the generated URL may use a token that, if
      disabled, may make the URL unusable and lose the original reference to
      Cloud Storage, so it is not encouraged to use this flag. Defaults to
      false.
* `url` If the value of this property is a URL, you can set this flag
  to `true`
  to add a link, or one of the supported media types to render a preview.
* `enumValues` You can use the enum values providing a map of possible
  exclusive values the property can take, mapped to the label that it is
  displayed in the dropdown. You can use a simple object with the format
  `value` => `label`, or with the format `value` => `EnumValueConfig` if you
  need extra customization, (like disabling specific options or assigning
  colors). If you need to ensure the order of the elements, you can pass
  a `Map` instead of a plain object.
* `multiline` Is this string property long enough, so it should be displayed
  in a multiple line field. Defaults to false. If set to `true`, the number
  of lines adapts to the content.
* `markdown` Should this string property be displayed as a markdown field.
  If `true`, the field is rendered as a text editors that supports markdown
  highlight syntax. It also includes a preview of the result.
* `previewAsTag` Should this string be rendered as a tag instead of just
  text.

## `validation`

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
