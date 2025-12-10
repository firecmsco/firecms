import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ScreenRotationAltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"screen_rotation_alt"} ref={ref}/>
});

ScreenRotationAltIcon.displayName = "ScreenRotationAltIcon";
