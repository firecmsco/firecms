import React from "react";
import TTypography from "../../migrated/TTypography";

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
 * @category Form custom fields
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
            className={`text-text-secondary dark:text-text-secondary-dark inline-flex items-center mb-0.5 ${small ? "gap-1" : "gap-1.5"} ${className ?? ""}`}>

            {icon}

            <TTypography component={"span"}
                         className={`font-medium text-${small ? "base" : "sm"} origin-top-left transform ${small ? "translate-x-2 scale-75" : ""}`}>{(title ?? "") + (required ? " *" : "")}</TTypography>

        </span>
    );
}
