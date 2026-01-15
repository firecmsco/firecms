import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DesktopMacIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"desktop_mac"} ref={ref}/>
});

DesktopMacIcon.displayName = "DesktopMacIcon";
