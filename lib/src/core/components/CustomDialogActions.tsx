import { alpha, Box, Breakpoint, Container, useTheme } from "@mui/material";
import React from "react";

export function CustomDialogActions({
                                        children,
                                        position = "sticky",
                                        maxWidth,
                                        translucent = true
                                    }: {
    children: React.ReactNode,
    position?: "sticky" | "absolute",
    maxWidth?: Breakpoint,
    translucent?: boolean
}) {
    const theme = useTheme();

    const component = maxWidth
        ? <Container maxWidth={maxWidth}>
            {children}
        </Container>
        : children;

    return <div
        className={`border-t flex flex-row items-center justify-end py-1 px-2 ${position} bottom-0 right-0 left-0 text-right z-2`}
        style={{
            background: translucent
                ? theme.palette.mode === "light"
                    ? "rgba(255,255,255,0.6)"
                    : alpha(theme.palette.background.paper, 0.1)
                : undefined,
            backdropFilter: translucent ? "blur(8px)" : undefined,
            borderTopColor: theme.palette.divider,
        }}>
        {component}
    </div>;
}
