import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MobileScreenShareIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"mobile_screen_share"} ref={ref}/>
});

MobileScreenShareIcon.displayName = "MobileScreenShareIcon";
