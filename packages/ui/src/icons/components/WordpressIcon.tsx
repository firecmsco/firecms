import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WordpressIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"wordpress"} ref={ref}/>
});

WordpressIcon.displayName = "WordpressIcon";
