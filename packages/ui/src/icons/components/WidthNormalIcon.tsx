import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WidthNormalIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"width_normal"} ref={ref}/>
});

WidthNormalIcon.displayName = "WidthNormalIcon";
