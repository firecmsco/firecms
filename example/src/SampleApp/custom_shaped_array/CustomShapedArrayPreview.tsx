import React from "react";
import {
    Property,
    PropertyPreview,
    PropertyPreviewProps
} from "firecms";
import { CustomShapedArrayProps } from "./CustomShapedArrayProps";
import { Box } from "@mui/material";

export default function CustomShapedArrayPreview({
                                                     value,
                                                     size,
                                                     customProps
                                                 }: PropertyPreviewProps<any[], CustomShapedArrayProps>)
     {

    if (!customProps)
        throw Error("Properties not specified");

    const properties: Property[] = customProps.properties;

    return <div>
        {properties.map((property, index) => (
            <Box m={0.5} key={`custom_shaped_array_${index}`}>
                <PropertyPreview
                    property={property}
                    value={value[index]}
                    size={size}/>
            </Box>
        ))}
    </div>;

}
