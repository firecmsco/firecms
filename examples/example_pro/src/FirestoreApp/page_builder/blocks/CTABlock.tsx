import React from "react";
import { Button, cls } from "@firecms/ui";

export interface CTABlockProps {
    title: string;
    description: string;
    primaryButtonText: string;
    primaryButtonLink: string;
    secondaryButtonText: string;
    secondaryButtonLink: string;
    showSecondaryButton: boolean;
    backgroundColor: string;
    alignment: "left" | "center" | "right";
}

const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end"
};

export const CTABlock = ({
    title,
    description,
    primaryButtonText,
    primaryButtonLink,
    secondaryButtonText,
    secondaryButtonLink,
    showSecondaryButton,
    backgroundColor,
    alignment
}: CTABlockProps): JSX.Element => {
    return (
        <div
            className="w-full py-16 px-8"
            style={{ backgroundColor: backgroundColor || "transparent" }}
        >
            <div className={cls(
                "max-w-3xl mx-auto flex flex-col gap-4",
                alignmentClasses[alignment]
            )}>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {title}
                </h2>
                {description && (
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
                        {description}
                    </p>
                )}
                <div className="flex flex-wrap gap-4 mt-4">
                    {primaryButtonText && (
                        <Button
                            variant="filled"
                            size="large"
                            component="a"
                            href={primaryButtonLink}
                        >
                            {primaryButtonText}
                        </Button>
                    )}
                    {showSecondaryButton && secondaryButtonText && (
                        <Button
                            variant="outlined"
                            size="large"
                            component="a"
                            href={secondaryButtonLink}
                        >
                            {secondaryButtonText}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export const ctaBlockConfig = {
    label: "Call to Action",
    category: "actions",
    defaultProps: {
        title: "Ready to Get Started?",
        description: "Join thousands of users who are already using our product.",
        primaryButtonText: "Start Free Trial",
        primaryButtonLink: "#",
        secondaryButtonText: "Learn More",
        secondaryButtonLink: "#",
        showSecondaryButton: true,
        backgroundColor: "#f8fafc",
        alignment: "center" as const
    },
    fields: {
        title: {
            type: "text" as const,
            label: "Title"
        },
        description: {
            type: "textarea" as const,
            label: "Description"
        },
        primaryButtonText: {
            type: "text" as const,
            label: "Primary Button Text"
        },
        primaryButtonLink: {
            type: "text" as const,
            label: "Primary Button Link"
        },
        showSecondaryButton: {
            type: "radio" as const,
            label: "Show Secondary Button",
            options: [
                { label: "Yes", value: true },
                { label: "No", value: false }
            ]
        },
        secondaryButtonText: {
            type: "text" as const,
            label: "Secondary Button Text"
        },
        secondaryButtonLink: {
            type: "text" as const,
            label: "Secondary Button Link"
        },
        backgroundColor: {
            type: "text" as const,
            label: "Background Color"
        },
        alignment: {
            type: "select" as const,
            label: "Alignment",
            options: [
                { label: "Left", value: "left" },
                { label: "Center", value: "center" },
                { label: "Right", value: "right" }
            ]
        }
    }
};
