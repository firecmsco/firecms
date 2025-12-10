import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GroupIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"group"} ref={ref}/>
});

GroupIcon.displayName = "GroupIcon";
