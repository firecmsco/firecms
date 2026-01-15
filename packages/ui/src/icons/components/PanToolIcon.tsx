import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PanToolIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"pan_tool"} ref={ref}/>
});

PanToolIcon.displayName = "PanToolIcon";
