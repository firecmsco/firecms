import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MoveToInboxIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"move_to_inbox"} ref={ref}/>
});

MoveToInboxIcon.displayName = "MoveToInboxIcon";
