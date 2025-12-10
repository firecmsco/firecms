import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MarkunreadIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"markunread"} ref={ref}/>
});

MarkunreadIcon.displayName = "MarkunreadIcon";
