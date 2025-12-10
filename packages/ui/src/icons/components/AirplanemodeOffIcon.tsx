import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AirplanemodeOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"airplanemode_off"} ref={ref}/>
});

AirplanemodeOffIcon.displayName = "AirplanemodeOffIcon";
