import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AirplanemodeInactiveIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"airplanemode_inactive"} ref={ref}/>
});

AirplanemodeInactiveIcon.displayName = "AirplanemodeInactiveIcon";
