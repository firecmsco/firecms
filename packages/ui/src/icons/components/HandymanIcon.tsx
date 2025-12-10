import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HandymanIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"handyman"} ref={ref}/>
});

HandymanIcon.displayName = "HandymanIcon";
