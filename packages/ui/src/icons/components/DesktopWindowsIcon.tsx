import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DesktopWindowsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"desktop_windows"} ref={ref}/>
});

DesktopWindowsIcon.displayName = "DesktopWindowsIcon";
