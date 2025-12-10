import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RttIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"rtt"} ref={ref}/>
});

RttIcon.displayName = "RttIcon";
