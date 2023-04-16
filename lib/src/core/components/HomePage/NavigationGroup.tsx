import { Box, Typography } from "@mui/material";
import { PropsWithChildren } from "react";
import { ExpandablePanel } from "../ExpandablePanel";
import {
    useUserConfigurationPersistence
} from "../../../hooks/useUserConfigurationPersistence";

export function NavigationGroup({
                                    children,
                                    group
                                }: PropsWithChildren<{ group: string | undefined }>) {
    const userConfigurationPersistence = useUserConfigurationPersistence();
    return (
        <ExpandablePanel
            invisible={true}
            initiallyExpanded={!(userConfigurationPersistence?.collapsedGroups ?? []).includes(group ?? "ungrouped")}
            onExpandedChange={expanded => {
                if (userConfigurationPersistence) {

                    if (!expanded) {
                        const paths = (userConfigurationPersistence.collapsedGroups ?? []).concat(group ?? "ungrouped");
                        userConfigurationPersistence.setCollapsedGroups(paths);
                    } else {
                        userConfigurationPersistence.setCollapsedGroups((userConfigurationPersistence.collapsedGroups ?? []).filter(g => g !== (group ?? "ungrouped")));
                    } }
            }}
            title={<Typography color={"textSecondary"}
                               className={"weight-500"}
                               sx={{ ml: 1 }}>
                {group?.toUpperCase() ?? "Ungrouped views".toUpperCase()}
            </Typography>}>

            <Box mb={2}>
                {children}
            </Box>
        </ExpandablePanel>
    );
}
