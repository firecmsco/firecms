import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ShutterSpeedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"shutter_speed"} ref={ref}/>
});

ShutterSpeedIcon.displayName = "ShutterSpeedIcon";
