import React from "react";
import { Box, Typography } from "@mui/material";

export function NotFoundPage() {

    return (
        <Box
            display="flex"
            width={"100%"}
            height={"100%"}>
            <Box m="auto">
                <Typography variant={"h1"} align={"center"}>404</Typography>
                <Typography align={"center"}>Page not found</Typography>
            </Box>
        </Box>
    );
}

