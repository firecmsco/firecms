import React from "react";
import { LabelWithIcon } from "./LabelWithIcon.js";
import { PropertyIdCopyTooltip } from "../../components/PropertyIdCopyTooltip.js";

interface LabelWithIconAndTooltip {
    icon: React.ReactNode;
    title?: string;
    small?: boolean;
    className?: string;
    required?: boolean;
    propertyKey: string
}

/**
 * Render the label of with an icon and the title of a property
 * @group Form custom fields
 */
export function LabelWithIconAndTooltip({
                                            propertyKey,
                                            className,
                                            ...props
                                        }: LabelWithIconAndTooltip) {
    return (
        <PropertyIdCopyTooltip propertyKey={propertyKey} className={className}>
            <LabelWithIcon {...props}/>
        </PropertyIdCopyTooltip>
    );
}
