# Skeleton

The `Skeleton` component is used as a placeholder while content is loading. It provides a simple visual representation of the component that is being loaded, typically as a gray or light-colored block.

## Usage

To use the `Skeleton`, import it from your components and pass the `width`, `height`, and `className` props to customize its appearance.

## Basic Skeleton

A simple skeleton with default width and height.

```tsx
import React from "react";
import { Skeleton } from "@firecms/ui";

export default function SkeletonBasicDemo() {
    return <Skeleton />;
}
```

## Custom Sized Skeleton

A skeleton component that showcases custom width and height.

```tsx
import React from "react";
import { Skeleton } from "@firecms/ui";

export default function SkeletonCustomSizeDemo() {
    return (
        <>
            <Skeleton width={200} height={20} />
            <Skeleton width={100} height={10} />
        </>
    );
}
```

## Skeleton With Custom Classes

Demonstrates usage of the `className` prop to apply custom styles.

```tsx
import React from "react";
import { Skeleton } from "@firecms/ui";

export default function SkeletonCustomClassDemo() {
    return <Skeleton className="my-4 bg-red-400" />;
}
```

