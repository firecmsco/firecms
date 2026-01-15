import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HistoryIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"history"} ref={ref}/>
});

HistoryIcon.displayName = "HistoryIcon";
