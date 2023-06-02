import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { Link as ReactLink } from "react-router-dom";
import TTypography from "../../migrated/TTypography";

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
                <TTypography variant={"h4"} align={"center"}
                             gutterBottom={true}>
                    Page not found
                </TTypography>
                <TTypography align={"center"} gutterBottom={true}>
                    This page does not exist or you may not have access to it
                </TTypography>
                <Button
                    component={ReactLink}
                    to={"/"}>Back to home</Button>
            </Box>
        </Box>
    );
}
