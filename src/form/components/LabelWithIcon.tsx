import React from "react";
import { Property } from "../../models";
import { getIconForProperty } from "../../core/util/property_icons";

interface LabelWithIconProps {
    property: Property<any>,
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
