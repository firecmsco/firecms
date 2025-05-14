import React, { forwardRef } from "react";
import { cls } from "@firecms/ui";

interface LabelWithIconProps {
    icon: React.ReactNode;
    title?: string;
    small?: boolean;
    className?: string;
    required?: boolean;
}

/**
 * Render the label of with an icon and the title of a property
 * @group Form custom fields
 */
export const LabelWithIcon = forwardRef<HTMLDivElement, LabelWithIconProps>(
    ({
         icon,
         title,
         small,
         className,
         required
     }, ref) => {
        return (
            <div
                ref={ref}
                className={cls("align-middle inline-flex items-center my-0.5",
                    small ? "gap-1" : "gap-2",
                    className)}
            >
                {icon}
                <span
                    className={`text-start font-medium text-${small ? "base" : "sm"} origin-top-left transform ${
                        small ? "translate-x-2 scale-75" : ""
                    }`}
                >
          {(title ?? "") + (required ? " *" : "")}
        </span>
            </div>
        );
    }
);

LabelWithIcon.displayName = "LabelWithIcon";
