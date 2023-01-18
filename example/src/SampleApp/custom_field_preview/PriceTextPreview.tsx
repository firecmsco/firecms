import React from "react";
import { PropertyPreviewProps } from "firecms";
import Box from "@mui/material/Box";

export default function PriceTextPreview({
                                             value,
                                             property,
                                             size,
                                             customProps,
                                             entity
                                         }: PropertyPreviewProps<number>) {

    return (
        <Box
            sx={{
                fontSize: value ? undefined : "small",
                color: value ? undefined : "#838383"
            }}>
            {value ?? "Not available"}
        </Box>
    );

};
