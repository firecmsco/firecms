import React from "react";
import { Markdown } from "@rebasepro/ui";

const markdownSource = `
# Markdown Example
This is a basic Markdown rendering.
- Bullet one
- Bullet two
`;

export default function MarkdownBasicDemo() {
    return <Markdown source={markdownSource} />;
}