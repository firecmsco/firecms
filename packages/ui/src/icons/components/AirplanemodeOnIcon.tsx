import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AirplanemodeOnIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"airplanemode_on"} ref={ref}/>
});

AirplanemodeOnIcon.displayName = "AirplanemodeOnIcon";
