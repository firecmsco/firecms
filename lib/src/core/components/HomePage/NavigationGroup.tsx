import { Box, Divider, Typography } from "@mui/material";
import { PropsWithChildren } from "react";
import { ExpandablePanel } from "../ExpandablePanel";

export function NavigationGroup({
                                    children,
                                    group
                                }: PropsWithChildren<{ group: string | undefined }>) {
    return (
        <ExpandablePanel
            invisible={true}
            title={<Typography color={"textSecondary"}
                               className={"weight-500"}>
                {group?.toUpperCase() ?? "Ungrouped views".toUpperCase()}
            </Typography>}>

            <Box mb={2}>
                {children}
            </Box>
        </ExpandablePanel>
    );
}
