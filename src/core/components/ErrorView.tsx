import React from "react";
import { styled } from '@mui/material/styles';
import clsx from "clsx";
import ErrorIcon from "@mui/icons-material/Error";
import { Theme, Tooltip } from "@mui/material";

const PREFIX = 'ErrorView';

const classes = {
    flexCenter: `${PREFIX}-flexCenter`,
    smallMargin: `${PREFIX}-smallMargin`,
    text: `${PREFIX}-text`
};

const StyledTooltip = styled(Tooltip)((
   { theme } : {
        theme: Theme
    }
) => ({
    [`& .${classes.flexCenter}`]: {
        display: "flex",
        alignItems: "center"
    },

    [`& .${classes.smallMargin}`]: {
        margin: theme.spacing(1)
    },

    [`& .${classes.text}`]: {
        paddingLeft: theme.spacing(2)
    }
}));



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

    const body = (
        <div
            className={clsx(classes.flexCenter, classes.smallMargin)}>
            <ErrorIcon fontSize={"small"} color={"error"}/>
            <div className={classes.text}>{error}</div>
        </div>
    );

    if (tooltip) {
        return (
            <StyledTooltip title={tooltip}>
                {body}
            </StyledTooltip>
        );
    }
    return body;
}
