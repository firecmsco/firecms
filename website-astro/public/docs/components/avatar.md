# Avatar


Avatars are visual placeholders for representing users or entities. They can contain images or initials and are commonly used in headers, lists, and anywhere user information is presented.

## Image Avatar

The `src` prop specifies the image URL for the avatar.

```tsx
import React from "react";
import { Avatar } from "@firecms/ui";

export default function AvatarImageDemo() {
    return (
        <Avatar
            src="https://avatars.githubusercontent.com/u/5120271?v=4"
            alt="User Name"
        />
    );
}

```

## Text Avatar

When the `src` prop is not provided, the avatar can display text such as user initials.

```tsx
import React from "react";
import { Avatar } from "@firecms/ui";

export default function AvatarTextDemo() {
    return (
        <Avatar>
            AB
        </Avatar>
    );
}

```

## Custom Styling

The `className` prop allows you to pass custom CSS classes to the avatar component.

```tsx
import React from "react";
import { Avatar } from "@firecms/ui";

export default function CustomStyleAvatarDemo() {
    return (
        <Avatar
            className="bg-red-500 dark:bg-red-700"
            // Example of custom size
            style={{ width: '80px', height: '80px' }}
        >
            CD
        </Avatar>
    );
}

```

