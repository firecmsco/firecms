import React from "react";

import { Box, Fade } from "@mui/material";

export function CenteredView({
                                 children,
                                 maxWidth = "100%",
                                 fullScreen = true
                             }: {
    children: React.ReactNode;
    maxWidth?: number | string;
    fullScreen?: boolean
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
                    height: fullScreen ? "100vh" : "100%",
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
