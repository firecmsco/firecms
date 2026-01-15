import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ScreenLockRotationIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"screen_lock_rotation"} ref={ref}/>
});

ScreenLockRotationIcon.displayName = "ScreenLockRotationIcon";
