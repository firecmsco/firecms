import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const OpenInBrowserIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"open_in_browser"} ref={ref}/>
});

OpenInBrowserIcon.displayName = "OpenInBrowserIcon";
