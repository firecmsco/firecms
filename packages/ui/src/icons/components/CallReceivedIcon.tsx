import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CallReceivedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"call_received"} ref={ref}/>
});

CallReceivedIcon.displayName = "CallReceivedIcon";
