# Button


Buttons are interactive UI elements that allow users to trigger specific actions or events within an application.
They play a crucial role in user interfaces, providing a visual cue for user-initiated actions.
Buttons can be utilized in various contexts, including forms for submission, dialogs for confirmation,
and toolbars for quick access to functions and features. By clicking a button, users can submit data,
open new windows, execute commands, and much more, making buttons an essential component for driving user
interaction and engagement.

## Size

The prop `size` can be used to change the size of the button.

Buttons come in three sizes: `small`, `medium`, `large`, `xl` and `2xl`.

```tsx
import React from "react";
import { Button } from "@firecms/ui";

export default function ButtonSizeDemo() {
    return (
        <div className={"flex flex-row gap-4 items-center justify-center"}>
            <Button
                size={"small"}
                onClick={() => console.log("Button clicked")}>
                Small
            </Button>
            <Button onClick={() => console.log("Button clicked")}>
                Medium
            </Button>
            <Button
                size={"large"}
                onClick={() => console.log("Button clicked")}>
                Large
            </Button>
            <Button
                size={"xl"}
                onClick={() => console.log("Button clicked")}>
                XLarge
            </Button>
            <Button
                size={"2xl"}
                onClick={() => console.log("Button clicked")}>
                XXLarge
            </Button>
        </div>
    );
}

```

## Variant

The `variant` prop changes the button's style. Possible values are `filled`, `outlined`, and `text`.

```tsx
import React from "react";
import { Button } from "@firecms/ui";

export default function VariantButtonDemo() {
    return (
        <div className={"flex flex-row gap-4 items-center justify-center"}>
            <Button variant="filled">
                Filled Button
            </Button>
            <Button color="neutral">
                Neutral Button
            </Button>
            <Button variant="outlined">
                Outlined Button
            </Button>
            <Button variant="text">
                Text Button
            </Button>
        </div>
    );
}

```

## Color

The `color` prop sets the color theme of the button. Possible values are `primary`, `secondary`, `text`, `error`, and `neutral`.

```tsx
import React from "react";
import { Button } from "@firecms/ui";

export default function ButtonColorDemo() {
    return (
        <div className={"flex flex-row gap-4 items-center justify-center"}>
            <Button color="primary">
                Primary
            </Button>
            <Button color="secondary">
                Secondary
            </Button>
            <Button color="text">
                Text
            </Button>
            <Button color="error">
                Error
            </Button>
            <Button color="neutral">
                Neutral
            </Button>
        </div>
    );
}

```

## Disabled

Setting `disabled` to `true` disables the button, preventing interactions.

```tsx
import React from "react";
import { Button } from "@firecms/ui";

export default function DisabledButtonDemo() {
    return (
        <div className={"flex flex-row gap-4 items-center justify-center"}>
            <Button disabled>
                Disabled Button
            </Button>
        </div>
    );
}

```

## Start Icon

The `startIcon` prop allows you to include an icon before the button's content.

```tsx
import React from "react";
import { AddIcon, Button } from "@firecms/ui";

export default function StartIconButtonDemo() {
    return (
        <div className={"flex flex-row gap-4 items-center justify-center"}>
            <Button startIcon={<AddIcon/>}>
                Button with Icon
            </Button>
        </div>
    );
}

```

## Full Width

The `fullWidth` prop makes the button expand to take up the full width of its container.

```tsx
import React from "react";
import { Button } from "@firecms/ui";

export default function FullWidthButtonDemo() {
    return (
        <Button fullWidth>
            Full Width Button
        </Button>
    );
}

```

## Custom Class Name

The `className` prop allows you to pass custom CSS classes to the button component.

```tsx
import React from "react";
import { Button } from "@firecms/ui";

export default function CustomClassNameButtonDemo() {
    return (
        <div className={"flex flex-row gap-4 items-center justify-center"}>
            <Button className="bg-red-500 hover:bg-red-600 border-red-600 hover:ring-red-600">
                Button with Custom Class
            </Button>
        </div>
    )
}

```

## Button Component Props

- `variant`: Defines the style variant of the button. Options are `"filled"`, `"outlined"`, or `"text"`. Defaults to `"filled"`.
- `disabled`: Disables the button, preventing user interaction. Defaults to `false`.
- `color`: Sets the color theme of the button. Options are `"primary"`, `"secondary"`, `"neutral"`, `"text"`, or `"error"`.
- `size`: Specifies the size of the button. Options are `"small"`, `"medium"`, `"large"`, `"xl"`, or `"2xl"`. Defaults to `"medium"`.
- `startIcon`: Adds an icon at the start of the button content.
- `fullWidth`: When `true`, the button will expand to fill its container's width. Defaults to `false`.
- `className`: Additional classes to apply to the button element.
- `onClick`: Handler function called when the button is clicked.
- `children`: Defines the button content, typically text or elements.
- `component`: Custom component to be used for rendering the button.
- `type`: The type attribute for the button, typically `"button"`, `"submit"`, or `"reset"`. Defaults to `"button"`.

