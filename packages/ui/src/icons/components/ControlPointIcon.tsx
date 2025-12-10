import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ControlPointIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"control_point"} ref={ref}/>
});

ControlPointIcon.displayName = "ControlPointIcon";
