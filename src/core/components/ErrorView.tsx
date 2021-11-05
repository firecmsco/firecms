import React from "react";
import clsx from "clsx";
import ErrorIcon from "@mui/icons-material/Error";
import { Theme, Tooltip } from "@mui/material";

import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        flexCenter: {
            display: "flex",
            alignItems: "center"
        },
        smallMargin: {
            margin: theme.spacing(1)
        },
        text: {
            paddingLeft: theme.spacing(1)
        }
    })
);

/**
 * @category Components
 */
export interface ErrorViewProps {
    error: string,
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
    const classes = useStyles();
    const body = (
        <div
            className={clsx(classes.flexCenter, classes.smallMargin)}>
            <ErrorIcon fontSize={"small"} color={"error"}/>
            <div className={classes.text}>{error}</div>
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
