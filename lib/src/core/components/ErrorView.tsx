import React from "react";
import { ErrorTooltip } from "./ErrorTooltip";
import { Typography } from "../../components/Typography";
import { ErrorIcon } from "../../icons";

/**
 * @category Components
 */
export interface ErrorViewProps {
    title?: string;
    error: Error | React.ReactElement | string,
    tooltip?: string
}

/**
 * Generic error view. Displayed for example when an unexpected value comes
 * from the datasource in a collection view.
 * @param title
 * @param error
 * @param tooltip
 * @constructor
 * @category Components
 */
export function ErrorView({
                              title,
                              error,
                              tooltip
                          }: ErrorViewProps): React.ReactElement {
    const component = error instanceof Error ? error.message : error;

    const body = (
        <div
            className="flex items-center m-1">
            <ErrorIcon size={"small"} color={"error"}/>
            <div className="pl-2">
                {title && <Typography
                    variant={"body2"}
                    className="font-medium">{title}</Typography>}
                <Typography variant={"body2"}>{component}</Typography>
            </div>
        </div>
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
