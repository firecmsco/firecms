import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SummarizeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"summarize"} ref={ref}/>
});

SummarizeIcon.displayName = "SummarizeIcon";
