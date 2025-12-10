import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CameraOutdoorIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"camera_outdoor"} ref={ref}/>
});

CameraOutdoorIcon.displayName = "CameraOutdoorIcon";
