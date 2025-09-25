"use client";
import React, { useMemo } from "react";
import { deepEqual as equal } from "fast-equals"

// @ts-ignore
import MarkdownIt from "markdown-it";
import { cls } from "../util";

export interface MarkdownProps {
    source: string,
    size?: "small" | "medium" | "large" | "xl" | "2xl";
    className?: string
}

const proseClasses = {
    small: "prose-sm typography-body2",
    medium: "prose typography-body1",
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
            className={cls(proseClasses[size], "dark:prose-invert prose-headings:font-title", className)}
            dangerouslySetInnerHTML={{ __html: html }}
        />;
    }
    , equal) as React.FunctionComponent<MarkdownProps>;
