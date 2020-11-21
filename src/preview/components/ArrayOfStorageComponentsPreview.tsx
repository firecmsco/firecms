import {
    PreviewComponentFactoryProps,
    PreviewComponentProps,
    PreviewSize
} from "../PreviewComponentProps";

import React from "react";

import { Box } from "@material-ui/core";
import ErrorBoundary from "../../components/ErrorBoundary";
import { PreviewComponent } from "../PreviewComponent";


export function ArrayOfStorageComponentsPreview({
                                                    name,
                                                    value,
                                                    property,
                                                    size,
                                                    entitySchema,
                                                    PreviewComponent
                                                }: PreviewComponentProps<any[]> & PreviewComponentFactoryProps) {

    if (property.dataType !== "array" || property.of.dataType !== "string")
        throw Error("Picked wrong preview component ArrayOfStorageComponentsPreview");

    const childSize: PreviewSize = size === "regular" ? "small" : "tiny";

    return <Box
        display={"flex"}
        flexWrap="wrap">
        {value &&
        value.map((v, index) =>
            <Box m={0.2}
                 key={"preview_array_storage_" + name + v + index}>
                <ErrorBoundary>
                    <PreviewComponent
                        name={name}
                        value={v}
                        property={property}
                        size={childSize}
                        entitySchema={entitySchema}/>
                </ErrorBoundary>
            </Box>
        )}
    </Box>;
}
