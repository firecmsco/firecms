---
id: custom_previews
title: Custom previews
sidebar_label: Custom previews
---

Every property you define in the CMS as a preview component associated by
default. In some cases you may want to build a custom preview component.

Just as you can customize how your property field is rendered, you can change
how the preview of a property is displayed in collection and other read only
views.

You can build your preview as a React component that takes
[PreviewComponentProps](../api/interfaces/previewcomponentprops.md) as props.

`PreviewComponentProps` has two generic types: the first one is the type of the
property, such as `string` or `boolean` and the second one (optional) is the
type for any custom props you would like to pass to the preview, just like
done when defining custom fields.

### Example
Example of a custom preview for a `boolean` property:

```tsx
import React, { ReactElement } from "react";
import { PreviewComponentProps } from "dist/index";

import CheckBoxOutlineBlank from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxOutlined from "@mui/icons-material/CheckBoxOutlined";

export default function CustomBooleanPreview({
                                                 value, property, size
                                             }: PreviewComponentProps<boolean>)
    : ReactElement {
    return (
        value ? <CheckBoxOutlined/> : <CheckBoxOutlineBlank/>
    );
}
```

...and how it is used:

```tsx
export const blogSchema = buildSchema({
    name: "Blog entry",
    properties: {
        // ...
        reviewed: {
            title: "Reviewed",
            dataType: "boolean",
            config: {
                Preview: CustomBooleanPreview
            }
        },
    }
});
```


