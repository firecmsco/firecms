import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ScreenLockPortraitIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"screen_lock_portrait"} ref={ref}/>
});

ScreenLockPortraitIcon.displayName = "ScreenLockPortraitIcon";
