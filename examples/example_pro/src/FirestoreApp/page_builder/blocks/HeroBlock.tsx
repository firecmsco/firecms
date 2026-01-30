import React from "react";
import { Typography, Button, cls } from "@firecms/ui";

export interface HeroBlockProps {
    title: string;
    subtitle: string;
    alignment: "left" | "center" | "right";
    backgroundStyle: "gradient" | "solid" | "image";
    backgroundColor: string;
    gradientFrom: string;
    gradientTo: string;
    backgroundImage: string;
    textColor: "light" | "dark";
    showCTA: boolean;
    ctaText: string;
    ctaLink: string;
    minHeight: "small" | "medium" | "large";
}

const heightClasses = {
    small: "min-h-[300px]",
    medium: "min-h-[450px]",
    large: "min-h-[600px]"
};

const alignmentClasses = {
    left: "items-start text-left",
    center: "items-center text-center",
    right: "items-end text-right"
};

export const HeroBlock = ({
    title,
    subtitle,
    alignment,
    backgroundStyle,
    backgroundColor,
    gradientFrom,
    gradientTo,
    backgroundImage,
    textColor,
    showCTA,
    ctaText,
    ctaLink,
    minHeight
}: HeroBlockProps): JSX.Element => {
    const getBackgroundStyle = (): React.CSSProperties => {
        switch (backgroundStyle) {
            case "gradient":
                return {
                    background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`
                };
            case "image":
                return {
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                };
            case "solid":
            default:
                return {
                    backgroundColor
                };
        }
    };

    const textColorClass = textColor === "light"
        ? "text-white"
        : "text-gray-900 dark:text-gray-100";

    return (
        <div
            className={cls(
                "w-full flex flex-col justify-center px-8 py-16",
                heightClasses[minHeight],
                alignmentClasses[alignment]
            )}
            style={getBackgroundStyle()}
        >
            <div className="max-w-4xl">
                <h1 className={cls(
                    "text-4xl md:text-5xl lg:text-6xl font-bold mb-4",
                    textColorClass
                )}>
                    {title}
                </h1>
                {subtitle && (
                    <p className={cls(
                        "text-lg md:text-xl opacity-90 mb-8",
                        textColorClass
                    )}>
                        {subtitle}
                    </p>
                )}
                {showCTA && ctaText && (
                    <Button
                        variant="filled"
                        size="large"
                        component="a"
                        href={ctaLink}
                    >
                        {ctaText}
                    </Button>
                )}
            </div>
        </div>
    );
};

export const heroBlockConfig = {
    label: "Hero Section",
    category: "layout",
    defaultProps: {
        title: "Welcome to Our Site",
        subtitle: "Create beautiful landing pages with ease",
        alignment: "center" as const,
        backgroundStyle: "gradient" as const,
        backgroundColor: "#1e40af",
        gradientFrom: "#3b82f6",
        gradientTo: "#8b5cf6",
        backgroundImage: "",
        textColor: "light" as const,
        showCTA: true,
        ctaText: "Get Started",
        ctaLink: "#",
        minHeight: "medium" as const
    },
    fields: {
        title: {
            type: "text" as const,
            label: "Title"
        },
        subtitle: {
            type: "textarea" as const,
            label: "Subtitle"
        },
        alignment: {
            type: "select" as const,
            label: "Alignment",
            options: [
                { label: "Left", value: "left" },
                { label: "Center", value: "center" },
                { label: "Right", value: "right" }
            ]
        },
        backgroundStyle: {
            type: "select" as const,
            label: "Background Style",
            options: [
                { label: "Gradient", value: "gradient" },
                { label: "Solid Color", value: "solid" },
                { label: "Image", value: "image" }
            ]
        },
        backgroundColor: {
            type: "text" as const,
            label: "Background Color"
        },
        gradientFrom: {
            type: "text" as const,
            label: "Gradient From"
        },
        gradientTo: {
            type: "text" as const,
            label: "Gradient To"
        },
        backgroundImage: {
            type: "text" as const,
            label: "Background Image URL"
        },
        textColor: {
            type: "select" as const,
            label: "Text Color",
            options: [
                { label: "Light", value: "light" },
                { label: "Dark", value: "dark" }
            ]
        },
        showCTA: {
            type: "radio" as const,
            label: "Show CTA Button",
            options: [
                { label: "Yes", value: true },
                { label: "No", value: false }
            ]
        },
        ctaText: {
            type: "text" as const,
            label: "CTA Button Text"
        },
        ctaLink: {
            type: "text" as const,
            label: "CTA Button Link"
        },
        minHeight: {
            type: "select" as const,
            label: "Section Height",
            options: [
                { label: "Small", value: "small" },
                { label: "Medium", value: "medium" },
                { label: "Large", value: "large" }
            ]
        }
    }
};
