import React from "react";
import { Property } from "../../models";
import { getIconForProperty } from "../../util/property_icons";

interface LabelWithIconProps {
    property: Property<any>,
    scaledIcon?: boolean
}

/**
 * Render the label of a form field for a given property, with the corresponding
 * icon
 * @category Form custom fields
 */
export default function LabelWithIcon({
                                          property,
                                          scaledIcon
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
