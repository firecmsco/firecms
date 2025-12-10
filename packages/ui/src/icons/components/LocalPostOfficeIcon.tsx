import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LocalPostOfficeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"local_post_office"} ref={ref}/>
});

LocalPostOfficeIcon.displayName = "LocalPostOfficeIcon";
