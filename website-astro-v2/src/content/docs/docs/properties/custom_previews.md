---
slug: docs/properties/custom_previews
title: Custom previews
sidebar_label: Custom previews
description: In FireCMS, custom previews infuse life into your CMS by allowing you to personalize how properties are displayed in read-only contexts, like collection views. Craft each preview with a unique React component that leverages `PropertyPreviewProps`, supporting both the property type and any additional custom props. The example showcases a tailored boolean property preview using distinct icons for true or false states, making data interpretation instant and intuitive. Implementing such custom previews empowers you to align the visual representation of your data with the specific needs and branding of your project, delivering a more engaging and informative CMS experience.
---

Every property you define in the CMS has a preview component associated by
default. In some cases you may want to build a custom preview component.

Just as you can customize how your property field is rendered, you can change
how the preview of a property is **displayed in collection** and other **read only
views**.

You can build your preview as a React component that takes
[PropertyPreviewProps](../api/interfaces/PropertyPreviewProps) as props.

`PropertyPreviewProps` has two generic types: the first one is the type of the
property, such as `string` or `boolean` and the second one (optional) is the
type for any custom props you would like to pass to the preview, just like
done when defining custom fields.

### Example
Example of a custom preview for a `boolean` property:

```tsx
import React from "react";
import { PropertyPreviewProps } from "@firecms/core";
import { CheckBoxIcon, CheckBoxOutlineBlankIcon } from "@firecms/ui";

export default function CustomBooleanPreview({
                                                    value, property, size
                                                }: PropertyPreviewProps<boolean>
)
{
    return (
        value ? <CheckBoxIcon/> : <CheckBoxOutlineBlankIcon/>
    );
}
```

...and how it is used:

```tsx
export const blogCollection = buildCollection({
    name: "Blog entry",
    properties: {
        // ...
        reviewed: {
            name: "Reviewed",
            dataType: "boolean",
            Preview: CustomBooleanPreview
        },
    }
});
```


