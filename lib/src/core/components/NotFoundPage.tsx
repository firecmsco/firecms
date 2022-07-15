import React from "react";
import { Box, Typography } from "@mui/material";

export function NotFoundPage() {

    return (
        <Box
            display="flex"
            width={"100%"}
            height={"100%"}>
            <Box m="auto">
                <Typography variant={"h4"} align={"center"} gutterBottom={true}>
                    Page not found
                </Typography>
                <Typography align={"center"}>
                    This page does not exist or you may not have access to it
                </Typography>
            </Box>
        </Box>
    );
}

