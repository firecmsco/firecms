# Card


Cards are surfaces that display content and actions on a single topic. They should be easy to scan for relevant and actionable information. Cards can be used for a wide variety of purposes including to display information, as clickable actions, or as interactive elements of the UI.

## Usage

Import the `Card` from `@firecms/ui` and wrap the content you wish to display on the card. You can also make the card clickable by providing an `onClick` handler.

## Basic Card

Represents the basic usage of a card for displaying content.

```tsx
import React from "react";
import { Card } from "@firecms/ui";

export default function CardBasicDemo() {
    return (
        <Card className={"p-4"}>
            Content within a basic card.
        </Card>
    );
}

```

## Clickable Card

Shows a card that has an onClick event, making it behave similar to a button.

```tsx
import React from "react";
import { Card } from "@firecms/ui";

export default function CardClickableDemo() {
    const handleClick = () => {
        console.log("Card clicked!");
    };

    return (
        <Card className={"p-4"} onClick={handleClick}>
            Clickable card content.
        </Card>
    );
}

```

## Custom Styling

Demonstrates how additional classes or styles can be applied to the card for custom appearance.

```tsx
import React from "react";
import { Card } from "@firecms/ui";

export default function CardCustomStyleDemo() {
    const styles = {
        padding: '20px',
        color: "red",
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    };

    return (
        <Card style={styles}>
            Card with custom styling.
        </Card>
    );
}

```

