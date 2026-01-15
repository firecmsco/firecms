import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ScreenLockLandscapeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"screen_lock_landscape"} ref={ref}/>
});

ScreenLockLandscapeIcon.displayName = "ScreenLockLandscapeIcon";
