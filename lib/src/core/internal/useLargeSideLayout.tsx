import { useMediaQuery, useTheme } from "@mui/material";

export function useLargeSideLayout() {
    const theme = useTheme();
    return useMediaQuery(theme.breakpoints.up("xl"));
}
