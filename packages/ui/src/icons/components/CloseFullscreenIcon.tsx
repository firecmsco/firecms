import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CloseFullscreenIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"close_fullscreen"} ref={ref}/>
});

CloseFullscreenIcon.displayName = "CloseFullscreenIcon";
