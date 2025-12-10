import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GroupAddIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"group_add"} ref={ref}/>
});

GroupAddIcon.displayName = "GroupAddIcon";
