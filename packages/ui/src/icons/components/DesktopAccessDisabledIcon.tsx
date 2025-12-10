import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DesktopAccessDisabledIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"desktop_access_disabled"} ref={ref}/>
});

DesktopAccessDisabledIcon.displayName = "DesktopAccessDisabledIcon";
