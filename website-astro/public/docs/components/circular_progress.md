# CircularProgress


The `CircularProgress` component is used to indicate loading states to the user. It displays a spinning indicator which can be customized in size.

## Usage

To incorporate the `CircularProgress` component, import it from your component library and optionally pass the `size` and `className` props for customization.

## Basic CircularProgress

This demonstrates a basic usage of the `CircularProgress` component without any customization.

```tsx
import React from "react";
import { CircularProgress } from "@firecms/ui";

export default function CircularProgressBasicDemo() {
    return <CircularProgress />;
}
```

## CircularProgress Sizes

The following examples show how to use the `CircularProgress` component in different sizes: small, medium, and large.

```tsx
import React from "react";
import { CircularProgress } from "@firecms/ui";

export default function CircularProgressSizesDemo() {
    return (
        <div>
            <div>
                <p>Smallest</p>
                <CircularProgress size="smallest" />
            </div>
            <div>
                <p>Small</p>
                <CircularProgress size="small" />
            </div>
            <div>
                <p>Medium</p>
                <CircularProgress size="medium" />
            </div>
            <div>
                <p>Large</p>
                <CircularProgress size="large" />
            </div>
        </div>
    );
}

```

