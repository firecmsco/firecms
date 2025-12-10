import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PanToolAltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"pan_tool_alt"} ref={ref}/>
});

PanToolAltIcon.displayName = "PanToolAltIcon";
