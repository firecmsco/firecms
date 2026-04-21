# BooleanSwitch


BooleanSwitch is a component for toggling between `true`, `false`, or an indeterminate state. It offers a binary choice or an optional third state, often signifying a lack of preference.

## Usage

Import the `BooleanSwitch` from `@firecms/ui` and provide the `value`, and optionally, a callback with `onValue-Change` to handle the state changes.

## Default Switch

Example of a simple switch that toggles between `true` and `false`.

```tsx
import React, { useState } from "react";
import { BooleanSwitch } from "@firecms/ui";

export default function BooleanSwitchDefaultDemo() {
    const [value, setValue] = useState(true);
    return (
        <BooleanSwitch
            value={value}
            onValueChange={setValue}
        />
    );
}

```

## Indeterminate State

Example of a switch that toggles between `true`, `false`, and `null` (indeterminate).

```tsx
import React, { useState } from "react";
import { BooleanSwitch } from "@firecms/ui";

export default function BooleanSwitchIndeterminateDemo() {
    const [value, setValue] = useState<boolean | null>(null);
    return (
        <BooleanSwitch
            value={value}
            allowIndeterminate={true}
            onValueChange={setValue}
        />
    );
}

```

## Size Variants

The `BooleanSwitch` component can have different sizes, controlled by the `size` prop.

```tsx
import React, { useState } from "react";
import { BooleanSwitch } from "@firecms/ui";

export default function BooleanSwitchSizeDemo() {
    const [value, setValue] = useState<boolean | null>(true);

    return (
        <>
            <BooleanSwitch
                value={value}
                size="small"
                onValueChange={setValue}
            />
            <BooleanSwitch
                value={value}
                size="medium"
                onValueChange={setValue}
            />
        </>
    );
}

```

## Disabled State

Disabled `BooleanSwitch` does not allow user interaction and appears visually distinct.

```tsx
import React from "react";
import { BooleanSwitch } from "@firecms/ui";

export default function BooleanSwitchDisabledDemo() {
    return (
        <BooleanSwitch
            value={true}
            disabled={true}
        />
    );
}

```

