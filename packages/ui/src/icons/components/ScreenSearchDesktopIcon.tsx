import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ScreenSearchDesktopIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"screen_search_desktop"} ref={ref}/>
});

ScreenSearchDesktopIcon.displayName = "ScreenSearchDesktopIcon";
