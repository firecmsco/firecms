import React from "react";
import Typography from "../../components/Typography";

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
            className={`inline-flex items-center mb-0.5 ${small ? "gap-1" : "gap-1.5"} ${className ?? ""}`}>

            {icon}

            <Typography component={"span"}
                        className={`font-medium text-${small ? "base" : "sm"} origin-top-left transform ${small ? "translate-x-2 scale-75" : ""}`}>{(title ?? "") + (required ? " *" : "")}</Typography>

        </span>
    );
}
