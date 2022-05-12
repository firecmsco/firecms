import React from "react";

import MarkdownPreview from "@uiw/react-markdown-preview";

export interface MarkdownProps {
    source: string
}

/**
 * @category Preview components
 */
export const Markdown = React.memo<MarkdownProps>(function Markdown({
                                                                        source
                                                                    }: MarkdownProps) {
        return <MarkdownPreview source={typeof source === "string" ? source : ""}
                                style={{
                                    fontSize: "inherit",
                                    lineHeight: "inherit",
                                    fontFamily: "inherit",
                                    color: "inherit",
                                    backgroundColor: "inherit",
                                }}
                                components={{
                                    a: (props) => <a {...props}
                                                     onClick={(e) => e.stopPropagation()}
                                                     target="_blank">{props.children}</a>
                                }}
        />;
    }
    , areEqual) as React.FunctionComponent<MarkdownProps>;

function areEqual(prevProps: MarkdownProps, nextProps: MarkdownProps) {
    return prevProps.source === nextProps.source;
}


