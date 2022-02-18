import { Box } from "@mui/material";

export function CustomDialogActions({
                                 children,
                             }: { children: React.ReactNode}) {
    return <Box sx={(theme) => ({
        background: theme.palette.mode === "light" ? "rgba(255,255,255,0.6)" : "rgba(255, 255, 255, 0)",
        backdropFilter: "blur(4px)",
        borderTop: `1px solid ${theme.palette.divider}`,
        py: 1,
        px: 2,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "end",
        position: "sticky",
        bottom: 0,
        textAlign: "right",
        "& > *:not(:last-child)": {
            [theme.breakpoints.down("md")]: {
                mr: theme.spacing(1)
            },
            mr: theme.spacing(2)
        }
    })}
    >

        {children}

    </Box>;
}
