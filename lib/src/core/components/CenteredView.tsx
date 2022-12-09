import React from "react";

import { Box, Fade } from "@mui/material";

export function CenteredView({
                                 children,
                                 maxWidth,
                                 fullScreen = false
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
