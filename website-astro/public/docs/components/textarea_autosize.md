# TextareaAutosize

The `TextareaAutosize` component automatically adjusts its height to fit the content.

## Usage

To use the `TextareaAutosize` component, import it from your components and pass the necessary props.

## Basic TextareaAutosize

A simple `TextareaAutosize` with basic usage.

```tsx
import React from 'react';
import { TextareaAutosize } from '@firecms/ui';

export default function TextareaAutosizeBasicDemo() {
    return (
        <TextareaAutosize 
            placeholder="Type your text here..."
        />
    );
}
```

## Controlled TextareaAutosize

An example of a controlled `TextareaAutosize` component.

```tsx
import React, { useState } from "react";
import { TextareaAutosize } from "@firecms/ui";

export default function TextareaAutosizeControlledDemo() {
    const [value, setValue] = useState("Controlled textarea");

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(event.target.value);
    };

    return (
        <TextareaAutosize 
            value={value}
            onChange={handleChange}
            placeholder="Type your text here..."
        />
    );
}
```

## TextareaAutosize with Max and Min Rows

Demonstrating how to set the minimum and maximum number of rows.

```tsx
import React from "react";
import { TextareaAutosize } from "@firecms/ui";

export default function TextareaAutosizeRowsDemo() {
    return (
        <TextareaAutosize 
            placeholder="Type your text here..."
            minRows={3}
            maxRows={6}
        />
    );
}
```

