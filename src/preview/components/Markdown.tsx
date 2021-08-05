import React from "react";

import MarkdownPreview from "@uiw/react-markdown-preview";

type MarkdownProps = {
    source: string
};

/**
 * @category Preview components
 */
export default function Markdown({
                             source
                         }: MarkdownProps) {
    return <MarkdownPreview source={source}
                            components={{
                                a: (props) => <a {...props}
                                                 onClick={(e) => e.stopPropagation()}
                                                 target="_blank">{props.children}</a>
                            }}
    />;
}

