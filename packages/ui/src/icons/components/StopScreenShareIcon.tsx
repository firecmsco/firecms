import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const StopScreenShareIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"stop_screen_share"} ref={ref}/>
});

StopScreenShareIcon.displayName = "StopScreenShareIcon";
