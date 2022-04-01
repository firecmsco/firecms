import { PropsWithChildren } from "react";

import { Box, Typography } from "@mui/material";
import { ExpandablePanel } from "../../core/components/ExpandablePanel";
import RuleIcon from "@mui/icons-material/Rule";

export function ValidationPanel({
                                    children
                                }: PropsWithChildren<{}>) {

    return (
        <ExpandablePanel title={
            <Box sx={(theme) => ({
                display: "flex",
                flexDirection: "row",
                color: theme.palette.text.secondary
            })}>
                <RuleIcon/>
                <Typography variant={"subtitle2"}
                            sx={(theme) => ({
                                ml: 2
                            })}>
                    Validation
                </Typography>
            </Box>
        }>
            {children}
        </ExpandablePanel>
    )
}
