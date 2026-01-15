import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WbShadeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"wb_shade"} ref={ref}/>
});

WbShadeIcon.displayName = "WbShadeIcon";
