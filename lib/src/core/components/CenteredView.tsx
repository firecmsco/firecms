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
                className={`flex flex-col items-center ${fullScreen ? 'h-screen' : 'h-full'} ${!maxWidth ? 'justify-center' : ''} max-h-full space-y-2 p-2`}
                style={{
                    "@supports (height: 100dvh)": {
                        height: fullScreen ? "100dvh" : "100%"
                    }
                }}>
                {maxWidth &&
                    <Box className="w-full mx-auto" style={{ maxWidth }}>
                        {children}
                    </Box>}

                {!maxWidth && children}
            </Box>
        </Fade>
    );

}
