import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MoreVertIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"more_vert"} ref={ref}/>
});

MoreVertIcon.displayName = "MoreVertIcon";
