import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MoreTimeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"more_time"} ref={ref}/>
});

MoreTimeIcon.displayName = "MoreTimeIcon";
