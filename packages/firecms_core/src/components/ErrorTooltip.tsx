import React from "react";
import { Tooltip, TooltipProps } from "../ui/Tooltip";

export function ErrorTooltip(props: TooltipProps) {
    return (
        <Tooltip {...props}
                 tooltipClassName={"!text-red-500 bg-red-50"}>
            {props.children}
        </Tooltip>
    );
}
