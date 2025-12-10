import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GroupRemoveIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"group_remove"} ref={ref}/>
});

GroupRemoveIcon.displayName = "GroupRemoveIcon";
