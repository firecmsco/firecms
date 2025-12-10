import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FullscreenExitIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"fullscreen_exit"} ref={ref}/>
});

FullscreenExitIcon.displayName = "FullscreenExitIcon";
