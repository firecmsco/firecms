import React, { ReactElement } from "react";
import {
    PreviewComponent,
    PreviewComponentProps,
    Property
} from "@camberi/firecms";
import { CustomShapedArrayProps } from "./CustomShapedArrayProps";
import { Box } from "@mui/material";

export default function CustomShapedArrayPreview({
                                                     value,
                                                     size,
                                                     customProps
                                                 }: PreviewComponentProps<any[], CustomShapedArrayProps>)
    : ReactElement {

    if (!customProps)
        throw Error("Properties not specified");

    const properties: Property[] = customProps.properties;

    return <div>
        {properties.map((property, index) => (
            <Box m={0.5} key={`custom_shaped_array_${index}`}>
                <PreviewComponent
                    property={property}
                    value={value[index]}
                    size={size}/>
            </Box>
        ))}
    </div>;

}
