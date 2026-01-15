import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LocalFloristIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"local_florist"} ref={ref}/>
});

LocalFloristIcon.displayName = "LocalFloristIcon";
