import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ForwardToInboxIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"forward_to_inbox"} ref={ref}/>
});

ForwardToInboxIcon.displayName = "ForwardToInboxIcon";
