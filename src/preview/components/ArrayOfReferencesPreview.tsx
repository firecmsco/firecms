import { ReferenceProperty } from "../../models";
import {
    PreviewComponentFactoryProps,
    PreviewComponentProps,
    PreviewSize
} from "../PreviewComponentProps";

import React from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { default as ReferencePreview } from "./ReferencePreview";

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            margin: 0.2,
        }
    })
);

export function ArrayOfReferencesPreview({
                                             name,
                                             value,
                                             property,
                                             size,
                                             entitySchema,
                                             PreviewComponent
                                         }: PreviewComponentProps<any[]> & PreviewComponentFactoryProps) {

    if (property.dataType !== "array" || property.of.dataType !== "reference")
        throw Error("Picked wrong preview component ArrayOfReferencesPreview");

    const classes = useStyles();
    const childSize: PreviewSize = size === "regular" ? "small" : "tiny";

    return (
        <>
            {value &&
            value.map((v, index) =>
                <div className={classes.root} key={`preview_array_ref_${name}_${index}`}>
                    <ReferencePreview
                        name={`${name}[${index}]`}
                        entitySchema={entitySchema}
                        size={childSize}
                        value={v}
                        property={property.of as ReferenceProperty}
                        PreviewComponent={PreviewComponent}
                    />
                </div>
            )}
        </>
    );
}
