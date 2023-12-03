import React from "react";

interface LabelWithIconProps {
    icon: React.ReactNode;
    title?: string;
    small?: boolean;
    className?: string;
    required?: boolean;
}

/**
 * Render the label of a form field for a given property, with the corresponding
 * icon.
 * @group Form custom fields
 */
export function LabelWithIcon({
                                  icon,
                                  title,
                                  small,
                                  className,
                                  required
                              }: LabelWithIconProps) {
    return (
        <span
            className={`inline-flex items-center my-0.5  ${small ? "gap-1" : "gap-2"} ${className ?? ""}`}>

            {icon}

            <span
                className={`font-medium text-${small ? "base" : "sm"} origin-top-left transform ${small ? "translate-x-2 scale-75" : ""}`}>{(title ?? "") + (required ? " *" : "")}</span>

        </span>
    );
}
