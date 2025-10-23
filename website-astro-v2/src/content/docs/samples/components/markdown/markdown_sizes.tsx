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