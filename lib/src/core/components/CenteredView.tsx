import React from "react";

import { Box, Fade } from "@mui/material";

export function CenteredView({
                                 children,
                                 maxWidth = 380
                             }: {
    children: React.ReactNode;
    maxWidth?: number;
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
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    maxHeight: "100%",
                    p: 2
                }}>
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "100%",
                    maxWidth,
                    gap: 2
                }}>

                    {children}

                </Box>
            </Box>
        </Fade>
    );

}
