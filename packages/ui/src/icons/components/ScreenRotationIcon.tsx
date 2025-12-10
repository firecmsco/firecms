import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ScreenRotationIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"screen_rotation"} ref={ref}/>
});

ScreenRotationIcon.displayName = "ScreenRotationIcon";
