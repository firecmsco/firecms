import React from "react";

import { Box, Fade } from "@mui/material";

export function CenteredView({
                                 children,
                                 maxWidth,
                                 fullScreen = false,
                                 fadeTimeout = 800
                             }: {
    children: React.ReactNode;
    maxWidth?: number | string | object;
    fullScreen?: boolean,
    fadeTimeout?: number
}) {

    return (
        <Fade
            in={true}
            appear={true}
            timeout={fadeTimeout}
            mountOnEnter
            unmountOnExit>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    height: fullScreen ? "100vh" : "100%",
                    "@supports (height: 100dvh)": {
                        height: fullScreen ? "100dvh" : "100%"
                    },
                    justifyContent: !maxWidth ? "center" : undefined,
                    maxHeight: "100%",
                    gap: 2,
                    p: 2
                }}>
                {maxWidth && <Box sx={{
                    width: "100%",
                    margin: "auto",
                    maxWidth
                }}>
                    {children}
                </Box>}

                {!maxWidth && children}
            </Box>
        </Fade>
    );

}
