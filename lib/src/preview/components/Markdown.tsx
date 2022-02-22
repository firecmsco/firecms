import React from "react";

import MarkdownPreview from "@uiw/react-markdown-preview";

export interface MarkdownProps {
    source: string
}

/**
 * @category Preview components
 */
export const Markdown = React.memo<MarkdownProps>(MarkdownInternal, areEqual) as React.FunctionComponent<MarkdownProps>;

function areEqual(prevProps: MarkdownProps, nextProps: MarkdownProps) {
    return prevProps.source === nextProps.source;
}

function MarkdownInternal({
                              source
                          }: MarkdownProps) {
    return <MarkdownPreview source={typeof source === "string" ? source : ""}
                            style={{
                                fontSize: "inherit",
                                lineHeight: "inherit",
                                fontFamily: "inherit"
                            }}
                            components={{
                                a: (props) => <a {...props}
                                                 onClick={(e) => e.stopPropagation()}
                                                 target="_blank">{props.children}</a>
                            }}
    />;
}

