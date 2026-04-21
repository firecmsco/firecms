# Markdown


Markdown component allows rendering Markdown content with support for custom sizes and classes for personalized styling. It leverages the `markdown-it` library for conversion and supports HTML content within markdown.

## Usage

To use the `Markdown` component, import it from @firecms/ui and pass the `source` prop with the markdown content you want to display. Optionally, you can specify the `size` and `className` props to adjust the appearance.

## Basic Markdown

A simple markdown rendering example.

```tsx
import React from "react";
import { Markdown } from "@firecms/ui";

const markdownSource = `
# Markdown Example
This is a basic Markdown rendering.
- Bullet one
- Bullet two
`;

export default function MarkdownBasicDemo() {
    return <Markdown source={markdownSource} />;
}
```

## Markdown Sizes

Demonstrates how to adjust the size of the markdown text using the `size` prop.

```tsx
import React from "react";
import { Markdown } from "@firecms/ui";

const markdownSource = `
# Different Sizes
You can use the \`size\` prop to adjust the markdown size.
## Medium (default)
- Bullet one
- Bullet two
## Large
- Bullet one
- Bullet two
`;

export default function MarkdownSizeDemo() {
    return (
        <>
            <Markdown source={markdownSource} size="medium" />
            <Markdown source={markdownSource} size="large" />
        </>
    );
}
```

## Custom Styled Markdown

Illustrating the use of `className` prop to apply custom styles to the markdown component.

```tsx
import React from "react";
import { Markdown } from "@firecms/ui";

const markdownSource = `
# Custom Styled Markdown
You can apply custom styles using the \`className\` prop.
`;

export default function MarkdownCustomDemo() {
    return <Markdown source={markdownSource} className="p-4 rounded text-blue-500 bg-surface-100" />;
}

```

