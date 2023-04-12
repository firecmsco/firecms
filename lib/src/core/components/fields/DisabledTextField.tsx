import React from "react";

import { Box, InputLabel, Typography } from "@mui/material";
import { fieldBackgroundDisabled } from "../../../form/field_bindings/utils";

export function DisabledTextField<T extends string | number>({
                                                                 label,
                                                                 value
                                                             }: {
    label: React.ReactNode,
    value: T
}) {
    return <Box sx={{
        position: "relative",
        background: fieldBackgroundDisabled,
        borderRadius: "4px",
        maxWidth: "100%",
        minHeight: "64px",
        color: theme => theme.palette.text.disabled
    }}>
        <InputLabel
            shrink={Boolean(value)}
            sx={{
                position: "absolute",
                left: 0,
                top: "4px",
                pointerEvents: "none"
            }}
            variant={"filled"}>{label}</InputLabel>
        <Box sx={{
            padding: "32px 12px 8px 12px"
        }}>
            <Typography variant={"body1"}>{value}</Typography>
        </Box>
    </Box>;
}
