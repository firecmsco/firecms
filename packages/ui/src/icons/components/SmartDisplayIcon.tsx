import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SmartDisplayIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"smart_display"} ref={ref}/>
});

SmartDisplayIcon.displayName = "SmartDisplayIcon";
