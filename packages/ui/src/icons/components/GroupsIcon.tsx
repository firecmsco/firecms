import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GroupsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"groups"} ref={ref}/>
});

GroupsIcon.displayName = "GroupsIcon";
