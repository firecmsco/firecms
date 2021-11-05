import { Box, CircularProgress, CircularProgressProps } from "@mui/material";
import React from "react";

/**
 *
 * @param props
 * @constructor
 * @ignore
 */
export function CircularProgressCenter(props: CircularProgressProps) {
    return (
        <Box
            display="flex"
            width={"100%"}
            height={"100vh"}>
            <Box m="auto">
                <CircularProgress {...props}/>
            </Box>
        </Box>
    );
}
