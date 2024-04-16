import React, { useMemo } from "react";
import equal from "react-fast-compare"

// @ts-ignore
import MarkdownIt from "markdown-it";
import { cn } from "../util";

export interface MarkdownProps {
    source: string,
    size?: "small" | "medium" | "large" | "xl" | "2xl";
    className?: string
}

const proseClasses = {
    small: "prose-sm text-sm",
    medium: "prose text-base",
    large: "prose-lg",
    xl: "prose-xl",
    "2xl": "prose-2xl"
};

const md = new MarkdownIt({ html: true });
/**
 * @group Preview components
 */
export const Markdown = React.memo<MarkdownProps>(function Markdown({
                                                                        source,
                                                                        className,
                                                                        size = "medium"
                                                                    }: MarkdownProps) {
        const html = useMemo(() => {
            return md.render(typeof source === "string" ? source : "");
        }, [source]);

        return <div
            className={cn(proseClasses[size], "dark:prose-invert prose-headings:font-title", className)}
            dangerouslySetInnerHTML={{ __html: html }}
        />;
    }
    , equal) as React.FunctionComponent<MarkdownProps>;
