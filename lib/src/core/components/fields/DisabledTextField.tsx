import React from "react";

import { Box, InputLabel, Typography, useTheme } from "@mui/material";
import { fieldBackgroundDisabled } from "../../util/field_colors";
import TTypography from "../../../migrated/TTypography";

export function DisabledTextField<T extends string | number>({
                                                                 label,
                                                                 small,
                                                                 value
                                                             }: {
    label: React.ReactNode,
    small?: boolean,
    value: T
}) {

    const theme = useTheme();

    return <Box
        className={`relative bg-${fieldBackgroundDisabled} rounded-${theme.shape.borderRadius} w-full ${small ? 'h-12' : 'h-16'} text-${theme.palette.text.disabled}`}>
        <InputLabel
            shrink={Boolean(value)}
            className="absolute text-gray-400 left-0 top-4 pointer-events-none"
            variant={"filled"}>{label}</InputLabel>
        <Box
            className={`p-8 overflow-auto ${label ? "pt-8 pb-2" : small ? "p-3" : "px-3"}`}>
            <TTypography variant={"body1"}
                         className="font-inherit">{value}</TTypography>
        </Box>
    </Box>;
}
