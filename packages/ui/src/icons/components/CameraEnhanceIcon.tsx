import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CameraEnhanceIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"camera_enhance"} ref={ref}/>
});

CameraEnhanceIcon.displayName = "CameraEnhanceIcon";
