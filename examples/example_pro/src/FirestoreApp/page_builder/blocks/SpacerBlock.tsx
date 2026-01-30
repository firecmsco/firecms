import React from "react";
import { cls } from "@firecms/ui";

export interface SpacerBlockProps {
    height: "xs" | "sm" | "md" | "lg" | "xl";
    showDivider: boolean;
}

const heightClasses = {
    xs: "h-4",
    sm: "h-8",
    md: "h-16",
    lg: "h-24",
    xl: "h-32"
};

export const SpacerBlock = ({
    height,
    showDivider
}: SpacerBlockProps): JSX.Element => {
    return (
        <div className={cls(
            "w-full flex items-center justify-center",
            heightClasses[height]
        )}>
            {showDivider && (
                <div className="w-full max-w-xl border-t border-gray-200 dark:border-gray-700" />
            )}
        </div>
    );
};

export const spacerBlockConfig = {
    label: "Spacer",
    category: "layout",
    defaultProps: {
        height: "md" as const,
        showDivider: false
    },
    fields: {
        height: {
            type: "select" as const,
            label: "Height",
            options: [
                { label: "Extra Small", value: "xs" },
                { label: "Small", value: "sm" },
                { label: "Medium", value: "md" },
                { label: "Large", value: "lg" },
                { label: "Extra Large", value: "xl" }
            ]
        },
        showDivider: {
            type: "radio" as const,
            label: "Show Divider",
            options: [
                { label: "Yes", value: true },
                { label: "No", value: false }
            ]
        }
    }
};
