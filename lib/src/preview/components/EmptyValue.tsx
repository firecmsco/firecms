import React from "react";
import { Box } from "@mui/material";

/**
 * @category Preview components
 */
export function EmptyValue() {

    return <Box sx={{
        borderRadius: "9999px",
        backgroundColor: "rgba(128,128,128,0.1)",
        width: "18px",
        height: "6px",
        display: "inline-block"
    }}/>;
}
