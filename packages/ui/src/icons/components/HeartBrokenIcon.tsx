import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HeartBrokenIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"heart_broken"} ref={ref}/>
});

HeartBrokenIcon.displayName = "HeartBrokenIcon";
