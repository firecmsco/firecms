import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WebIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"web"} ref={ref}/>
});

WebIcon.displayName = "WebIcon";
