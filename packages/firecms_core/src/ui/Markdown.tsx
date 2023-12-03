import React, { useMemo } from "react";
import equal from "react-fast-compare"

// @ts-ignore
import MarkdownIt from "markdown-it";

export interface MarkdownProps {
    source: string,
    className?: string
}

const md = new MarkdownIt({ html: true, });
/**
 * @group Preview components
 */
export const Markdown = React.memo<MarkdownProps>(function Markdown({
                                                                        source,
                                                                        className
                                                                    }: MarkdownProps) {
        const html = useMemo(() => {
            return md.render(typeof source === "string" ? source : "");
        }, [source]);

        return <div
            className={className}
            dangerouslySetInnerHTML={{ __html: html }}
        />;
    }
    , equal) as React.FunctionComponent<MarkdownProps>;
