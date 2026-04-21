# Checkbox


Checkboxes are used for selection from multiple options. They can be toggled between checked, unchecked, and an intermediate state.

## Usage

To use the `Checkbox`, import it from your components and pass the `checked`, `onCheckedChange`, and optionally, `disabled`, `size`, and `color` props.

## Basic Checkbox

A simple checkbox with minimal configuration.

```tsx
import React, { useState } from "react";
import { Checkbox } from "@firecms/ui";

export default function CheckboxBasicDemo() {
    const [checked, setChecked] = useState(true);

    return (
        <Checkbox
            checked={checked}
            onCheckedChange={(newChecked) => setChecked(newChecked)}
        />
    );
}

```

## Checkbox with Indeterminate State

A checkbox that showcases the indeterminate state, typically used for 'select all' scenarios where not all sub-selections are made.

```tsx
import React, { useState } from "react";
import { Checkbox } from "@firecms/ui";

export default function CheckboxIndeterminateDemo() {
    const [indeterminate, setIndeterminate] = useState(true);
    const [checked, setChecked] = useState(false);

    return (
        <Checkbox
            checked={checked}
            indeterminate={indeterminate}
            onCheckedChange={(newChecked) => {
                if (indeterminate) {
                    setIndeterminate(false);
                    setChecked(true);
                } else if (checked) {
                    setChecked(false);
                } else {
                    setIndeterminate(true);
                }
            }}
        />
    );
}

```

## Checkbox Sizes

Illustrating how to use different sizes for the checkbox component.

```tsx
import React, { useState } from "react";
import { Checkbox } from "@firecms/ui";

export default function CheckboxSizeDemo() {
    const [checked, setChecked] = useState(true);

    return (
        <div className="flex flex-col items-center gap-4">
            <Checkbox
                size="small"
                checked={checked}
                onCheckedChange={setChecked}
                color="primary"/>
            <Checkbox
                size="medium"
                checked={checked}
                onCheckedChange={setChecked}
                color="primary"/>
            <Checkbox
                size="large"
                checked={checked}
                onCheckedChange={setChecked}
                color="primary"/>
        </div>
    );
}

```

## Checkbox Colors

Demonstrates usage of the `color` prop to customize the checkbox appearance.

```tsx
import React, { useState } from "react";
import { Checkbox } from "@firecms/ui";

export default function CheckboxColorDemo() {
    const [checkedPrimary, setCheckedPrimary] = useState(true);
    const [checkedSecondary, setCheckedSecondary] = useState(true);

    return (
        <div className="flex flex-col items-center gap-4">
            <Checkbox
                size="medium"
                checked={checkedPrimary}
                onCheckedChange={setCheckedPrimary}
                color="primary"
            />
            <Checkbox
                size="medium"
                checked={checkedSecondary}
                onCheckedChange={setCheckedSecondary}
                color="secondary"
            />
        </div>
    );
}

```

