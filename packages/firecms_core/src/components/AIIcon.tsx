import React from "react";
import { AutoAwesomeIcon } from "@firecms/ui";

export interface AIIconProps {
    size?: "smallest" | "small" | "medium" | "large";
    className?: string;
}

/**
 * AI-styled AutoAwesome icon with gradient coloring.
 * Used consistently across AI features for visual identification.
 */
export function AIIcon({ size = "small", className }: AIIconProps) {
    return (
        <AutoAwesomeIcon
            size={size}
            className={className}
            style={{
                background: "linear-gradient(to right, var(--fcms-primary), var(--fcms-secondary))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
            }}
        />
    );
}

/**
 * Small animated dot indicator for AI-modified elements.
 * Shows a pulsing gradient dot.
 */
export function AIModifiedIndicator({ className }: { className?: string }) {
    return (
        <div
            className={`w-2 h-2 rounded-full bg-gradient-to-r from-primary to-secondary animate-pulse ${className ?? ""}`}
            title="AI modified"
        />
    );
}
