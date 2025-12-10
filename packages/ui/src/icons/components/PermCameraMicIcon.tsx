import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PermCameraMicIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"perm_camera_mic"} ref={ref}/>
});

PermCameraMicIcon.displayName = "PermCameraMicIcon";
