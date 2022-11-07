import React from "react";

import { Box, Fade } from "@mui/material";

export function CenteredView({
                                 children,
                                 maxWidth = "100%"
                             }: {
    children: React.ReactNode;
    maxWidth?: number | string;
}) {

    return (
        <Fade
            in={true}
            timeout={500}
            mountOnEnter
            unmountOnExit>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    height: "100vh",
                    maxHeight: "100%",
                    p: 2
                }}>
                <Box sx={{
                    width: "100%",
                    margin: "auto",
                    maxWidth
                }}>

                    {children}

                </Box>
            </Box>
        </Fade>
    );

}
