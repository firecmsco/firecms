import React, { useMemo } from "react";

// @ts-ignore
import MarkdownIt from "markdown-it";

export interface MarkdownProps {
    source: string
}

const md = new MarkdownIt({ html: true, });
/**
 * @category Preview components
 */
export const Markdown = React.memo<MarkdownProps>(function Markdown({
                                                                        source
                                                                    }: MarkdownProps) {
        const html = useMemo(() => {
            return md.render(typeof source === "string" ? source : "");
        }, [source]);

        return <div
            dangerouslySetInnerHTML={{ __html: html }}
        />;
    }
    , areEqual) as React.FunctionComponent<MarkdownProps>;

function areEqual(prevProps: MarkdownProps, nextProps: MarkdownProps) {
    return prevProps.source === nextProps.source;
}
