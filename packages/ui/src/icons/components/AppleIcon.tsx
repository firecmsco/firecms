import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AppleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"apple"} ref={ref}/>
});

AppleIcon.displayName = "AppleIcon";
