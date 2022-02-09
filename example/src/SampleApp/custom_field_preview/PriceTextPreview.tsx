import React, { ReactElement } from "react";
import { PreviewComponentProps } from "@camberi/firecms";
import Box from "@mui/material/Box";


export default function PriceTextPreview({
                                                 value, property, size, customProps
                                             }: PreviewComponentProps<number>)
    : ReactElement {

    return (
        <Box
            sx={{
                fontSize: value ? undefined : "small",
                color: value ? undefined : "#838383"
            }}>
            {value ?? "Not available"}
        </Box>
    );

}
