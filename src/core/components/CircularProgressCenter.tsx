import {
    Box,
    CircularProgress,
    CircularProgressProps
} from "@material-ui/core";
import React from "react";

export default function CircularProgressCenter(props: CircularProgressProps) {
    return (
        <Box
            display="flex"
            width={"100%"} height={"100vh"}>
            <Box m="auto">
                <CircularProgress {...props}/>
            </Box>
        </Box>
    );
}
