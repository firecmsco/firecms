import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ToggleOnIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"toggle_on"} ref={ref}/>
});

ToggleOnIcon.displayName = "ToggleOnIcon";
