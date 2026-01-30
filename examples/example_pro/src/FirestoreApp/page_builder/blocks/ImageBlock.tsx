import React from "react";
import { cls } from "@firecms/ui";

export interface ImageBlockProps {
    src: string;
    alt: string;
    caption: string;
    size: "small" | "medium" | "large" | "full";
    alignment: "left" | "center" | "right";
    rounded: boolean;
    shadow: boolean;
}

const sizeClasses = {
    small: "max-w-sm",
    medium: "max-w-xl",
    large: "max-w-3xl",
    full: "max-w-full w-full"
};

const alignmentContainerClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end"
};

export const ImageBlock = ({
    src,
    alt,
    caption,
    size,
    alignment,
    rounded,
    shadow
}: ImageBlockProps): JSX.Element => {
    if (!src) {
        return (
            <div className="w-full py-8 flex justify-center">
                <div className={cls(
                    "bg-gray-100 dark:bg-gray-800 flex items-center justify-center",
                    sizeClasses[size],
                    rounded && "rounded-lg",
                    "aspect-video w-full"
                )}>
                    <span className="text-gray-400 dark:text-gray-500">
                        Add an image URL
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className={cls(
            "w-full py-8 px-4 flex",
            alignmentContainerClasses[alignment]
        )}>
            <figure className={cls(sizeClasses[size])}>
                <img
                    src={src}
                    alt={alt}
                    className={cls(
                        "w-full h-auto object-cover",
                        rounded && "rounded-lg",
                        shadow && "shadow-lg"
                    )}
                />
                {caption && (
                    <figcaption className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                        {caption}
                    </figcaption>
                )}
            </figure>
        </div>
    );
};

export const imageBlockConfig = {
    label: "Image",
    category: "media",
    defaultProps: {
        src: "",
        alt: "Image description",
        caption: "",
        size: "medium" as const,
        alignment: "center" as const,
        rounded: true,
        shadow: true
    },
    fields: {
        src: {
            type: "text" as const,
            label: "Image URL"
        },
        alt: {
            type: "text" as const,
            label: "Alt Text"
        },
        caption: {
            type: "text" as const,
            label: "Caption"
        },
        size: {
            type: "select" as const,
            label: "Size",
            options: [
                { label: "Small", value: "small" },
                { label: "Medium", value: "medium" },
                { label: "Large", value: "large" },
                { label: "Full Width", value: "full" }
            ]
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
        rounded: {
            type: "radio" as const,
            label: "Rounded Corners",
            options: [
                { label: "Yes", value: true },
                { label: "No", value: false }
            ]
        },
        shadow: {
            type: "radio" as const,
            label: "Shadow",
            options: [
                { label: "Yes", value: true },
                { label: "No", value: false }
            ]
        }
    }
};
