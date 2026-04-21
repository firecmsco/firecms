# DebouncedTextField


`DebouncedTextField` is a variation of the standard `TextField` component designed to delay the invocation of the
`onChange` callback. This delay helps in reducing the number of `onChange` calls for inputs that may have
frequent updates, such as during typing.

## Usage

To use `DebouncedTextField`, import it from your components. It supports all the `TextField` props including `value`, `onChange` among others.

## Basic DebouncedTextField

This example shows a basic usage of the `DebouncedTextField`, demonstrating how it can be used to handle value changes with a defer mechanism to reduce the number of updates.

```tsx
import React, { useState } from "react";
import { DebouncedTextField } from "@firecms/ui";

export default function DebouncedTextFieldBasicDemo() {
    const [value, setValue] = useState("");

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setValue(event.target.value);
    };

    return (
        <div>
            <DebouncedTextField
                value={value}
                onChange={handleChange}
            />
        </div>
    );
}

```

