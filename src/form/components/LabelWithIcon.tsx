import React from "react";
import { Property } from "../../models";

import { formStyles } from "../styles";
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

    const classes = formStyles();
    return (
        <span
            color={"textSecondary"}
            style={{ margin: "4px" }}
            className={classes.inputLabel}>
            <span style={scaledIcon ? {
                transform: "scale(0.75)",
                paddingRight: "12px"
            } : { paddingRight: "12px" }}>
                {getIconForProperty(property)}
            </span>
            <span>{property.title}</span>
        </span>
    );
}
