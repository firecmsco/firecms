# Chip


Chips are compact elements that represent an input, attribute, or action. They allow users to enter information, make selections, filter content, or trigger actions.

## Usage

To use the `Chip`, import it from your components and pass the necessary props like `children`, `colorScheme`, `size`, `error`, `outlined`, `onClick`, and `icon`.

## Basic Chip

A simple chip with minimal configuration. It displays a piece of text or a tag.

```tsx
import React from "react";
import { Chip } from "@firecms/ui";

export default function ChipBasicDemo() {
    return (
        <Chip>
            Basic Chip
        </Chip>
    );
}
```

## Chip Sizes

Illustrating how to use different sizes for the chip component. You can choose between `tiny`, `small`, and `medium`.

```tsx
import React from "react";
import { Chip } from "@firecms/ui";

export default function ChipSizesDemo() {
    return (
        <>
            <Chip size="small">Small Chip</Chip>
            <Chip size="medium">Medium Chip</Chip>
            <Chip size="large">Large Chip</Chip>
        </>
    );
}

```

## Chip Colors

Demonstrates usage of the `colorScheme` prop to customize the chip appearance according to your application's theme.

```tsx
import React from "react";
import { Chip } from "@firecms/ui";

export default function ChipColorsDemo() {
    return (
        <div className={"flex flex-wrap gap-2"}>
            <Chip colorScheme="blueLighter">blueLighter</Chip>
            <Chip colorScheme="cyanLighter">cyanLighter</Chip>
            <Chip colorScheme="tealLighter">tealLighter</Chip>
            <Chip colorScheme="greenLighter">greenLighter</Chip>
            <Chip colorScheme="yellowLighter">yellowLighter</Chip>
            <Chip colorScheme="orangeLighter">orangeLighter</Chip>
            <Chip colorScheme="redLighter">redLighter</Chip>
            <Chip colorScheme="pinkLighter">pinkLighter</Chip>
            <Chip colorScheme="purpleLighter">purpleLighter</Chip>
            <Chip colorScheme="grayLighter">grayLighter</Chip>

            <Chip colorScheme="blueLight">blueLight</Chip>
            <Chip colorScheme="cyanLight">cyanLight</Chip>
            <Chip colorScheme="tealLight">tealLight</Chip>
            <Chip colorScheme="greenLight">greenLight</Chip>
            <Chip colorScheme="yellowLight">yellowLight</Chip>
            <Chip colorScheme="orangeLight">orangeLight</Chip>
            <Chip colorScheme="redLight">redLight</Chip>
            <Chip colorScheme="pinkLight">pinkLight</Chip>
            <Chip colorScheme="purpleLight">purpleLight</Chip>
            <Chip colorScheme="grayLight">grayLight</Chip>

            <Chip colorScheme="blueDark">blueDark</Chip>
            <Chip colorScheme="cyanDark">cyanDark</Chip>
            <Chip colorScheme="tealDark">tealDark</Chip>
            <Chip colorScheme="greenDark">greenDark</Chip>
            <Chip colorScheme="yellowDark">yellowDark</Chip>
            <Chip colorScheme="orangeDark">orangeDark</Chip>
            <Chip colorScheme="redDark">redDark</Chip>
            <Chip colorScheme="pinkDark">pinkDark</Chip>
            <Chip colorScheme="purpleDark">purpleDark</Chip>
            <Chip colorScheme="grayDark">grayDark</Chip>

            <Chip colorScheme="blueDarker">blueDarker</Chip>
            <Chip colorScheme="cyanDarker">cyanDarker</Chip>
            <Chip colorScheme="tealDarker">tealDarker</Chip>
            <Chip colorScheme="greenDarker">greenDarker</Chip>
            <Chip colorScheme="yellowDarker">yellowDarker</Chip>
            <Chip colorScheme="orangeDarker">orangeDarker</Chip>
            <Chip colorScheme="redDarker">redDarker</Chip>
            <Chip colorScheme="pinkDarker">pinkDarker</Chip>
            <Chip colorScheme="purpleDarker">purpleDarker</Chip>
            <Chip colorScheme="grayDarker">grayDarker</Chip>
        </div>
    );
}

```

## Chip with Icon

Showcases how to use a chip with an icon for better user interaction or providing more information within the chip.

```tsx
import React from "react";
import { Chip, FaceIcon } from "@firecms/ui";

export default function ChipIconDemo() {
    return (
        <Chip icon={<FaceIcon size={"small"}/>}>
            Chip with Icon
        </Chip>
    );
}

```

## Clickable Chip

This example demonstrates a clickable chip that triggers an action on click. Useful for interactive tags or selections.

```tsx
import React from "react";
import { Chip } from "@firecms/ui";

export default function ChipClickableDemo() {
    const handleClick = () => {
        console.log("Chip clicked");
    };

    return (
        <Chip onClick={handleClick}>
            Clickable Chip
        </Chip>
    );
}
```

