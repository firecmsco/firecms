import React from "react";
import { Markdown } from "@firecms/ui";

const markdownSource = `
# Custom Styled Markdown
You can apply custom styles using the \`className\` prop.
`;

export default function MarkdownCustomDemo() {
    return <Markdown source={markdownSource} className="p-4 rounded text-blue-500 bg-gray-100" />;
}
