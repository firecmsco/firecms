import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ChildFriendlyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"child_friendly"} ref={ref}/>
});

ChildFriendlyIcon.displayName = "ChildFriendlyIcon";
