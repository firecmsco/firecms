import { alpha, Box, Breakpoint, Container } from "@mui/material";
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
    const component = maxWidth
        ? <Container maxWidth={maxWidth}>
            {children}
        </Container>
        : children;

    return <Box sx={(theme) => ({
        background: translucent ? theme.palette.mode === "light" ? "rgba(255,255,255,0.6)" : alpha(theme.palette.background.paper, 0.1) : undefined,
        backdropFilter: translucent ? "blur(8px)" : undefined,
        borderTop: `1px solid ${theme.palette.divider}`,
        py: 1,
        px: 2,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        position,
        bottom: 0,
        right: 0,
        left: 0,
        textAlign: "right",
        zIndex: 2,
        "& > *:not(:last-child)": {
            [theme.breakpoints.down("md")]: {
                mr: theme.spacing(1)
            },
            mr: theme.spacing(2)
        }
    })}
    >
        {component}
    </Box>;
}
