import { PreviewComponentProps, PreviewSize } from "../../preview";
import ErrorBoundary from "../../core/internal/ErrorBoundary";

import React from "react";

import { Divider } from "@material-ui/core";
import { PreviewComponent } from "../PreviewComponent";
import { useStyles } from "./styles";
import { Property } from "../../models";

export function ArrayPreview({
                                 name,
                                 value,
                                 property,
                                 size
                             }: PreviewComponentProps<any[]>) {

    if (!property.of) {
        throw Error(`You need to specify an 'of' prop (or specify a custom field) in your array property ${name}`);
    }

    const classes = useStyles();

    if (property.dataType !== "array")
        throw Error("Picked wrong preview component ArrayPreview");

    const values = value;

    if (!values) return null;

    const childSize: PreviewSize = size === "regular" ? "small" : "tiny";

    return (
        <>
            {values &&
            values.map((value, index) =>
                <React.Fragment key={"preview_array_" + value + "_" + index}>
                    <div className={classes.arrayItemBig}>
                        <ErrorBoundary>
                            <PreviewComponent
                                name={name}
                                value={value}
                                property={property.of as Property}
                                size={childSize}/>
                        </ErrorBoundary>
                    </div>
                    {index < values.length - 1 && <Divider/>}
                </React.Fragment>
            )}
        </>
    );
}
