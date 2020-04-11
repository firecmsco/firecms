import { Box, CircularProgress } from "@material-ui/core";
import React from "react";

export function CircularProgressCenter() {
    return (
        <Box
            display="flex"
            width={"100%"} height={"100vh"}>
            <Box m="auto">
                <CircularProgress/>
            </Box>
        </Box>
    );
}
