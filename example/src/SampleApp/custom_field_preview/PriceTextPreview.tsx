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
        <div className={`${value ? "" : "text-sm text-[#838383]"}`}>
            {value ?? "Not available"}
        </div>
    );

};
