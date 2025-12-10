import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CameraRollIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"camera_roll"} ref={ref}/>
});

CameraRollIcon.displayName = "CameraRollIcon";
