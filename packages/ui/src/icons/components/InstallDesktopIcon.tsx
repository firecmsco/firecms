import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const InstallDesktopIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"install_desktop"} ref={ref}/>
});

InstallDesktopIcon.displayName = "InstallDesktopIcon";
