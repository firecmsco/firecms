import React from "react";

import { Divider, Theme } from "@mui/material";
import {
    PreviewComponent,
    PreviewComponentProps,
    PreviewSize
} from "../internal";
import { ErrorBoundary } from "../../core/internal/ErrorBoundary";
import { Property } from "../../models";

import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";

export const useStyles = makeStyles((theme: Theme) =>
    ({
        array: {
            display: "flex",
            flexDirection: "column"
        },
        arrayWrap: {
            display: "flex",
            flexWrap: "wrap"
        },
        arrayItemBig: {
            margin: theme.spacing(1)
        }
    })
);

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
                            {value && <PreviewComponent
                                name={name}
                                value={value[valueField]}
                                property={properties[value[typeField]] as Property<any>}
                                size={childSize}/>}
                        </ErrorBoundary>
                    </div>
                    {index < values.length - 1 && <Divider/>}
                </React.Fragment>
            )}
        </div>
    );
}
