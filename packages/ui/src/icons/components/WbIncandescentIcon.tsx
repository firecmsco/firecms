import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WbIncandescentIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"wb_incandescent"} ref={ref}/>
});

WbIncandescentIcon.displayName = "WbIncandescentIcon";
