import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AppsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"apps"} ref={ref}/>
});

AppsIcon.displayName = "AppsIcon";
