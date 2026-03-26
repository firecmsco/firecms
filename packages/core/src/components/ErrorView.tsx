import React from "react";
import { ErrorTooltip } from "./ErrorTooltip";
import { WarningIcon, Typography, Button } from "@rebasepro/ui";

/**
 * @group Components
 */
export interface ErrorViewProps {
    title?: string;
    error: Error | React.ReactElement | string,
    tooltip?: string,
    onRetry?: () => void;
}

/**
 * Generic error view. Displayed for example when an unexpected value comes
 * from the datasource in a collection view.
 * @param title
 * @param error
 * @param tooltip
 * @param onRetry

 * @group Components
 */
export function ErrorView({
    title,
    error,
    tooltip,
    onRetry
}: ErrorViewProps): React.ReactElement {
    const component = error instanceof Error ? error.message : error;
    console.warn("ErrorView", JSON.stringify(error))

    const body = (
        <div
            className="flex flex-col m-2">
            <div className="flex items-start">
                <WarningIcon className="mx-2 mt-0.5" size={"small"} color={"warning"} />
                <div className="pl-2">
                    {title && <Typography
                        variant={"body2"}
                        className="font-medium text-text-primary">{title}</Typography>}
                    <Typography variant={"body2"} className="text-text-secondary">{component}</Typography>
                    {onRetry && (
                        <div className="mt-3">
                            <Button
                                variant="text"
                                size="small"
                                onClick={onRetry}
                                className="text-text-secondary hover:text-text-primary px-2 min-w-0"
                            >
                                Try again
                            </Button>
                        </div>
                    )}
                </div>
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
