import { Box, Divider, Typography } from "@mui/material";
import { PropsWithChildren } from "react";

export function NavigationGroup({
                                    children,
                                    group
                                }: PropsWithChildren<{ group: string | undefined }>) {
    return (
        <Box mt={6} mb={6}>

            <Typography color={"textSecondary"}
                        className={"weight-500"}>
                {group?.toUpperCase() ?? "Ungrouped views".toUpperCase()}
            </Typography>

            <Divider/>

            <Box mt={2}>
                {children}
            </Box>
        </Box>
    );
}
