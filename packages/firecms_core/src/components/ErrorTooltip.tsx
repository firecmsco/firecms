import React from "react";
import { Tooltip, TooltipProps } from "@firecms/ui";

export function ErrorTooltip(props: TooltipProps) {
    return (
        <Tooltip {...props}
            className={props.className}
            tooltipClassName={"!text-red-500 bg-red-50"}>
            {props.children}
        </Tooltip>
    );
}
