import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RocketLaunchIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"rocket_launch"} ref={ref}/>
});

RocketLaunchIcon.displayName = "RocketLaunchIcon";
