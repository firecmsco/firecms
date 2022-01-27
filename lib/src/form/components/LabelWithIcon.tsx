import React from "react";
import { Property, ResolvedProperty } from "../../models";
import { getIconForProperty } from "../../core/util/property_utils";

interface LabelWithIconProps {
    property: Property | ResolvedProperty,
}

/**
 * Render the label of a form field for a given property, with the corresponding
 * icon
 * @category Form custom fields
 */
export function LabelWithIcon({
                                  property
                              }: LabelWithIconProps) {

    return (
        <>
            <span style={{ paddingRight: "12px" }}>
                {getIconForProperty(property)}
            </span>
            <span>{property.title}</span>
        </>
    );
}
