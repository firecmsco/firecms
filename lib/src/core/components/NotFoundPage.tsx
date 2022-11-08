import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { Link as ReactLink } from "react-router-dom";

export function NotFoundPage() {

    return (
        <Box
            display="flex"
            width={"100%"}
            height={"100%"}>
            <Box m="auto"
                 display="flex"
                 alignItems={"center"}
                 flexDirection={"column"}>
                <Typography variant={"h4"} align={"center"} gutterBottom={true}>
                    Page not found
                </Typography>
                <Typography align={"center"} gutterBottom={true}>
                    This page does not exist or you may not have access to it
                </Typography>
                <Button
                    component={ReactLink}
                    to={"/"}>Back to home</Button>
            </Box>
        </Box>
    );
}
