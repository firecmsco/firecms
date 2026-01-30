import React from "react";
import { cls, Markdown } from "@firecms/ui";

export interface TextBlockProps {
    content: string;
    alignment: "left" | "center" | "right" | "justify";
    maxWidth: "narrow" | "medium" | "wide" | "full";
    paddingY: "small" | "medium" | "large";
}

const alignmentClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
    justify: "text-justify"
};

const maxWidthClasses = {
    narrow: "max-w-xl",
    medium: "max-w-3xl",
    wide: "max-w-5xl",
    full: "max-w-full"
};

const paddingClasses = {
    small: "py-4",
    medium: "py-8",
    large: "py-16"
};

export const TextBlock = ({
    content,
    alignment,
    maxWidth,
    paddingY
}: TextBlockProps): JSX.Element => {
    return (
        <div
            className={cls(
                "w-full px-8",
                paddingClasses[paddingY]
            )}
        >
            <div
                className={cls(
                    "mx-auto prose prose-slate dark:prose-invert",
                    alignmentClasses[alignment],
                    maxWidthClasses[maxWidth]
                )}
            >
                <Markdown source={content} />
            </div>
        </div>
    );
};

export const textBlockConfig = {
    label: "Text Content",
    category: "content",
    defaultProps: {
        content: "## Your Heading Here\n\nStart writing your content. You can use **bold**, *italic*, and other markdown formatting.\n\n- List item one\n- List item two\n- List item three",
        alignment: "left" as const,
        maxWidth: "medium" as const,
        paddingY: "medium" as const
    },
    fields: {
        content: {
            type: "textarea" as const,
            label: "Content (Markdown)"
        },
        alignment: {
            type: "select" as const,
            label: "Text Alignment",
            options: [
                { label: "Left", value: "left" },
                { label: "Center", value: "center" },
                { label: "Right", value: "right" },
                { label: "Justify", value: "justify" }
            ]
        },
        maxWidth: {
            type: "select" as const,
            label: "Content Width",
            options: [
                { label: "Narrow", value: "narrow" },
                { label: "Medium", value: "medium" },
                { label: "Wide", value: "wide" },
                { label: "Full", value: "full" }
            ]
        },
        paddingY: {
            type: "select" as const,
            label: "Vertical Padding",
            options: [
                { label: "Small", value: "small" },
                { label: "Medium", value: "medium" },
                { label: "Large", value: "large" }
            ]
        }
    }
};
