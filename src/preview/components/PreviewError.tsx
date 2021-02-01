import React from "react";
import { useStyles } from "./styles";
import clsx from "clsx";
import ErrorIcon from "@material-ui/icons/Error";
import { Tooltip } from "@material-ui/core";

export function PreviewError({
                                 error,
                                 tooltip
                             }: { error: string, tooltip?: string }): React.ReactElement {
    const classes = useStyles();
    const body = (
        <div
            className={clsx(classes.flexCenter, classes.smallMargin)}>
            <ErrorIcon fontSize={"small"} color={"error"}/>
            <div style={{
                marginLeft: 1
            }}>{error}</div>
        </div>
    );

    if (tooltip) {
        return (
            <Tooltip title={tooltip}>
                {body}
            </Tooltip>
        );
    }
    return body;
}
