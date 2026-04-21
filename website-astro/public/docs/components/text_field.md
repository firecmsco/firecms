# Text Field

# Text Field Component

Text fields are versatile UI elements that allow users to input, edit, and display text within an application.
They play a crucial role in user interaction, providing a straightforward way for users to enter data, provide
feedback, complete forms, and interact with various interfaces that require text input. Text fields can be used for
short inputs like usernames or passwords, as well as for longer text entries like comments, messages, or
detailed descriptions.

In the context of FireCMS UI, the design principles and components are loosely based on Google's Material Design guidelines. This means that
the text fields in FireCMS benefit from a consistent and user-friendly design language, ensuring a cohesive
look and feel across different web applications. By leveraging these components, developers can quickly build
interactive and visually appealing forms and input areas that enhance user experience and maintain design consistency.

## Usage

To use the `TextField`, import it from your components directory and pass the `value`, `onChange`, and other necessary props to fit your use case.

## Basic Text Field

A basic text field with minimal configuration:

```tsx
import React, { useState } from "react";
import { TextField } from "@firecms/ui";

export default function TextFieldBasicDemo() {
    const [value, setValue] = useState("");

    return (
        <TextField
            value={value}
            onChange={(e) => setValue(e.target.value)}
            label="Basic Text Field"
            placeholder="Enter text"
        />
    );
}
```

## Multiline Text Field

You can create a multiline text field by setting the `multiline` prop to `true`. This is useful for longer text inputs like comments or descriptions.

```tsx
import React, { useState } from "react";
import { TextField } from "@firecms/ui";

export default function TextFieldMultilineDemo() {
    const [value, setValue] = useState("");

    return (
        <TextField
            value={value}
            onChange={(e) => setValue(e.target.value)}
            label="Multiline Text Field"
            placeholder="Enter text"
            multiline
            minRows={4}
        />
    );
}

```

## Sizes

The `TextField` component comes in various sizes to fit different layout needs. You can adjust the size using the `size` prop.

```tsx
import React, { useState } from "react";
import { TextField } from "@firecms/ui";

export default function TextFieldSizeDemo() {
    const [value, setValue] = useState("");

    return (
        <div className="flex flex-col gap-4">
            <TextField
                value={value}
                onChange={(e) => setValue(e.target.value)}
                label="Small Size"
                placeholder="Small size"
                size="small"
            />
            <TextField
                value={value}
                onChange={(e) => setValue(e.target.value)}
                label="Medium Size"
                placeholder="Medium size"
                size="medium"
            />
            <TextField
                value={value}
                onChange={(e) => setValue(e.target.value)}
                label="Large Size"
                placeholder="Large size"
                size="large"
            />
        </div>
    );
}

```

## Adornments

You can add adornments to the beginning or end of a text field to provide additional context or functionality.

```tsx
import React, { useState } from "react";
import { TextField } from "@firecms/ui";

export default function TextFieldAdornmentDemo() {
    const [value, setValue] = useState("");

    return (
        <TextField
            value={value}
            onChange={(e) => setValue(e.target.value)}
            label="Text Field with Adornment"
            placeholder="Enter text"
            endAdornment={<span>@</span>}
        />
    );
}
```

