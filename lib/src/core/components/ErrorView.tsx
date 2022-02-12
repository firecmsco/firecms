import React from "react";
import ErrorIcon from "@mui/icons-material/Error";
import { Box, Tooltip } from "@mui/material";
import { ErrorTooltip } from "./ErrorTooltip";

/**
 * @category Components
 */
export interface ErrorViewProps {
    error: React.ReactElement | string,
    tooltip?: string
}

/**
 * Generic error view. Displayed for example when an unexpected value comes
 * from the datasource in a collection view.
 * @param error
 * @param tooltip
 * @constructor
 * @category Components
 */
export function ErrorView({
                              error,
                              tooltip
                          }: ErrorViewProps): React.ReactElement {

    const body = (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                margin: 1
            }}>
            <ErrorIcon fontSize={"small"} color={"error"}/>
            <Box sx={{
                paddingLeft: 2
            }}>{error}</Box>
        </Box>
    );

    if (tooltip) {
        return (
            <ErrorTooltip title={tooltip}>
                {body}
            </ErrorTooltip>
        );
    }
    return body;
}
