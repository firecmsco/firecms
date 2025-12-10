import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AutoAwesomeMotionIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"auto_awesome_motion"} ref={ref}/>
});

AutoAwesomeMotionIcon.displayName = "AutoAwesomeMotionIcon";
