import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BrowserNotSupportedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"browser_not_supported"} ref={ref}/>
});

BrowserNotSupportedIcon.displayName = "BrowserNotSupportedIcon";
