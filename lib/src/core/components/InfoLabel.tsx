import { Box, useTheme } from "@mui/material";

export function InfoLabel({
                              children,
                              mode = "info"
                          }: { children: React.ReactNode, mode?: "info" | "warn" }) {

    const theme = useTheme();
    const background = mode === "info"
        ? (theme.palette.mode === "dark" ? "#193c47" : "#b9f4fe")
        : (theme.palette.mode === "dark" ? "#4d3800" : "#f9e3b9");

    return (
        <Box
            sx={(theme) => ({
                my: 3,
                py: 1,
                px: 2,
                borderRadius: 1,
                background
            })}>
            {children}
        </Box>
    )
}
