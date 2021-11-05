import React from "react";

import { Divider } from "@mui/material";

import { useStyles } from "./styles";
import { PreviewComponent } from "../PreviewComponent";
import { PreviewComponentProps, PreviewSize } from "../../preview";
import { ErrorBoundary } from "../../core/internal/ErrorBoundary";
import { Property } from "../../models";

/**
 * @category Preview components
 */
export function ArrayOneOfPreview({
                                      name,
                                      value,
                                      property,
                                      size
                                  }: PreviewComponentProps<any[]>) {

    if (property.dataType !== "array")
        throw Error("Picked wrong preview component ArrayPreview");

    if (!property.oneOf) {
        throw Error(`You need to specify an 'of' or 'oneOf' prop (or specify a custom field) in your array property ${name}`);
    }

    const classes = useStyles();
    const values = value;

    if (!values) return null;

    const childSize: PreviewSize = size === "regular" ? "small" : "tiny";

    const typeField = property.oneOf.typeField ?? "type";
    const valueField = property.oneOf.valueField ?? "value";
    const properties = property.oneOf.properties;

    return (
        <div className={classes.array}>
            {values &&
            values.map((value, index) =>
                <React.Fragment key={"preview_array_" + value + "_" + index}>
                    <div className={classes.arrayItemBig}>
                        <ErrorBoundary>
                            <PreviewComponent
                                name={name}
                                value={value[valueField]}
                                property={properties[value[typeField]] as Property<any>}
                                size={childSize}/>
                        </ErrorBoundary>
                    </div>
                    {index < values.length - 1 && <Divider/>}
                </React.Fragment>
            )}
        </div>
    );
}
