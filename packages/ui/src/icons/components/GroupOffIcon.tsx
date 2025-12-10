import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GroupOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"group_off"} ref={ref}/>
});

GroupOffIcon.displayName = "GroupOffIcon";
