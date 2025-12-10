import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SwitchCameraIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"switch_camera"} ref={ref}/>
});

SwitchCameraIcon.displayName = "SwitchCameraIcon";
