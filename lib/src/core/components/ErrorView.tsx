import React from "react";
import ErrorIcon from "@mui/icons-material/Error";
import { Box } from "@mui/material";
import { ErrorTooltip } from "./ErrorTooltip";

/**
 * @category Components
 */
export interface ErrorViewProps {
    error: Error | React.ReactElement | string,
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
    const component = error instanceof Error ? error.message : error;

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
            }}>{component}</Box>
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
