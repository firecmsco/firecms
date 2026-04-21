# Slider

Sliders allow users to input a value by sliding a handle along a track. This component is highly customizable with various options for orientation, step, range, and more.

## Usage

To use the `Slider`, import it from your components library and configure it using props such as `min`, `max`, `step`, `value`, and others.

## Basic Slider

A basic example of the Slider component with default settings.

```tsx
import React, { useState } from "react";
import { Slider } from "@firecms/ui";

export default function SliderBasicDemo() {
    const [value, setValue] = useState([60]);

    return (
        <Slider
            value={value}
            onValueChange={setValue}
            min={0}
            max={100}
            step={1}
        />
    );
}

```

## Range Slider

An example of a range slider with two handles that allow users to select a range of values.

```tsx
import React, { useState } from "react";
import { Slider } from "@firecms/ui";

export default function SliderRangeDemo() {
    const [value, setValue] = useState([50, 70]);

    return (
        <Slider
            value={value}
            onValueChange={setValue}
            min={0}
            max={100}
            step={1}
        />
    );
}

```

## Small Slider

A smaller version of the Slider component with a reduced size.

```tsx
import React, { useState } from "react";
import { Slider } from "@firecms/ui";

export default function SliderSmallDemo() {
    const [value, setValue] = useState([50]);

    return (
        <Slider
            value={value}
            onValueChange={setValue}
            min={0}
            size={"small"}
            max={100}
            step={1}
        />
    );
}

```

## Disabled Slider

Illustrating how to use the `disabled` prop to create a non-interactive Slider.

```tsx
import React from "react";
import { Slider } from "@firecms/ui";

export default function SliderDisabledDemo() {
    return (
        <Slider
            value={[30]}
            min={0}
            max={100}
            disabled
        />
    );
}
```

## Inverted Slider

An example of an inverted slider where the value decreases from left to right.

```tsx
import React, { useState } from "react";
import { Slider } from "@firecms/ui";

export default function SliderInvertedDemo() {
    const [value, setValue] = useState([70]);

    return (
        <Slider
            value={value}
            onValueChange={setValue}
            min={0}
            max={100}
            inverted
        />
    );
}
```

