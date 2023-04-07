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
            sx={{
                display: "flex",
                width: "100vw",
                maxHeight: "100%",
                maxWidth: "100%",
                height: "100vh",
                "@supports (height: 100dvh)": {
                    height: "100dvh"
                }
            }}>
            <Box m="auto">
                <CircularProgress {...props}/>
            </Box>
        </Box>
    );
}
