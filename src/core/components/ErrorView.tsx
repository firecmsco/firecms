import React from "react";
import clsx from "clsx";
import ErrorIcon from "@material-ui/icons/Error";
import { Theme, Tooltip } from "@material-ui/core";

import createStyles from "@material-ui/styles/createStyles";
import makeStyles from "@material-ui/styles/makeStyles";

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

export type ErrorViewProps = { error: string, tooltip?: string };
/**
 * Generic error view. Displayed for example when an unexpected value comes
 * from Firestore in a collection view.
 * @param error
 * @param tooltip
 * @constructor
 * @category Core components
 */
export default function ErrorView({
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
